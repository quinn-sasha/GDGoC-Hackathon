from rest_framework import serializers

from project.models import Project, TechCategory


class ProjectListItemSerializer(serializers.ModelSerializer):
    owner_name = serializers.ReadOnlyField(source="owner.username")
    owner_icon = serializers.ReadOnlyField(source="owner.icon_image_path")
    technologies = serializers.SlugRelatedField(
        many=True, read_only=True, slug_field="name"
    )
    categories = serializers.SlugRelatedField(
        many=True, read_only=True, slug_field="name"
    )
    num_saved = serializers.SerializerMethodField()
    skill_match_count = serializers.SerializerMethodField()

    def get_num_saved(self, obj):
        # prefetch_related("saved_by_users") 済みのためキャッシュから取得
        return obj.saved_by_users.count()

    def get_skill_match_count(self, obj):
        # skill_match セクション以外では annotate されないためデフォルト 0
        return getattr(obj, "skill_match_count", 0)

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
            "num_saved",
            "skill_match_count",
        ]
        read_only_fields = fields


class SectionSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    reason = serializers.CharField()
    reason_detail = serializers.CharField(allow_null=True)
    projects = ProjectListItemSerializer(many=True)


class TechCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TechCategory
        fields = ["id", "name", "slug"]


class HomeFeedSerializer(serializers.Serializer):
    categories = TechCategorySerializer(many=True)
    sections = SectionSerializer(many=True)
