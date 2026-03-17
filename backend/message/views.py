from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
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

from .models import Chatroom, ChatroomUser, Message, PersonalChatroom
from .serializers import ConversationListSerializer, MessageSerializer


def _annotate_conversations(queryset, user):
    """会話一覧・単体取得用のクエリセットに last_message / unread_count を DB 集計で付加する。

    全メッセージをメモリにロードせず、Subquery / annotate でDB側で集計する。
    """
    # 最新メッセージ取得用のベースクエリ（4フィールド分のサブクエリで共有）
    latest_msg = Message.objects.filter(chatroom=OuterRef("pk")).order_by("-created_at")

    # 全メッセージ数（last_read_message が NULL のとき unread_count として使用）
    total_msg_count = Subquery(
        Message.objects.filter(chatroom=OuterRef("pk"))
        .order_by()
        .values("chatroom")
        .annotate(n=Count("pk"))
        .values("n")[:1],
        output_field=IntegerField(),
    )

    # last_read より後のメッセージ数（last_read が NULL のとき id__gt=NULL で 0 になるため Case で分岐）
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
        # Step 1: ユーザーの last_read_message_id を取得（NULL チェック用）
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
        responses={200: ConversationListSerializer(many=True)},
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

        # user1_id < user2_id に正規化してペアを一意に表現する
        u1_id, u2_id = sorted([request.user.id, other_user.id])

        # 既存ルームの確認
        try:
            personal = PersonalChatroom.objects.select_related("chatroom").get(
                user1_id=u1_id, user2_id=u2_id
            )
            chatroom_obj = _annotate_conversations(
                Chatroom.objects.filter(id=personal.chatroom_id).prefetch_related(
                    "members__user"
                ),
                request.user,
            ).first()
            serializer = ConversationListSerializer(
                chatroom_obj, context={"request": request}
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        except PersonalChatroom.DoesNotExist:
            pass

        # 新規作成。PersonalChatroom の unique_together が DB 制約として働き、
        # 同時リクエストによる重複作成は IntegrityError で検出できる。
        try:
            with transaction.atomic():
                chatroom = Chatroom.objects.create(room_type=Chatroom.RoomType.PERSONAL_CHAT)
                ChatroomUser.objects.create(chatroom=chatroom, user=request.user)
                ChatroomUser.objects.create(chatroom=chatroom, user=other_user)
                PersonalChatroom.objects.create(
                    chatroom=chatroom, user1_id=u1_id, user2_id=u2_id
                )
        except IntegrityError:
            # 競合：別リクエストが先に作成済み → 既存を返す
            # PersonalChatroom 以外の IntegrityError の場合は get() が DoesNotExist を上げるため再 raise する
            try:
                personal = PersonalChatroom.objects.select_related("chatroom").get(
                    user1_id=u1_id, user2_id=u2_id
                )
            except PersonalChatroom.DoesNotExist:
                raise
            chatroom_obj = _annotate_conversations(
                Chatroom.objects.filter(id=personal.chatroom_id).prefetch_related(
                    "members__user"
                ),
                request.user,
            ).first()
            serializer = ConversationListSerializer(
                chatroom_obj, context={"request": request}
            )
            return Response(serializer.data, status=status.HTTP_200_OK)

        chatroom_obj = _annotate_conversations(
            Chatroom.objects.filter(id=chatroom.id).prefetch_related("members__user"),
            request.user,
        ).first()
        serializer = ConversationListSerializer(
            chatroom_obj, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

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
            200: MessageSerializer(many=True),
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

        message = Message.objects.create(
            chatroom=chatroom,
            sender=request.user,
            content=content,
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

        latest_message = chatroom.messages.order_by("-created_at").first()
        membership.last_read_message = latest_message
        membership.save(update_fields=["last_read_message"])

        return Response({"detail": "既読にしました。"}, status=status.HTTP_200_OK)
