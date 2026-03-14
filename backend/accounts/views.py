from django.conf import settings
from django.core.mail import send_mail
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import EmailVerificationToken, User
from .serializers import (
    GoogleAuthSerializer,
    LoginSerializer,
    UserRegistrationSerializer,
    VerifyEmailSerializer,
)


def get_tokens_for_user(user):
    """ユーザーに対して JWT アクセス/リフレッシュトークンを生成する"""
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


@extend_schema(tags=["認証"])
class RegisterView(APIView):
    """新規ユーザー登録 + 確認メール送信"""

    permission_classes = [AllowAny]

    @extend_schema(
        request=UserRegistrationSerializer,
        responses={
            201: OpenApiResponse(description="確認メールを送信しました"),
            400: OpenApiResponse(description="バリデーションエラー"),
        },
        summary="ユーザー登録",
        description="メールアドレス、ユーザー名とパスワードでユーザーを登録し、確認メールを送信します。",
    )
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # 確認トークン生成
        verification = EmailVerificationToken.objects.create(user=user)
        # 確認メール送信
        verify_url = f"{settings.FRONTEND_URL}/verify-email?token={verification.token}"
        send_mail(
            subject="【GDGoC Hackathon】メールアドレスの確認",
            message=(
                f"以下のリンクをクリックしてメールアドレスを確認してください。\n\n"
                f"{verify_url}\n\n"
                f"このリンクは24時間有効です。"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return Response(
            {
                "message": "確認メールを送信しました。メール内のリンクで認証を完了してください。"
            },
            status=status.HTTP_201_CREATED,
        )


@extend_schema(tags=["認証"])
class VerifyEmailView(APIView):
    """メールアドレス確認 + JWT 発行"""

    permission_classes = [AllowAny]

    @extend_schema(
        request=VerifyEmailSerializer,
        responses={
            200: OpenApiResponse(description="JWT トークンを返します"),
            400: OpenApiResponse(description="無効なトークンまたは有効期限切れ"),
        },
        summary="メールアドレス確認",
        description="メールに記載されたトークンを送信してメールアドレスを確認します。確認完了後に JWT を発行します。",
    )
    def post(self, request):
        serializer = VerifyEmailSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        verification = serializer.context["verification"]
        user = verification.user

        # ユーザーをアクティブ化
        user.is_active = True
        user.save()

        # 確認済みトークンを削除
        verification.delete()

        return Response(get_tokens_for_user(user), status=status.HTTP_200_OK)


@extend_schema(tags=["認証"])
class LoginView(APIView):
    """ログイン + JWT 発行"""

    permission_classes = [AllowAny]

    @extend_schema(
        request=LoginSerializer,
        responses={
            200: OpenApiResponse(description="JWT トークンを返します"),
            400: OpenApiResponse(description="認証失敗"),
        },
        summary="ログイン",
        description="メールアドレスとパスワードで認証し、JWT を発行します。",
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        return Response(get_tokens_for_user(user), status=status.HTTP_200_OK)


@extend_schema(tags=["認証"])
class GoogleAuthView(APIView):
    """Google ID トークン検証 + ユーザー作成/取得 + JWT 発行"""

    permission_classes = [AllowAny]

    @extend_schema(
        request=GoogleAuthSerializer,
        responses={
            200: OpenApiResponse(description="JWT トークンを返します"),
            400: OpenApiResponse(description="無効な Google ID トークン"),
        },
        summary="Google 認証",
        description="フロントエンドで取得した Google ID トークンを検証し、ユーザーを作成または取得して JWT を発行します。",
    )
    def post(self, request):
        serializer = GoogleAuthSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        email = serializer.context["google_email"]
        username_candidate = serializer.context["google_username"]
        # TODO: usernameがユニークであるかどうか検証する
        # ユーザー作成 or 取得（Google 認証ではパスワード不要）
        user, created = User.objects.get_or_create(
            username=username_candidate,
            email=email,
            defaults={"is_active": True},
        )
        if created:
            # 使用不可なランダムパスワードを設定
            user.set_unusable_password()
            user.save()
        elif not user.is_active:
            # 既存ユーザーが未アクティブの場合はアクティブ化
            user.is_active = True
            user.save()
        return Response(get_tokens_for_user(user), status=status.HTTP_200_OK)
