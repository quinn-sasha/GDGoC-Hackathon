from django.db import migrations


def add_tech_categories(apps, schema_editor):
    TechCategory = apps.get_model('project', 'TechCategory')

    categories = [
        {"name": "Web & Mobile Applications", "slug": "web-mobile"},
        {"name": "Systems & Core", "slug": "systems-core"},
        {"name": "Data & AI", "slug": "data-ai"},
        {"name": "Graphics & Gaming", "slug": "graphics-gaming"},
        {"name": "Hardware & IoT", "slug": "hardware-iot"},
        {"name": "Others", "slug": "others"}
    ]

    for category in categories:
        TechCategory.objects.get_or_create(
            name=category["name"],
            defaults={"slug": category["slug"]}
        )


def remove_tech_categories(apps, schema_editor):
    TechCategory = apps.get_model('project', 'TechCategory')
    slugs = ["web-mobile", "systems-core", "data-ai", "graphics-gaming", "hardware-iot", "others"]
    TechCategory.objects.filter(slug__in=slugs).delete()
class Migration(migrations.Migration):

    dependencies = [
        ("project", "0005_application_add_fields"),
    ]

    operations = [
        migrations.RunPython(add_tech_categories, reverse_code=remove_tech_categories),
    ]
