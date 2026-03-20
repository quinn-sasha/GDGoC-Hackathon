from django.db import migrations, models


class Migration(migrations.Migration):
    """
    project_image_path カラムがDBに存在しない場合に追加するマイグレーション。
    """

    dependencies = [
        ("project", "0003_add_progress_status"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name='project_project'
                    AND column_name='project_image_path'
                ) THEN
                    ALTER TABLE project_project
                    ADD COLUMN project_image_path VARCHAR(250) NULL;
                END IF;
            END $$;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
