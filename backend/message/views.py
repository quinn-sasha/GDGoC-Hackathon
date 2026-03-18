import logging

from django.contrib.auth import get_user_model
from django.db.models import (
    Case,
    CharField,
    Count,
    DateTimeField,
    IntegerField,
    OuterRef,
    Subquery,
    Value,
    When,
)
from django.db.models.functions import Coalesce
from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import CursorPagination, PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Chatroom, ChatroomUser, Message
from .serializers import ConversationListSerializer, MessageSerializer
from .services import get_or_create_personal_chatroom

logger = logging.getLogger(__name__)


def _annotate_conversations(queryset, user):
    """会話一覧・単体取得用のクエリセットに last_message / unread_count を DB 集計で付加する。

    全メッセージをメモリにロードせず、Subquery / annotate でDB側で集計する。

    NOTE: last_message の各フィールド（id / content / created_at / sender_username）は
    それぞれ独立したサブクエリとして発行される（4本）。加えて unread_count 算出に
    total_msg_count・after_last_read_count・_my_last_read_id の3本が走り、合計最大7本となる。
    PostgreSQL が内部でキャッシュするケースが多く現状は許容範囲と判断している。
    最適化が必要な場合は JSONObject での集約を検討すること。
    """
    # 最新メッセージ取得用のベースクエリ（4フィールド分のサブクエリで共有）
    latest_msg = Message.objects.filter(chatroom=OuterRef("pk")).order_by("-created_at")

    # 全メッセージ数（_my_last_read_id が NULL のとき unread_count として使用）
    total_msg_count = Subquery(
        Message.objects.filter(chatroom=OuterRef("pk"))
        .order_by()
        .values("chatroom")
        .annotate(n=Count("pk"))
        .values("n")[:1],
        output_field=IntegerField(),
    )

    # last_read より後のメッセージ数（last_read が NULL のとき id__gt=NULL → 0 になるため Case で分岐）
    # NOTE: Step1 の _my_last_read_id と同じ ChatroomUser サブクエリを内包している。
    # OuterRef("_my_last_read_id") で参照することで重複を避けられるが、Django ORM のネスト制約から
    # 実装が複雑になるため意図的に重複を許容している（PostgreSQL が同一サブクエリをキャッシュする）。
    after_last_read_count = Subquery(
        Message.objects.filter(
            chatroom=OuterRef("pk"),
            id__gt=Subquery(
                ChatroomUser.objects.filter(
                    chatroom=OuterRef(OuterRef("pk")), user=user
                ).values("last_read_message_id")[:1]
            ),
        )
        .order_by()
        .values("chatroom")
        .annotate(n=Count("pk"))
        .values("n")[:1],
        output_field=IntegerField(),
    )

    return (
        queryset
        # Step 1: ユーザーの last_read_message_id を取得（Step2 の NULL チェック専用）
        # _my_last_read_id は内部実装用アノテーション。serializer から直接アクセスしないこと。
        .annotate(
            _my_last_read_id=Subquery(
                ChatroomUser.objects.filter(
                    chatroom=OuterRef("pk"), user=user
                ).values("last_read_message_id")[:1]
            )
        )
        # Step 2: last_message フィールドと unread_count をアノテート
        .annotate(
            last_message_id=Subquery(latest_msg.values("id")[:1]),
            last_message_content=Subquery(
                latest_msg.values("content")[:1], output_field=CharField()
            ),
            last_message_created_at=Subquery(
                latest_msg.values("created_at")[:1], output_field=DateTimeField()
            ),
            last_message_sender_username=Subquery(
                latest_msg.values("sender__username")[:1], output_field=CharField()
            ),
            unread_count=Case(
                When(
                    _my_last_read_id__isnull=True,
                    then=Coalesce(total_msg_count, Value(0)),
                ),
                default=Coalesce(after_last_read_count, Value(0)),
                output_field=IntegerField(),
            ),
        )
    )


class ConversationPageNumberPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class MessageCursorPagination(CursorPagination):
    ordering = "created_at"
    page_size = 50


class ConversationViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["メッセージ"],
        summary="会話一覧取得",
        responses={
            200: inline_serializer(
                name="PaginatedConversationList",
                fields={
                    "count": serializers.IntegerField(),
                    "next": serializers.CharField(allow_null=True),
                    "previous": serializers.CharField(allow_null=True),
                    "results": ConversationListSerializer(many=True),
                },
            )
        },
    )
    def list(self, request):
        chatrooms = _annotate_conversations(
            Chatroom.objects.filter(members__user=request.user)
            .select_related("project")
            .prefetch_related("members__user")
            .order_by("-updated_at"),
            request.user,
        )
        paginator = ConversationPageNumberPagination()
        page = paginator.paginate_queryset(chatrooms, request)
        serializer = ConversationListSerializer(
            page, many=True, context={"request": request}
        )
        return paginator.get_paginated_response(serializer.data)

    def _chatroom_response(self, chatroom_id, request, http_status):
        """単一チャットルームを annotate してシリアライズし Response を返すヘルパー。"""
        obj = _annotate_conversations(
            Chatroom.objects.filter(id=chatroom_id).prefetch_related("members__user"),
            request.user,
        ).first()
        if obj is None:
            return Response(
                {"detail": "チャットルームが見つかりません。"},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(
            ConversationListSerializer(obj, context={"request": request}).data,
            status=http_status,
        )

    @extend_schema(
        tags=["メッセージ"],
        summary="会話作成（個人チャット）",
        request=inline_serializer(
            name="ConversationCreateRequest",
            fields={"user_id": serializers.IntegerField()},
        ),
        responses={
            201: ConversationListSerializer,
            200: ConversationListSerializer,
            400: OpenApiResponse(description="バリデーションエラー"),
        },
    )
    def create(self, request):
        user_id = request.data.get("user_id")
        if user_id is None:
            return Response(
                {"detail": "user_id は必須です。"}, status=status.HTTP_400_BAD_REQUEST
            )

        if str(user_id) == str(request.user.id):
            return Response(
                {"detail": "自分自身とのチャットは作成できません。"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        User = get_user_model()
        try:
            other_user = User.objects.get(id=user_id)
        except (User.DoesNotExist, ValueError):
            return Response(
                {"detail": "指定されたユーザーが見つかりません。"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        chatroom_id, created = get_or_create_personal_chatroom(request.user, other_user)
        http_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return self._chatroom_response(chatroom_id, request, http_status)

    def _get_chatroom_for_member(self, pk, user):
        """チャットルームとメンバーシップを取得するヘルパー。
        Returns (chatroom, membership, error_response) のタプル。
        エラーがなければ error_response は None。
        """
        try:
            chatroom = Chatroom.objects.get(pk=pk)
        except Chatroom.DoesNotExist:
            return None, None, Response(
                {"detail": "チャットルームが見つかりません。"},
                status=status.HTTP_404_NOT_FOUND,
            )
        try:
            membership = chatroom.members.get(user=user)
        except ChatroomUser.DoesNotExist:
            return None, None, Response(
                {"detail": "このチャットルームへのアクセス権限がありません。"},
                status=status.HTTP_403_FORBIDDEN,
            )
        return chatroom, membership, None

    @extend_schema(
        methods=["get"],
        tags=["メッセージ"],
        summary="メッセージ一覧取得",
        responses={
            200: inline_serializer(
                name="CursorPaginatedMessageList",
                fields={
                    "next": serializers.CharField(allow_null=True),
                    "previous": serializers.CharField(allow_null=True),
                    "results": MessageSerializer(many=True),
                },
            ),
            403: OpenApiResponse(description="アクセス権限なし"),
            404: OpenApiResponse(description="チャットルームが見つかりません"),
        },
    )
    @extend_schema(
        methods=["post"],
        tags=["メッセージ"],
        summary="メッセージ送信",
        request=inline_serializer(
            name="MessageSendRequest",
            fields={"content": serializers.CharField()},
        ),
        responses={
            201: MessageSerializer,
            400: OpenApiResponse(description="バリデーションエラー"),
            403: OpenApiResponse(description="アクセス権限なし"),
            404: OpenApiResponse(description="チャットルームが見つかりません"),
        },
    )
    @action(detail=True, methods=["get", "post"], url_path="messages", url_name="messages")
    def messages(self, request, pk=None):
        chatroom, _, err = self._get_chatroom_for_member(pk, request.user)
        if err:
            return err

        if request.method == "GET":
            return self._list_messages(request, chatroom)
        return self._send_message(request, chatroom)

    def _list_messages(self, request, chatroom):
        msgs = chatroom.messages.select_related("sender").order_by("created_at")
        paginator = MessageCursorPagination()
        page = paginator.paginate_queryset(msgs, request)
        serializer = MessageSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def _send_message(self, request, chatroom):
        content = request.data.get("content", "").strip()
        if not content:
            return Response(
                {"detail": "content は必須です。"}, status=status.HTTP_400_BAD_REQUEST
            )
        if len(content) > 10000:
            return Response(
                {"detail": "content は10000文字以内にしてください。"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        message = Message.objects.create(
            chatroom=chatroom,
            sender=request.user,
            content=content,
        )
        # 送信者は自分のメッセージを既読扱いにする（unread_count を 0 に保つ）
        ChatroomUser.objects.filter(chatroom=chatroom, user=request.user).update(
            last_read_message_id=message.id
        )
        chatroom.save(update_fields=["updated_at"])

        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        tags=["メッセージ"],
        summary="既読マーク",
        responses={
            200: OpenApiResponse(description="既読処理成功"),
            403: OpenApiResponse(description="アクセス権限なし"),
            404: OpenApiResponse(description="チャットルームが見つかりません"),
        },
    )
    @action(detail=True, methods=["patch"], url_path="mark-read")
    def mark_read(self, request, pk=None):
        chatroom, membership, err = self._get_chatroom_for_member(pk, request.user)
        if err:
            return err

        # サブクエリで最新メッセージ ID を直接 DB に反映（追加 SELECT なし）
        ChatroomUser.objects.filter(pk=membership.pk).update(
            last_read_message_id=Subquery(
                Message.objects.filter(chatroom=chatroom)
                .order_by("-created_at")
                .values("id")[:1]
            )
        )

        return Response({"detail": "既読にしました。"}, status=status.HTTP_200_OK)
