from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Prefetch
from django.utils import timezone
from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import CursorPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Chatroom, ChatroomUser, Message
from .serializers import ConversationListSerializer, MessageSerializer


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
        # messages_cache に全メッセージをprefetch。
        # get_last_message / get_unread_count はこのキャッシュを使うため N+1 が発生しない。
        chatrooms = (
            Chatroom.objects.filter(members__user=request.user)
            .select_related("project")
            .prefetch_related(
                "members__user",
                "members__last_read_message",
                Prefetch(
                    "messages",
                    queryset=Message.objects.select_related("sender").order_by("created_at"),
                    to_attr="messages_cache",
                ),
            )
            .order_by("-updated_at")
        )
        serializer = ConversationListSerializer(
            chatrooms, many=True, context={"request": request}
        )
        return Response(serializer.data)

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
        if not user_id:
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

        # 同時リクエストによる重複作成を防ぐため atomic + select_for_update でロック
        with transaction.atomic():
            existing = (
                Chatroom.objects.select_for_update()
                .filter(
                    room_type=Chatroom.RoomType.PERSONAL_CHAT,
                    members__user=request.user,
                )
                .filter(members__user=other_user)
                .first()
            )
            if existing:
                chatroom_with_prefetch = (
                    Chatroom.objects.filter(id=existing.id)
                    .prefetch_related("members__user", "members__last_read_message")
                    .first()
                )
                serializer = ConversationListSerializer(
                    chatroom_with_prefetch, context={"request": request}
                )
                return Response(serializer.data, status=status.HTTP_200_OK)

            chatroom = Chatroom.objects.create(room_type=Chatroom.RoomType.PERSONAL_CHAT)
            ChatroomUser.objects.create(chatroom=chatroom, user=request.user)
            ChatroomUser.objects.create(chatroom=chatroom, user=other_user)

        chatroom_with_prefetch = (
            Chatroom.objects.filter(id=chatroom.id)
            .prefetch_related("members__user", "members__last_read_message")
            .first()
        )
        serializer = ConversationListSerializer(
            chatroom_with_prefetch, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def _get_chatroom_for_member(self, pk, user):
        """チャットルームを取得し、メンバー確認も行うヘルパー。
        Returns (chatroom, error_response) のタプル。エラーがなければ error_response は None。
        """
        try:
            chatroom = Chatroom.objects.get(pk=pk)
        except Chatroom.DoesNotExist:
            return None, Response(
                {"detail": "チャットルームが見つかりません。"},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not chatroom.members.filter(user=user).exists():
            return None, Response(
                {"detail": "このチャットルームへのアクセス権限がありません。"},
                status=status.HTTP_403_FORBIDDEN,
            )
        return chatroom, None

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
        chatroom, err = self._get_chatroom_for_member(pk, request.user)
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
        Chatroom.objects.filter(id=chatroom.id).update(updated_at=timezone.now())

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
        try:
            chatroom = Chatroom.objects.get(pk=pk)
        except Chatroom.DoesNotExist:
            return Response(
                {"detail": "チャットルームが見つかりません。"},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            membership = chatroom.members.get(user=request.user)
        except ChatroomUser.DoesNotExist:
            return Response(
                {"detail": "このチャットルームへのアクセス権限がありません。"},
                status=status.HTTP_403_FORBIDDEN,
            )

        latest_message = chatroom.messages.order_by("-created_at").first()
        membership.last_read_message = latest_message
        membership.save(update_fields=["last_read_message"])

        return Response({"detail": "既読にしました。"}, status=status.HTTP_200_OK)
