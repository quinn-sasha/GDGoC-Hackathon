from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema_field
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
    skill_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=TechSkill.objects.all(),
        write_only=True,
        required=False,
    )
    created_at = serializers.DateTimeField(source="date_joined", read_only=True)

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
            "skill_ids",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "email", "updated_at"]

    @extend_schema_field(TechSkillSerializer(many=True))
    def get_skills(self, obj):
        return TechSkillSerializer(obj.skills.all(), many=True).data

    def update(self, instance, validated_data):
        skill_ids = validated_data.pop("skill_ids", None)
        instance = super().update(instance, validated_data)
        if skill_ids is not None:
            UserSkill.objects.filter(user=instance).delete()
            UserSkill.objects.bulk_create([
                UserSkill(user=instance, skill=skill)
                for skill in skill_ids
            ])
        return instance


class UserProfileSerializer(serializers.ModelSerializer):
    """他ユーザーのプロフィール（email 非公開）"""

    skills = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(source="date_joined", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "profile_bio",
            "github_url",
            "icon_image_path",
            "skills",
            "created_at",
        ]
        read_only_fields = fields

    @extend_schema_field(TechSkillSerializer(many=True))
    def get_skills(self, obj):
        return TechSkillSerializer(obj.skills.all(), many=True).data
