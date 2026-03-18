import django.db.models.deletion
import django.utils.timezone
import uuid6
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("project", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Chatroom",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid6.uuid7,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "room_type",
                    models.CharField(
                        choices=[
                            ("PROJECT_CHAT", "プロジェクトチャット"),
                            ("PERSONAL_CHAT", "個人チャット"),
                        ],
                        max_length=20,
                        verbose_name="ルームタイプ",
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(auto_now_add=True, verbose_name="作成日時"),
                ),
                (
                    "updated_at",
                    models.DateTimeField(
                        default=django.utils.timezone.now, verbose_name="更新日時"
                    ),
                ),
                (
                    "project",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="chatrooms",
                        to="project.project",
                        verbose_name="プロジェクト",
                    ),
                ),
            ],
            options={
                "verbose_name": "チャットルーム",
                "verbose_name_plural": "チャットルーム",
                "ordering": ["-updated_at"],
            },
        ),
        migrations.CreateModel(
            name="Message",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid6.uuid7,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "content",
                    models.CharField(max_length=10000, verbose_name="内容"),
                ),
                (
                    "created_at",
                    models.DateTimeField(auto_now_add=True, verbose_name="送信日時"),
                ),
                (
                    "chatroom",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="messages",
                        to="message.chatroom",
                        verbose_name="チャットルーム",
                    ),
                ),
                (
                    "sender",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="sent_messages",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="送信者",
                    ),
                ),
            ],
            options={
                "verbose_name": "メッセージ",
                "verbose_name_plural": "メッセージ",
                "ordering": ["created_at"],
            },
        ),
        migrations.CreateModel(
            name="ChatroomUser",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid6.uuid7,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(auto_now_add=True, verbose_name="参加日時"),
                ),
                (
                    "chatroom",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="members",
                        to="message.chatroom",
                        verbose_name="チャットルーム",
                    ),
                ),
                (
                    "last_read_message",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="+",
                        to="message.message",
                        verbose_name="最後に既読したメッセージ",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="chatroom_memberships",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="ユーザー",
                    ),
                ),
            ],
            options={
                "verbose_name": "チャットルームユーザー",
                "verbose_name_plural": "チャットルームユーザー",
            },
        ),
        migrations.AlterUniqueTogether(
            name="chatroomuser",
            unique_together={("chatroom", "user")},
        ),
    ]
