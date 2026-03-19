from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from django.core.exceptions import ImproperlyConfigured
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse

from message.services import get_or_create_project_chatroom

from .models import Project, Application
from .serializers import (
    ProjectListSerializer,
    ProjectDetailSerializer,
    ProjectWriteSerializer,
    ApplicationSerializer,
    ApplicationDetailSerializer,
)

# ==========================================
# Custom Permission
# ==========================================


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    オブジェクトの作成者（オーナー）のみが編集・削除できるようにする権限クラス
    """

    def has_object_permission(self, request, view, obj):
        # GET, HEAD, OPTIONS などの読み取りリクエストは常に許可
        if request.method in permissions.SAFE_METHODS:
            return True
        # 書き込みリクエスト（PUT, PATCH, DELETE）は、オーナーにのみ許可
        return obj.owner == request.user


# ==========================================
# Project ViewSet
# ==========================================


@extend_schema_view(
    list=extend_schema(
        summary="プロジェクト一覧取得",
        description="登録されているプロジェクトの簡易情報を一覧で返します。最新の更新順に並んでいます。",
        responses={200: ProjectListSerializer(many=True)},
    ),
    retrieve=extend_schema(
        summary="プロジェクト詳細取得",
        description="指定されたUUIDを持つプロジェクトの全詳細情報を返します。技術スタックや保存数も含まれます。",
        responses={
            200: ProjectDetailSerializer,
            404: OpenApiResponse(description="プロジェクトが見つかりません"),
        },
    ),
    create=extend_schema(
        summary="新規プロジェクト作成",
        description="ログイン中のユーザーとして新しいプロジェクトを作成します。",
        request=ProjectWriteSerializer,
        responses={201: ProjectDetailSerializer},
    ),
)
class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["updated_at", "created_at"]
    ordering = ["-updated_at"]  # default

    def get_serializer_class(self):
        if self.action == "list":
            return ProjectListSerializer
        if self.action == "retrieve":
            return ProjectDetailSerializer
        return ProjectWriteSerializer

    def get_queryset(self):
        """
        N+1問題を防ぐため、アクションに応じてデータベースからのデータ事前取得（Eager Loading）を最適化する
        """
        queryset = super().get_queryset()
        # オーナー情報（ForeignKey）は一覧・詳細どちらでも使うので JOIN (select_related)
        queryset = queryset.select_related("owner")
        if self.action == "list":
            # 一覧表示では最低限のリレーションのみを取得
            queryset = queryset.prefetch_related("categories", "technologies")
            return queryset
        if self.action == "retrieve":
            # 詳細表示では全てのリレーションを取得
            queryset = queryset.prefetch_related(
                "categories", "technologies", "vibe_tags", "saved_by_users"
            )
            return queryset
        return queryset

    def perform_create(self, serializer):
        """
        プロジェクト作成時に、フロントエンドからの送信データではなく、
        認証済みのログインユーザーを強制的にオーナーとして保存する
        """
        serializer.save(owner=self.request.user)

    @extend_schema(
        summary="プロジェクトへの参加申請",
        description="ログイン中のユーザーが指定プロジェクトに参加申請します。重複申請はエラーになります。",
        request=ApplicationSerializer,
        responses={
            201: ApplicationSerializer,
            400: OpenApiResponse(description="すでに申請済み"),
        },
    )
    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def apply(self, request, pk=None):
        """
        プロジェクトへの参加申請
        POST /api/projects/{id}/apply/
        """
        project = self.get_object()
        if project.owner == request.user:
            return Response(
                {"detail": "自分のプロジェクトには応募できません。"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if Application.objects.filter(project=project, applicant=request.user).exists():
            return Response(
                {"detail": "すでにこのプロジェクトに申請済みです。"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = ApplicationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(project=project, applicant=request.user)
        chatroom_id, _ = get_or_create_project_chatroom(project, request.user)
        return Response(
            {**serializer.data, "chatroom_id": str(chatroom_id)},
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        summary="応募者一覧取得（オーナーのみ）",
        description="プロジェクトオーナーのみが応募者の詳細一覧を取得できます。",
        responses={
            200: ApplicationDetailSerializer(many=True),
            403: OpenApiResponse(description="オーナー以外はアクセス不可"),
        },
    )
    @action(
        detail=True, methods=["get"], permission_classes=[permissions.IsAuthenticated]
    )
    def applications(self, request, pk=None):
        """
        応募者一覧取得（オーナー専用）
        GET /api/projects/{id}/applications/
        """
        project = self.get_object()
        if project.owner != request.user:
            return Response(
                {"detail": "このプロジェクトのオーナーのみアクセスできます。"},
                status=status.HTTP_403_FORBIDDEN,
            )
        apps = (
            Application.objects.filter(project=project)
            .select_related("applicant")
            .order_by("created_at")
        )
        serializer = ApplicationDetailSerializer(apps, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="プロジェクト画像アップロード",
        description="プロジェクトのサムネイル画像を GCS にアップロードし、project_image_path を更新します。",
        responses={
            200: OpenApiResponse(description="アップロード成功"),
            400: OpenApiResponse(description="ファイルなし・形式エラー"),
            403: OpenApiResponse(description="オーナー以外は不可"),
            503: OpenApiResponse(description="GCS 未設定"),
        },
    )
    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated],
        parser_classes=[MultiPartParser],
        url_path="upload-image",
    )
    def upload_image(self, request, pk=None):
        """
        プロジェクト画像アップロード
        POST /api/projects/{id}/upload-image/  (multipart/form-data, field: image)
        """
        project = self.get_object()
        if project.owner != request.user:
            return Response(
                {"detail": "プロジェクトのオーナーのみ画像をアップロードできます。"},
                status=status.HTTP_403_FORBIDDEN,
            )
        file = request.FILES.get("image")
        if not file:
            return Response(
                {"detail": "image フィールドにファイルを添付してください。"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        allowed_types = {"image/jpeg", "image/png", "image/webp", "image/gif"}
        if file.content_type not in allowed_types:
            return Response(
                {"detail": "JPEG・PNG・WebP・GIF のみアップロードできます。"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if file.size > 5 * 1024 * 1024:
            return Response(
                {"detail": "ファイルサイズは 5MB 以内にしてください。"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        from config.gcs import upload_image as gcs_upload, build_project_image_path
        try:
            dest = build_project_image_path(str(project.id), file.name)
            url = gcs_upload(file, dest)
        except ImproperlyConfigured:
            return Response(
                {"detail": "画像ストレージが設定されていません。"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        project.project_image_path = url
        project.save(update_fields=["project_image_path"])
        return Response({"project_image_path": url}, status=status.HTTP_200_OK)

    @extend_schema(
        summary="お気に入り登録・解除",
        description="ログイン中のユーザーの「保存済みプロジェクト」を切り替えます。",
        responses={200: OpenApiResponse(description="成功")},
    )
    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def toggle_save(self, request, pk=None):
        """
        プロジェクトのお気に入り（保存）状態を切り替えるカスタムエンドポイント
        POST /api/projects/{id}/toggle_save/
        """
        project = self.get_object()
        user = request.user
        if project.saved_by_users.filter(id=user.id).exists():
            project.saved_by_users.remove(user)
            return Response(
                {"status": "unsaved", "is_saved": False}, status=status.HTTP_200_OK
            )
        project.saved_by_users.add(user)
        return Response(
            {"status": "saved", "is_saved": True}, status=status.HTTP_200_OK
        )
