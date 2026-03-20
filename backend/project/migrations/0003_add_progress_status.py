from django.db import migrations, models


class Migration(migrations.Migration):
    """
    0001_initial.py が後から編集されたため、progress_status カラムが
    DBに存在しないケースを修正するマイグレーション。
    既にカラムが存在する場合はスキップする。
    """

    dependencies = [
        ("project", "0002_application"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name='project_project'
                    AND column_name='progress_status'
                ) THEN
                    ALTER TABLE project_project
                    ADD COLUMN progress_status VARCHAR(20) NOT NULL DEFAULT 'opening';
                END IF;
            END $$;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
