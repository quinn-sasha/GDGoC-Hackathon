import re

from django.db import migrations, models


def _build_username(email, fallback, taken_usernames):
    base = re.sub(r"[^a-zA-Z0-9_-]+", "_", (email or fallback).split("@")[0]).strip("_")
    if not base:
        base = fallback
    base = base[:30] or fallback

    candidate = base
    suffix = 1
    while candidate in taken_usernames:
        suffix_text = str(suffix)
        candidate = f"{base[:30 - len(suffix_text)]}{suffix_text}"
        suffix += 1

    taken_usernames.add(candidate)
    return candidate


def populate_usernames(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    taken_usernames = set(
        User.objects.exclude(username__isnull=True)
        .exclude(username="")
        .values_list("username", flat=True)
    )

    for user in User.objects.filter(models.Q(username__isnull=True) | models.Q(username="")):
        user.username = _build_username(
            email=user.email,
            fallback=f"user{user.pk}",
            taken_usernames=taken_usernames,
        )
        user.save(update_fields=["username"])


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="username",
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.RunPython(populate_usernames, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="user",
            name="username",
            field=models.CharField(max_length=30, unique=True),
        ),
    ]
