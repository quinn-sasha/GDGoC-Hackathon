from rest_framework import generics, permissions
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

from project.models import Project
from project.serializers import ProjectListSerializer
from .pagination import SearchPagination
from .filters import ProjectSearchFilter

class ProjectSearchView(generics.ListAPIView):
    serializer_class = ProjectListSerializer
    pagination_class = SearchPagination
    permission_classes = [permissions.AllowAny]

    filter_backends = [DjangoFilterBackend]
    filterset_class = ProjectSearchFilter


    @extend_schema(
        summary="プロジェクト検索・絞り込み",
        description=(
                "キーワード、カテゴリー、技術タグ、進行状況を指定してプロジェクトを検索します。\n\n"
                "**【検索条件の組み合わせ仕様】**\n"
                "* **パラメータ間の関係（AND検索）**: `keyword`, `category`, `technology`, `status` を複数同時に指定した場合は、**すべての条件を満たす**プロジェクトを絞り込みます。\n"
                "* **パラメータ内の指定（OR検索）**: `category` や `technology` にカンマ区切りで複数の値を指定した場合（例: `?category=web,ai`）は、**指定した値のいずれかを含む**プロジェクトを検索します。\n"
                "* **キーワード検索**: タイトル、概要、オーナー名のいずれかに部分一致するものを検索します。"
        ),
        parameters=[
            OpenApiParameter("keyword", OpenApiTypes.STR, description="キーワード検索（タイトル、概要、オーナー名）", required=False),
            OpenApiParameter("category", OpenApiTypes.STR, description="カテゴリーのslug（カンマ区切り可 例: web,ai）", required=False),
            OpenApiParameter("technology", OpenApiTypes.STR, description="技術名（カンマ区切り可 例: python,react）", required=False),
            OpenApiParameter("status", OpenApiTypes.STR, description="進行ステータス（opening, ongoing, completed）", required=False),
        ]
    )
    def get_queryset(self):
        return (Project.objects.all().select_related("owner").
                prefetch_related("technologies", "categories")
                .distinct()
                .order_by("-updated_at"))