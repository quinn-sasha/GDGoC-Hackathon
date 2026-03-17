from django.conf import settings
from django.db import models
from django.utils import timezone
from uuid6 import uuid7


class Chatroom(models.Model):
    class RoomType(models.TextChoices):
        PROJECT_CHAT = "PROJECT_CHAT", "プロジェクトチャット"
        PERSONAL_CHAT = "PERSONAL_CHAT", "個人チャット"

    id = models.UUIDField(primary_key=True, default=uuid7, editable=False)
    room_type = models.CharField(
        max_length=20,
        choices=RoomType.choices,
        verbose_name="ルームタイプ",
    )
    project = models.ForeignKey(
        "project.Project",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="chatrooms",
        verbose_name="プロジェクト",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="作成日時")
    # メッセージ送信時のみ更新する（views で queryset.update() を使うこと）。
    # chatroom.save() では自動更新されないので注意。
    updated_at = models.DateTimeField(default=timezone.now, verbose_name="更新日時")

    class Meta:
        verbose_name = "チャットルーム"
        verbose_name_plural = "チャットルーム"
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.room_type} ({self.id})"


class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid7, editable=False)
    chatroom = models.ForeignKey(
        Chatroom,
        on_delete=models.CASCADE,
        related_name="messages",
        verbose_name="チャットルーム",
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages",
        verbose_name="送信者",
    )
    content = models.CharField(max_length=10000, verbose_name="内容")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="送信日時")

    class Meta:
        verbose_name = "メッセージ"
        verbose_name_plural = "メッセージ"
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.sender.username}: {self.content[:30]}"


class ChatroomUser(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid7, editable=False)
    chatroom = models.ForeignKey(
        Chatroom,
        on_delete=models.CASCADE,
        related_name="members",
        verbose_name="チャットルーム",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="chatroom_memberships",
        verbose_name="ユーザー",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="参加日時")
    last_read_message = models.ForeignKey(
        Message,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        verbose_name="最後に既読したメッセージ",
    )

    class Meta:
        verbose_name = "チャットルームユーザー"
        verbose_name_plural = "チャットルームユーザー"
        unique_together = [("chatroom", "user")]

    def __str__(self):
        return f"{self.user.username} in {self.chatroom}"
