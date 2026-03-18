import django.core.validators
import project.models
import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="TechCategory",
            fields=[
                ("id", models.BigAutoField(primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=50, unique=True)),
                ("slug", models.SlugField(unique=True)),
            ],
        ),
        migrations.CreateModel(
            name="TechSkill",
            fields=[
                ("id", models.BigAutoField(primary_key=True, serialize=False)),
                (
                    "name",
                    models.CharField(
                        max_length=50,
                        unique=True,
                        validators=[
                            django.core.validators.RegexValidator(
                                message="スキル名には小文字の英数字と記号（. + # -）、スペースのみ使用できます。",
                                regex="^[a-z0-9\\s\\.+#-]+$",
                            )
                        ],
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="VibeTag",
            fields=[
                ("id", models.BigAutoField(primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=20, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name="Project",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=project.models.generate_uuid7,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "progress_status",
                    models.CharField(
                        choices=[
                            ("opening", "開始前"),
                            ("ongoing", "進行中"),
                            ("completed", "完了"),
                        ],
                        default="opening",
                        max_length=20,
                    ),
                ),
                ("title", models.CharField(max_length=50)),
                (
                    "description",
                    models.CharField(blank=True, max_length=1000, null=True),
                ),
                (
                    "project_image_path",
                    models.CharField(blank=True, max_length=250, null=True),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "owner",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="projects",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="SavedProject",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=project.models.generate_uuid7,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "project",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="project.project",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "unique_together": {("project", "user")},
            },
        ),
        migrations.AddField(
            model_name="project",
            name="saved_by_users",
            field=models.ManyToManyField(
                related_name="saved_projects",
                through="project.SavedProject",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.CreateModel(
            name="ProjectCategory",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=project.models.generate_uuid7,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "project",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="project.project",
                    ),
                ),
                (
                    "category",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="project.techcategory",
                    ),
                ),
            ],
            options={
                "unique_together": {("project", "category")},
            },
        ),
        migrations.AddField(
            model_name="project",
            name="categories",
            field=models.ManyToManyField(
                related_name="projects",
                through="project.ProjectCategory",
                to="project.techcategory",
            ),
        ),
        migrations.CreateModel(
            name="ProjectTechnology",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=project.models.generate_uuid7,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "project",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="project.project",
                    ),
                ),
                (
                    "technology",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="project.techskill",
                    ),
                ),
            ],
            options={
                "unique_together": {("project", "technology")},
            },
        ),
        migrations.AddField(
            model_name="project",
            name="technologies",
            field=models.ManyToManyField(
                help_text="プロジェクトを通して学びたい技術",
                related_name="projects",
                through="project.ProjectTechnology",
                to="project.techskill",
            ),
        ),
        migrations.CreateModel(
            name="ProjectVibe",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=project.models.generate_uuid7,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "project",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="project.project",
                    ),
                ),
                (
                    "vibe_tag",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="project.vibetag",
                    ),
                ),
            ],
            options={
                "unique_together": {("project", "vibe_tag")},
            },
        ),
        migrations.AddField(
            model_name="project",
            name="vibe_tags",
            field=models.ManyToManyField(
                related_name="projects",
                through="project.ProjectVibe",
                to="project.vibetag",
            ),
        ),
    ]
