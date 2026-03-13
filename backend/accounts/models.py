import uuid6

from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models

# TODO: 適切なヘルパー関数用のファイルに定義を書く
def generate_uuid7():
    return uuid6.uuid7()

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
    id = models.UUIDField(primary_key=True, default=generate_uuid7(), editable=False)
    username = models.CharField(max_length=30, unique=True)
    email = models.EmailField(unique=True)
    profile_bio = models.CharField(max_length=160, null=True, blank=True)
    github_url = models.URLField(null=True, blank=True)
    icon_image_path = models.CharField(max_length=255, null=True, blank=True)  # just store path, not full URL
    is_active = models.BooleanField(default=False, help_text="Became True after verified")
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username


class EmailVerificationToken(models.Model):
    """メール確認トークン（有効期限 24時間）"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="verification_token")
    token = models.UUIDField(default=generate_uuid7(), unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.token}"

    def is_valid(self):
        """トークンが 24時間以内かどうかを確認する"""
        from datetime import timedelta
        from django.utils import timezone
        return timezone.now() < self.created_at + timedelta(hours=24)