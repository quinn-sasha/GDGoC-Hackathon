from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import TechSkill, UserSkill

User = get_user_model()


class TechSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = TechSkill
        fields = ["id", "name"]


class MyProfileSerializer(serializers.ModelSerializer):
    """自分のプロフィール（email を含む）"""

    skills = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "profile_bio",
            "github_url",
            "icon_image_path",
            "skills",
            "date_joined",
            "updated_at",
        ]
        read_only_fields = ["id", "email", "skills", "date_joined", "updated_at"]

    def get_skills(self, obj):
        qs = UserSkill.objects.filter(user=obj).select_related("skill")
        return TechSkillSerializer([us.skill for us in qs], many=True).data


class UserProfileSerializer(serializers.ModelSerializer):
    """他ユーザーのプロフィール（email 非公開）"""

    skills = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "profile_bio",
            "github_url",
            "icon_image_path",
            "skills",
            "date_joined",
        ]
        read_only_fields = fields

    def get_skills(self, obj):
        qs = UserSkill.objects.filter(user=obj).select_related("skill")
        return TechSkillSerializer([us.skill for us in qs], many=True).data
