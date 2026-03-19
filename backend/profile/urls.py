from django.urls import path

from .views import MyProfileView, TechSkillListView, UploadIconView, UserProfileView

urlpatterns = [
    path("me/", MyProfileView.as_view(), name="my-profile"),
    path("me/upload-icon/", UploadIconView.as_view(), name="upload-icon"),
    path("skills/", TechSkillListView.as_view(), name="skill-list"),
    path("<int:pk>/", UserProfileView.as_view(), name="user-profile"),
]
