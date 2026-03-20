from django.contrib.auth import get_user_model
from django.core.exceptions import ImproperlyConfigured
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from project.models import TechSkill as ProjectTechSkill

from .models import TechSkill
from .serializers import MyProfileSerializer, TechSkillSerializer, UserProfileSerializer

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
        return self.request.user.__class__.objects.prefetch_related("skills").get(
            pk=self.request.user.pk
        )


@extend_schema(tags=["プロフィール"])
class TechSkillListView(generics.ListAPIView):
    """GET /api/profile/skills/ — 技術スキル一覧取得"""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TechSkillSerializer
    queryset = ProjectTechSkill.objects.all().order_by("name")

    @extend_schema(
        summary="技術スキル一覧を取得",
        responses={200: TechSkillSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


@extend_schema(tags=["プロフィール"])
class UploadIconView(APIView):
    """POST /api/profile/me/upload-icon/ — プロフィールアイコンを GCS にアップロード"""

    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser]

    @extend_schema(
        summary="プロフィールアイコンをアップロード",
        responses={
            200: OpenApiResponse(description="アップロード成功"),
            400: OpenApiResponse(description="ファイルなし・形式エラー"),
            503: OpenApiResponse(description="GCS 未設定"),
        },
    )
    def post(self, request):
        file = request.FILES.get("image")
        if not file:
            return Response(
                {"detail": "image フィールドにファイルを添付してください。"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        from config.gcs import (
            upload_image as gcs_upload,
            build_user_icon_path,
            validate_image_file,
        )
        from rest_framework.exceptions import ValidationError as DRFValidationError

        try:
            validate_image_file(file)
        except DRFValidationError as e:
            return Response({"detail": e.detail[0]}, status=status.HTTP_400_BAD_REQUEST)
        try:
            dest = build_user_icon_path(request.user.id, file.name)
            url = gcs_upload(file, dest)
        except ImproperlyConfigured:
            return Response(
                {"detail": "画像ストレージが設定されていません。"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        request.user.icon_image_path = url
        request.user.save(update_fields=["icon_image_path"])
        return Response({"icon_image_path": url}, status=status.HTTP_200_OK)


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
