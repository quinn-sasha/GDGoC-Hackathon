from django.contrib.auth import get_user_model
from rest_framework import generics, permissions

from .serializers import MyProfileSerializer, UserProfileSerializer

User = get_user_model()


class MyProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/profile/me/ — 自分のプロフィール取得・更新"""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MyProfileSerializer
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        return self.request.user


class UserProfileView(generics.RetrieveAPIView):
    """GET /api/profile/{id}/ — 他ユーザーのプロフィール取得"""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer
    queryset = User.objects.filter(is_active=True)
