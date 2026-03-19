import re
from rest_framework import serializers
from .models import Project, TechSkill, TechCategory, VibeTag, Application
from django.core.exceptions import ValidationError


class TechSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = TechSkill
        fields = ["id", "name"]
        read_only_fields = ["id"]


class TechCategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = TechCategory
        fields = ["id", "name", "slug"]
        read_only_fields = ["id", "name", "slug"]


class VibeTagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VibeTag
        fields = ["id", "name"]
        read_only_fields = ["id", "name"]


class ProjectListSerializer(serializers.ModelSerializer):
    owner_name = serializers.ReadOnlyField(source="owner.username")
    owner_icon = serializers.ReadOnlyField(source="owner.icon_image_path")
    technologies = serializers.SlugRelatedField(
        many=True, read_only=True, slug_field="name"
    )
    categories = serializers.SlugRelatedField(
        many=True, read_only=True, slug_field="name"
    )

    class Meta:
        model = Project
        fields = [
            "id",
            "owner_name",
            "owner_icon",
            "progress_status",
            "title",
            "project_image_path",
            "created_at",
            "updated_at",
            "technologies",
            "categories",
        ]
        read_only_fields = fields


class ProjectDetailSerializer(serializers.ModelSerializer):
    owner_name = serializers.ReadOnlyField(source="owner.username")
    owner_icon = serializers.ReadOnlyField(source="owner.icon_image_path")
    technologies = TechSkillSerializer(many=True, read_only=True)
    categories = TechCategoriesSerializer(many=True, read_only=True)
    vibe_tags = VibeTagsSerializer(many=True, read_only=True)
    # custom fields
    num_saved = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    is_applied = serializers.SerializerMethodField()

    def get_num_saved(self, obj):
        return obj.saved_by_users.count()

    def get_is_saved(self, obj):
        request = self.context.get("request")
        if not request:
            return False
        if not request.user.is_authenticated:
            return False
        return obj.saved_by_users.filter(id=request.user.id).exists()

    def get_is_applied(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.applications.filter(applicant=request.user).exists()

    class Meta:
        model = Project
        fields = [
            "id",
            "owner",
            "owner_name",
            "owner_icon",
            "progress_status",
            "title",
            "description",
            "project_image_path",
            "created_at",
            "updated_at",
            "technologies",
            "categories",
            "vibe_tags",
            "num_saved",
            "is_saved",
            "is_applied",
        ]
        read_only_fields = fields


class ProjectWriteSerializer(serializers.ModelSerializer):
    """
    プロジェクト作成・更新用シリアライザー
    """

    categories = serializers.SlugRelatedField(
        many=True,
        slug_field="slug",
        queryset=TechCategory.objects.all(),
        required=False,
    )
    vibe_tags = serializers.SlugRelatedField(
        many=True, slug_field="name", queryset=VibeTag.objects.all(), required=False
    )
    technologies = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        max_length=30,
        error_messages={"max_length": "登録できる技術スタックは最大30個までです。"},
    )

    def validate_technologies(self, value):
        valid_techs = []
        for tech in value:
            tech = tech.strip().lower()
            if not re.match(r"^[a-z0-9\s\.+#-]+$", tech):
                raise serializers.ValidationError(
                    f"スキル名「{tech}」には無効な文字が含まれています。英数字と記号（. + # -）のみ使用できます。"
                )
            valid_techs.append(tech)
        return list(set(valid_techs))

    def _handle_technologies(self, project, tech_names):
        if tech_names is None:
            return
        tech_instances = []
        for name in tech_names:
            obj, created = TechSkill.objects.get_or_create(name=name)
            tech_instances.append(obj)

        project.technologies.set(tech_instances)

    def _convert_to_tech_instances(self, tech_names):
        tech_instances = []
        for name in tech_names:
            instance, _ = TechSkill.objects.get_or_create(name=name)
            tech_instances.append(instance)
        return tech_instances

    def create(self, validated_data):
        tech_names = validated_data.pop("technologies", [])
        categories = validated_data.pop("categories", [])
        vibe_tags = validated_data.pop("vibe_tags", [])
        # 先にprojectを作成しないと、多対他の関係にあるカテゴリなどを追加できない
        project = Project.objects.create(**validated_data)

        tech_instances = self._convert_to_tech_instances(tech_names)
        project.technologies.set(tech_instances)
        project.categories.set(categories)
        project.vibe_tags.set(vibe_tags)
        return project

    def update(self, instance, validated_data):
        tech_names = validated_data.pop("technologies", None)
        categories = validated_data.pop("categories", None)
        vibe_tags = validated_data.pop("vibe_tags", None)

        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        # create()と違って、categories項目が変更されなかったら、前回と同じ状態にしておく
        if tech_names is not None:
            tech_instances = self._convert_to_tech_instances(tech_names)
            instance.technologies.set(tech_instances)
        if categories is not None:
            instance.categories.set(categories)
        if vibe_tags is not None:
            instance.vibe_tags.set(vibe_tags)
        return instance

    def to_representation(self, instance):
        """
        レスポンスデータを作成する際（データ出力時）は、
        詳細表示用の ProjectDetailSerializer に処理を委譲する
        """
        return ProjectDetailSerializer(instance, context=self.context).data

    class Meta:
        model = Project
        fields = [
            "progress_status",
            "title",
            "description",
            "project_image_path",
            "technologies",
            "categories",
            "vibe_tags",
        ]


class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["id", "role", "availability", "message", "portfolio_url", "status", "created_at"]
        read_only_fields = ["id", "status", "created_at"]
