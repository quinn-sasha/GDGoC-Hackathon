from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    # 認証エンドポイント
    path("api/auth/", include("accounts.urls")),
    path("api/projects/", include("project.urls")),
    # 各機能エンドポイント
    path("api/profile/", include("profile.urls")),
    path("api/", include("message.urls")),
    path("api/search/", include("search.urls")),
    # API ドキュメント
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]
