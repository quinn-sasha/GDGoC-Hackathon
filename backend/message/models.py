from django.conf import settings
from django.db import models
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
    # auto_now=True: chatroom.save() のたびに更新される設計。
    # メッセージ送信時は update_fields=["updated_at"] を指定して明示的に更新すること。
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")

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


class PersonalChatroom(models.Model):
    """PERSONAL_CHAT のユーザーペアを一意に管理する。
    user1_id < user2_id の正規化順序で保存し、unique_together により
    DB レベルで重複作成を防ぐ。
    """

    chatroom = models.OneToOneField(
        Chatroom,
        on_delete=models.CASCADE,
        related_name="personal_info",
        verbose_name="チャットルーム",
    )
    # user1_id < user2_id となるよう保存（create() で正規化すること）
    user1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="+",
        verbose_name="ユーザー1",
    )
    user2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="+",
        verbose_name="ユーザー2",
    )

    class Meta:
        verbose_name = "個人チャット"
        verbose_name_plural = "個人チャット"
        unique_together = [("user1", "user2")]
        constraints = [
            models.CheckConstraint(
                check=models.Q(user1__lt=models.F("user2")),
                name="personal_chatroom_user1_lt_user2",
            ),
        ]

    def __str__(self):
        return f"{self.user1.username} ↔ {self.user2.username}"
