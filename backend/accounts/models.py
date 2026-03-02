import uuid

from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models


class UserManager(BaseUserManager):
    """カスタムユーザーマネージャー（email で認証）"""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("メールアドレスは必須です")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """メールアドレスで認証するカスタムユーザーモデル"""

    email = models.EmailField(unique=True, verbose_name="メールアドレス")
    is_active = models.BooleanField(
        default=False,
        verbose_name="アクティブ",
        help_text="メール確認後に True になります",
    )
    is_staff = models.BooleanField(default=False, verbose_name="スタッフ権限")
    date_joined = models.DateTimeField(auto_now_add=True, verbose_name="登録日時")

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = "ユーザー"
        verbose_name_plural = "ユーザー"

    def __str__(self):
        return self.email


class EmailVerificationToken(models.Model):
    """メール確認トークン（有効期限 24時間）"""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="verification_token",
        verbose_name="ユーザー",
    )
    token = models.UUIDField(default=uuid.uuid4, unique=True, verbose_name="トークン")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="作成日時")

    class Meta:
        verbose_name = "メール確認トークン"
        verbose_name_plural = "メール確認トークン"

    def __str__(self):
        return f"{self.user.email} - {self.token}"

    def is_valid(self):
        """トークンが 24時間以内かどうかを確認する"""
        from datetime import timedelta

        from django.utils import timezone

        return timezone.now() < self.created_at + timedelta(hours=24)
