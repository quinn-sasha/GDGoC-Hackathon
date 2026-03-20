from django.db import migrations


def add_vibe_tags(apps, schema_editor):
    VibeTag = apps.get_model('project', 'VibeTag')

    # max_length=20 に収まるように英語名のみを登録します
    tags = [
        # ペースと熱量
        "Hardcore",  # がっつり
        "Chill",  # ゆるく楽しく
        "Weekend Main",  # 週末メイン
        "Short Sprint",  # 短期集中
        "Slow & Steady",  # コツコツゆっくり

        # コミュニケーションと文化
        "Beginner Friendly",  # 初心者歓迎
        "Deep Work",  # もくもく集中
        "Active Discussion",  # ワイワイ議論
        "Peer Learning",  # 教え合い重視

        # 開発スタイル
        "Tech Playground",  # 技術の遊び場
        "Zero to One",  # ゼロイチ挑戦
        "Move Fast",  # とりあえず動かす
        "Architecture First",  # 設計からじっくり (18文字)

        # 目標とゴール
        "Portfolio Building",  # ポートフォリオ充実 (18文字)
        "Release Focused"  # リリース絶対
    ]

    # 重複エラーを防ぐため get_or_create を使用
    for tag_name in tags:
        VibeTag.objects.get_or_create(name=tag_name)


def remove_vibe_tags(apps, schema_editor):
    VibeTag = apps.get_model('project', 'VibeTag')
    tags = [
        "Hardcore", "Chill", "Weekend Main", "Short Sprint", "Slow & Steady",
        "Beginner Friendly", "Deep Work", "Active Discussion", "Peer Learning",
        "Tech Playground", "Zero to One", "Move Fast", "Architecture First",
        "Portfolio Building", "Release Focused"
    ]
    VibeTag.objects.filter(name__in=tags).delete()

class Migration(migrations.Migration):

    dependencies = [
        ("project", "0007_alter_application_id_alter_project_id_and_more"),
    ]

    operations = [
        migrations.RunPython(add_vibe_tags, reverse_code=remove_vibe_tags),
    ]