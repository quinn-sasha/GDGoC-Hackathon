from django.urls import path

from .views import MyProfileView, UserProfileView

urlpatterns = [
    path("me/", MyProfileView.as_view(), name="my-profile"),
    path("<int:pk>/", UserProfileView.as_view(), name="user-profile"),
]
