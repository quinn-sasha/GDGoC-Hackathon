from django.urls import path

from .views import HomeFeedView

urlpatterns = [
    path("", HomeFeedView.as_view(), name="home-feed"),
]
