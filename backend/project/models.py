from importlib import reload

import uuid6
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


def generate_uuid7():
    return uuid6.uuid7()


# ==========================================
# Master Models
# ==========================================


class TechSkills(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)

    def save(self, *args, **kwargs):
        if self.name:
            self.name = self.name.strip().lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class TechCategories(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class VibeTags(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.name


# ==========================================
# プロジェクト系モデル
# ==========================================


class Projects(models.Model):
    class ProgressStatus(models.TextChoices):
        OPENING = "opening", _("開始前")
        ONGOING = "ongoing", _("進行中")
        FINISHED = "completed", _("完了")

    id = models.UUIDField(primary_key=True, default=generate_uuid7, editable=False)
    owner = models.ForeignKey(
        # オーナーが退会したら、作成したプロジェクトは消去される
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="projects",
    )
    progress_status = models.CharField(
        max_length=20, choices=ProgressStatus.choices, default=ProgressStatus.OPENING
    )
    title = models.CharField(max_length=50)
    description = models.CharField(max_length=1000, null=True, blank=True)
    project_image_path = models.CharField(max_length=250, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # many to many fields
    technologies = models.ManyToManyField(
        TechSkills,
        through="ProjectsTechnologies",
        related_name="projects",
        help_text="プロジェクトを通して学びたい技術",
    )
    categories = models.ManyToManyField(
        TechCategories, through="ProjectsCategories", related_name="projects"
    )
    vibe_tags = models.ManyToManyField(
        VibeTags, through="ProjectsVibes", related_name="projects"
    )
    saved_by_users = models.ManyToManyField(
        settings.AUTH_USER_MODEL, through="SavedProjects", related_name="saved_projects"
    )

    def __str__(self):
        return self.title


# ==========================================
# Join Tables
# ==========================================


# Don't need related name in join tables
class ProjectsTechnologies(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuid7, editable=False)
    project = models.ForeignKey(Projects, on_delete=models.CASCADE)
    technology = models.ForeignKey(TechSkills, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("project", "technology")


class ProjectsCategories(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuid7, editable=False)
    project = models.ForeignKey(Projects, on_delete=models.CASCADE)
    category = models.ForeignKey(TechCategories, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("project", "category")


class ProjectsVibes(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuid7, editable=False)
    project = models.ForeignKey(Projects, on_delete=models.CASCADE)
    vibe_tag = models.ForeignKey(VibeTags, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("project", "vibe_tag")


class SavedProjects(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuid7, editable=False)
    project = models.ForeignKey(Projects, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("project", "user")
