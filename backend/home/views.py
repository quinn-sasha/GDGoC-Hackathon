from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from project.models import Project, TechCategory

from .serializers import HomeFeedSerializer

# セクションごとの最大件数
SECTION_MAX_ITEMS = 10
# 「人気」の対象とする直近N日
POPULAR_DAYS = 14
# skill_match セクションの末尾に混入するセレンディピティ件数
SERENDIPITY_COUNT = 2


class HomeFeedView(APIView):
    """
    ホームフィードを返す。
    - 検索パラメータなし: ユーザー状態に応じた推薦 sections を返す
    - ?search=xxx: 検索結果 section のみ返す
    - ?category / ?technology / ?status: 各 section に AND 条件で適用
    """

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @extend_schema(
        summary="ホームフィード取得（推薦 + 検索）",
        description=(
            "sections 形式でプロジェクト一覧を返す。"
            "search パラメータがある場合は検索モード（search_results セクションのみ）、"
            "ない場合はユーザー状態に応じた推薦フィードを返す。"
            "skill_match セクションはスキル設定済みの認証ユーザーにのみ返される。"
        ),
        parameters=[
            OpenApiParameter("search", str, description="title / description / username の部分一致"),
            OpenApiParameter("category", str, description="TechCategory.slug での絞り込み"),
            OpenApiParameter("technology", str, description="TechSkill.name での絞り込み"),
            OpenApiParameter(
                "status",
                str,
                description="progress_status（opening / ongoing / completed）",
            ),
        ],
        responses={200: HomeFeedSerializer},
    )
    def get(self, request):
        search = request.query_params.get("search", "").strip()
        category_slug = request.query_params.get("category", "").strip()
        technology_name = request.query_params.get("technology", "").strip()
        status = request.query_params.get("status", "").strip()

        base_qs = self._build_base_queryset(search, category_slug, technology_name, status)

        if search:
            sections = self._build_search_sections(base_qs, search)
        else:
            sections = self._build_recommendation_sections(base_qs, request.user)

        serializer = HomeFeedSerializer(
            {
                "categories": TechCategory.objects.all(),
                "sections": sections,
            },
            context={"request": request},
        )
        return Response(serializer.data)

    # ------------------------------------------------------------------
    # ベースクエリ（共通フィルタ）
    # ------------------------------------------------------------------

    def _build_base_queryset(self, search, category_slug, technology_name, status):
        qs = Project.objects.select_related("owner").prefetch_related(
            "categories", "technologies", "saved_by_users"
        )
        if search:
            qs = qs.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(owner__username__icontains=search)
            )
        if category_slug:
            qs = qs.filter(categories__slug=category_slug).distinct()
        if technology_name:
            qs = qs.filter(technologies__name=technology_name).distinct()
        if status:
            qs = qs.filter(progress_status=status)
        return qs

    # ------------------------------------------------------------------
    # 検索モード
    # ------------------------------------------------------------------

    def _build_search_sections(self, qs, search):
        projects = list(qs.order_by("-updated_at"))
        return [
            {
                "id": "search_results",
                "title": f"「{search}」の検索結果",
                "reason": "search",
                "reason_detail": f"{len(projects)}件ヒット",
                "projects": projects,
            }
        ]

    # ------------------------------------------------------------------
    # 推薦モード
    # ------------------------------------------------------------------

    def _build_recommendation_sections(self, base_qs, user):
        sections = []
        excluded_ids: set = set()

        # ---- skill_match（認証済み・スキルあり）----
        user_skill_names = self._get_user_skill_names(user)
        if user_skill_names:
            skill_qs = (
                base_qs.exclude(id__in=excluded_ids)
                .annotate(
                    skill_match_count=Count(
                        "technologies",
                        filter=Q(technologies__name__in=user_skill_names),
                    )
                )
                .filter(skill_match_count__gt=0)
                .order_by("-skill_match_count", "-updated_at")
                .distinct()
            )
            main_projects = list(skill_qs[: SECTION_MAX_ITEMS - SERENDIPITY_COUNT])
            excluded_ids |= {p.id for p in main_projects}

            # セレンディピティ: スキル外の新着を末尾に混入
            serendipity_projects = list(
                base_qs.exclude(id__in=excluded_ids).order_by("-updated_at")[
                    :SERENDIPITY_COUNT
                ]
            )
            excluded_ids |= {p.id for p in serendipity_projects}

            # 推薦理由: マッチしたスキル名を最大3つ
            reason_detail = f'{", ".join(user_skill_names[:3])} にマッチ'

            sections.append(
                {
                    "id": "skill_match",
                    "title": "あなたのスキルに合うプロジェクト",
                    "reason": "skill_match",
                    "reason_detail": reason_detail,
                    "projects": main_projects + serendipity_projects,
                }
            )

        # ---- popular（直近 POPULAR_DAYS 日以内）----
        since = timezone.now() - timedelta(days=POPULAR_DAYS)
        popular_projects = list(
            base_qs.exclude(id__in=excluded_ids)
            .filter(updated_at__gte=since)
            .annotate(
                popularity_score=Count("saved_by_users") + Count("applications")
            )
            .order_by("-popularity_score", "-updated_at")
            .distinct()[:SECTION_MAX_ITEMS]
        )
        excluded_ids |= {p.id for p in popular_projects}

        sections.append(
            {
                "id": "popular",
                "title": "人気のプロジェクト",
                "reason": "popular",
                "reason_detail": None,
                "projects": popular_projects,
            }
        )

        # ---- recent ----
        recent_projects = list(
            base_qs.exclude(id__in=excluded_ids)
            .order_by("-updated_at")
            .distinct()[:SECTION_MAX_ITEMS]
        )
        sections.append(
            {
                "id": "recent",
                "title": "最近の更新",
                "reason": "recent",
                "reason_detail": None,
                "projects": recent_projects,
            }
        )

        return sections

    # ------------------------------------------------------------------
    # ユーティリティ
    # ------------------------------------------------------------------

    def _get_user_skill_names(self, user) -> list[str]:
        """認証済みユーザーのスキル名を小文字正規化して返す。"""
        if not user or not user.is_authenticated:
            return []
        return [
            name.strip().lower()
            for name in user.skills.values_list("name", flat=True)
        ]
