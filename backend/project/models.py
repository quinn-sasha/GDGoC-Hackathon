import uuid6
from django.core.validators import RegexValidator
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


def generate_uuid7():
    return uuid6.uuid7()


# ==========================================
# Master Models
# ==========================================


class TechSkill(models.Model):
    name_validator = RegexValidator(
        regex=r"^[a-z0-9\s\.+#-]+$",
        message="スキル名には小文字の英数字と記号（. + # -）、スペースのみ使用できます。",
    )

    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True, validators=[name_validator])

    def save(self, *args, **kwargs):
        if self.name:
            self.name = self.name.strip().lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class TechCategory(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class VibeTag(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.name


# ==========================================
# プロジェクト系モデル
# ==========================================


class Project(models.Model):
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
        TechSkill,
        through="ProjectTechnology",
        related_name="projects",
        help_text="プロジェクトを通して学びたい技術",
    )
    categories = models.ManyToManyField(
        TechCategory, through="ProjectCategory", related_name="projects"
    )
    vibe_tags = models.ManyToManyField(
        VibeTag, through="ProjectVibe", related_name="projects"
    )
    saved_by_users = models.ManyToManyField(
        settings.AUTH_USER_MODEL, through="SavedProject", related_name="saved_projects"
    )

    def __str__(self):
        return self.title


# ==========================================
# Join Tables
# ==========================================


# Don't need related name in join tables
class ProjectTechnology(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuid7, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    technology = models.ForeignKey(TechSkill, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("project", "technology")


class ProjectCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuid7, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    category = models.ForeignKey(TechCategory, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("project", "category")


class ProjectVibe(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuid7, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    vibe_tag = models.ForeignKey(VibeTag, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("project", "vibe_tag")


class SavedProject(models.Model):
    id = models.UUIDField(primary_key=True, default=generate_uuid7, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("project", "user")


# ==========================================
# 参加申請
# ==========================================


class Application(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "申請中"
        ACCEPTED = "accepted", "承認済み"
        REJECTED = "rejected", "却下"

    id = models.UUIDField(primary_key=True, default=generate_uuid7, editable=False)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name="ステータス",
    )
    role = models.CharField(max_length=100, blank=True, default="", verbose_name="希望役割")
    availability = models.CharField(max_length=100, blank=True, default="", verbose_name="参加ペース")
    message = models.TextField(blank=True, default="", verbose_name="メッセージ")
    portfolio_url = models.CharField(max_length=200, blank=True, default="", verbose_name="ポートフォリオURL")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="申請日時")
    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="applications",
        verbose_name="申請者",
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="applications",
        verbose_name="プロジェクト",
    )

    class Meta:
        verbose_name = "参加申請"
        verbose_name_plural = "参加申請"
        unique_together = [("project", "applicant")]

    def __str__(self):
        return f"{self.applicant.username} → {self.project.title}"
