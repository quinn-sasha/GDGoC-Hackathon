from django.db import migrations


def add_atmosphere_tags(apps, schema_editor):
    TechSkill = apps.get_model('project', 'TechSkill')

    # バリデーションに合わせて、全て小文字にし、「&」を「and」に変更しています
    tags = [
        # ペースと熱量
        "hardcore",
        "chill",
        "weekend main",
        "short sprint",
        "slow and steady",  # & を and に変更

        # コミュニケーションと文化
        "beginner friendly",
        "deep work",
        "active discussion",
        "peer learning",

        # 開発スタイル
        "tech playground",
        "zero to one",
        "move fast",
        "architecture first",

        # 目標とゴール
        "portfolio building",
        "release focused"
    ]

    # 重複エラーを防ぐため get_or_create を使用
    for tag_name in tags:
        TechSkill.objects.get_or_create(name=tag_name)


def remove_atmosphere_tags(apps, schema_editor):
    TechSkill = apps.get_model('project', 'TechSkill')

    tags = [
        "hardcore", "chill", "weekend main", "short sprint", "slow and steady",
        "beginner friendly", "deep work", "active discussion", "peer learning",
        "tech playground", "zero to one", "move fast", "architecture first",
        "portfolio building", "release focused"
    ]

    # ロールバック時に追加したタグを削除
    TechSkill.objects.filter(name__in=tags).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("project", "0006_auto_20260320_1617"),
    ]

    operations = [
        migrations.RunPython(add_atmosphere_tags, reverse_code=remove_atmosphere_tags),
    ]
