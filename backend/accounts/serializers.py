from django.conf import settings
from django.contrib.auth import authenticate
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from rest_framework import serializers

from .models import EmailVerificationToken, User


class RegisterSerializer(serializers.Serializer):
    """ユーザー登録シリアライザー"""

    email = serializers.EmailField()
    password = serializers.CharField(
        min_length=8,
        write_only=True,
        style={"input_type": "password"},
    )

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("このメールアドレスは既に登録されています")
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
        )


class VerifyEmailSerializer(serializers.Serializer):
    """メールアドレス確認シリアライザー"""

    token = serializers.UUIDField()

    def validate_token(self, value):
        try:
            verification = EmailVerificationToken.objects.select_related("user").get(
                token=value
            )
        except EmailVerificationToken.DoesNotExist:
            raise serializers.ValidationError("無効なトークンです")

        if not verification.is_valid():
            raise serializers.ValidationError("トークンの有効期限が切れています（24時間以内に確認してください）")

        if verification.user.is_active:
            raise serializers.ValidationError("このメールアドレスは既に確認済みです")

        self.context["verification"] = verification
        return value


class LoginSerializer(serializers.Serializer):
    """ログインシリアライザー"""

    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    def validate(self, attrs):
        user = authenticate(
            request=self.context.get("request"),
            username=attrs["email"],
            password=attrs["password"],
        )
        if not user:
            raise serializers.ValidationError("メールアドレスまたはパスワードが正しくありません")
        if not user.is_active:
            raise serializers.ValidationError(
                "メールアドレスが確認されていません。確認メールをご確認ください"
            )
        attrs["user"] = user
        return attrs


class GoogleAuthSerializer(serializers.Serializer):
    """Google 認証シリアライザー"""

    id_token = serializers.CharField()

    def validate_id_token(self, value):
        try:
            idinfo = id_token.verify_oauth2_token(
                value,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except ValueError as e:
            raise serializers.ValidationError(f"無効な Google ID トークンです: {e}")

        email = idinfo.get("email")
        if not email:
            raise serializers.ValidationError("Google アカウントのメールアドレスを取得できませんでした")

        self.context["google_email"] = email
        return value
