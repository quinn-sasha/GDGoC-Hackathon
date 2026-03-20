from django.urls import path
from .views import ProjectSearchView

urlpatterns = [
    # config/urls.py 側で "api/search/" までルーティングされる想定なので、
    # ここは空文字 "" にしておきます。
    path("", ProjectSearchView.as_view(), name="project-search"),
]