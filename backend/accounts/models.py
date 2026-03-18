import uuid

from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models

class UserManager(BaseUserManager):
    """カスタムユーザーマネージャー（email で認証）"""
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError("メールアドレスは必須です")
        if not username:
            raise ValueError("ユーザー名は必須です")
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=30, unique=True)
    email = models.EmailField("メールアドレス", unique=True)
    profile_bio = models.CharField("プロフィール文", max_length=160, blank=True, default="")
    github_url = models.URLField("GitHub URL", max_length=255, blank=True, default="")
    icon_image_path = models.CharField("アイコン画像パス", max_length=255, blank=True, default="")
    skills = models.ManyToManyField(
        "profile.TechSkill",
        through="profile.UserSkill",
        blank=True,
        verbose_name="スキル",
    )
    is_active = models.BooleanField(
        "アクティブ",
        default=False,
        help_text="メール確認後に True になります",
    )
    is_staff = models.BooleanField("スタッフ権限", default=False)
    date_joined = models.DateTimeField("登録日時", auto_now_add=True)
    updated_at = models.DateTimeField("更新日時", auto_now=True)

    objects = UserManager()
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        verbose_name = "ユーザー"
        verbose_name_plural = "ユーザー"

    def __str__(self):
        return self.username


class EmailVerificationToken(models.Model):
    """メール確認トークン（有効期限 24時間）"""
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="verification_token",
        verbose_name="ユーザー",
    )
    token = models.UUIDField("トークン", default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField("作成日時", auto_now_add=True)

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
