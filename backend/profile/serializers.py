from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from project.models import TechSkill as ProjectTechSkill

from .models import TechSkill, UserSkill

User = get_user_model()


class TechSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = TechSkill
        fields = ["id", "name"]


class MyProfileSerializer(serializers.ModelSerializer):
    """自分のプロフィール（email を含む）"""
    skills = serializers.SerializerMethodField()
    projects = serializers.SerializerMethodField()
    skill_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=ProjectTechSkill.objects.all(),
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
            "projects",
            "skill_ids",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "email", "updated_at"]

    @extend_schema_field(TechSkillSerializer(many=True))
    def get_skills(self, obj):
        # profile.TechSkill の name で project.TechSkill を引き当て、IDを統一する
        names = obj.skills.values_list("name", flat=True)
        project_skills = ProjectTechSkill.objects.filter(name__in=names)
        return TechSkillSerializer(project_skills, many=True).data

    def get_projects(self, obj):
        # Avoid top-level import to prevent potential circular imports
        from project.serializers import ProjectListSerializer
        # Include projects the user owns plus projects where the user
        # has an accepted application (i.e. is a participant).
        from project.models import Project, Application

        owned_qs = obj.projects.all()
        participating_qs = Project.objects.filter(
            applications__applicant=obj,
            applications__status=Application.Status.ACCEPTED,
        )
        qs = (owned_qs | participating_qs).distinct().order_by("-updated_at")
        return ProjectListSerializer(qs, many=True, context=self.context).data

    def update(self, instance, validated_data):
        project_skills = validated_data.pop("skill_ids", None)
        instance = super().update(instance, validated_data)
        if project_skills is not None:
            UserSkill.objects.filter(user=instance).delete()
            # project.TechSkill の name で profile.TechSkill を get_or_create してから UserSkill を作成
            profile_skills = [
                TechSkill.objects.get_or_create(name=ps.name)[0]
                for ps in project_skills
            ]
            UserSkill.objects.bulk_create([
                UserSkill(user=instance, skill=skill)
                for skill in profile_skills
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
        names = obj.skills.values_list("name", flat=True)
        project_skills = ProjectTechSkill.objects.filter(name__in=names)
        return TechSkillSerializer(project_skills, many=True).data
