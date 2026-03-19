from datetime import timedelta
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response

from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse

from .models import Project
from .serializers import (
    ProjectListSerializer,
    ProjectDetailSerializer,
    ProjectWriteSerializer,
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

    @extend_schema(
        summary="推薦プロジェクト一覧取得",
        description="ユーザーのスキルやトレンドに合わせたプロジェクトを優先度順（スキルマッチ > 人気 > 新着）のフラットなリストとして返します。",
        responses={200: ProjectListSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        MAX_ITEMS_PER_CATEGORY = 10
        recommnede_projects = []
        base_queryset = self.get_queryset()
        unique_ids = set()
        # Skill Match
        if request.user.is_authenticated:
            user_skill_names = [name.strip().lower() for name in request.user.skills.values_list("name", flat=True)]
            if user_skill_names:
                skill_matching_projects = list(
                    base_queryset
                    .annotate(
                        skill_match_count=Count("technologies", filter=Q(technologies__name__in=user_skill_names))
                    )
                    .filter(skill_match_count__gt=0)
                    .order_by("-skill_match_count", "-updated_at")
                    .distinct()
                    [:MAX_ITEMS_PER_CATEGORY]
                )
                recommnede_projects.extend(skill_matching_projects)
                unique_ids |= {p.id for p in skill_matching_projects}
        # Popularity (直近二週間に更新されたプロジェクトの保存数）
        POPULAR_DAYS_LIMIT = 14
        since = timezone.now() - timedelta(days=POPULAR_DAYS_LIMIT)
        popular_projects = list(
            base_queryset
            .exclude(id__in=unique_ids)
            .filter(updated_at__gte=since)
            .annotate(popularity_score=Count("saved_by_users"))
            .order_by("-popularity_score", "-updated_at")
            [:MAX_ITEMS_PER_CATEGORY]
        )
        recommnede_projects.extend(popular_projects)
        unique_ids |= {p.id for p in popular_projects}
        # Recent Projects
        recent_projects = list(
            base_queryset
            .exclude(id__in=unique_ids)
            .order_by("-updated_at")
            [:MAX_ITEMS_PER_CATEGORY]
        )
        recommnede_projects.extend(recent_projects)

        serializer = ProjectListSerializer(recommnede_projects, many=True)
        return Response(serializer.data)
