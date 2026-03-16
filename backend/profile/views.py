from django.contrib.auth import get_user_model
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import generics, permissions

from .serializers import MyProfileSerializer, UserProfileSerializer

User = get_user_model()


@extend_schema(tags=["プロフィール"])
class MyProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/profile/me/ — 自分のプロフィール取得・更新"""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MyProfileSerializer
    http_method_names = ["get", "patch", "head", "options"]

    @extend_schema(
        summary="自分のプロフィールを取得",
        responses={200: MyProfileSerializer},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="自分のプロフィールを更新",
        request=MyProfileSerializer,
        responses={
            200: MyProfileSerializer,
            400: OpenApiResponse(description="バリデーションエラー"),
        },
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    def get_object(self):
        return (
            self.request.user.__class__.objects
            .prefetch_related("skills")
            .get(pk=self.request.user.pk)
        )


@extend_schema(tags=["プロフィール"])
class UserProfileView(generics.RetrieveAPIView):
    """GET /api/profile/{id}/ — 他ユーザーのプロフィール取得"""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer
    queryset = User.objects.filter(is_active=True).prefetch_related("skills")

    @extend_schema(
        summary="他ユーザーのプロフィールを取得",
        responses={
            200: UserProfileSerializer,
            404: OpenApiResponse(description="ユーザーが見つかりません"),
        },
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
