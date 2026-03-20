from django.db import migrations


def load_tech_skills(apps, schema_editor):
    TechSkill = apps.get_model('project', 'TechSkill')

    # 提示された初期データ
    seed_skills = [
        {"name": ".net"}, {"name": "ajax"}, {"name": "algorithm"}, {"name": "amazon-web-services"},
        {"name": "android"}, {"name": "android-studio"}, {"name": "angular"}, {"name": "angularjs"},
        {"name": "apache"}, {"name": "apache-spark"}, {"name": "arrays"}, {"name": "asp.net"},
        {"name": "asp.net-core"}, {"name": "asp.net-mvc"}, {"name": "azure"}, {"name": "bash"},
        {"name": "c"}, {"name": "c#"}, {"name": "c++"}, {"name": "css"}, {"name": "csv"},
        {"name": "dart"}, {"name": "database"}, {"name": "dataframe"}, {"name": "dictionary"},
        {"name": "django"}, {"name": "docker"}, {"name": "eclipse"}, {"name": "entity-framework"},
        {"name": "excel"}, {"name": "express"}, {"name": "facebook"}, {"name": "firebase"},
        {"name": "flutter"}, {"name": "forms"}, {"name": "function"}, {"name": "git"},
        {"name": "hibernate"}, {"name": "html"}, {"name": "image"}, {"name": "ios"},
        {"name": "iphone"}, {"name": "java"}, {"name": "javascript"}, {"name": "jquery"},
        {"name": "json"}, {"name": "kotlin"}, {"name": "laravel"}, {"name": "linq"},
        {"name": "linux"}, {"name": "list"}, {"name": "loops"}, {"name": "macos"},
        {"name": "matlab"}, {"name": "maven"}, {"name": "mongodb"}, {"name": "multithreading"},
        {"name": "mysql"}, {"name": "node.js"}, {"name": "numpy"}, {"name": "objective-c"},
        {"name": "oracle-database"}, {"name": "pandas"}, {"name": "performance"}, {"name": "php"},
        {"name": "postgresql"}, {"name": "powershell"}, {"name": "python"}, {"name": "python-2.7"},
        {"name": "python-3.x"}, {"name": "qt"}, {"name": "r"}, {"name": "reactjs"},
        {"name": "react-native"}, {"name": "regex"}, {"name": "rest"}, {"name": "ruby"},
        {"name": "ruby-on-rails"}, {"name": "scala"}, {"name": "selenium"}, {"name": "shell"},
        {"name": "spring"}, {"name": "spring-boot"}, {"name": "sql"}, {"name": "sqlite"},
        {"name": "sql-server"}, {"name": "string"}, {"name": "swift"}, {"name": "twitter-bootstrap"},
        {"name": "typescript"}, {"name": "unit-testing"}, {"name": "vb.net"}, {"name": "vba"},
        {"name": "visual-studio"}, {"name": "vue.js"}, {"name": "windows"}, {"name": "winforms"},
        {"name": "wordpress"}, {"name": "wpf"}, {"name": "xcode"}, {"name": ".htaccess"},
        {"name": ".net-core"}, {"name": "amazon-s3"}, {"name": "android-fragments"},
        {"name": "android-layout"}, {"name": "animation"}, {"name": "assembly"},
        {"name": "asynchronous"}, {"name": "authentication"}, {"name": "batch-file"},
        {"name": "c++11"}, {"name": "class"}, {"name": "codeigniter"}, {"name": "cordova"},
        {"name": "curl"}, {"name": "date"}, {"name": "datetime"}, {"name": "debugging"},
        {"name": "delphi"}, {"name": "django-models"}, {"name": "elasticsearch"}, {"name": "email"},
        {"name": "exception"}, {"name": "file"}, {"name": "flask"}, {"name": "for-loop"},
        {"name": "generics"}, {"name": "ggplot2"}, {"name": "github"}, {"name": "go"},
        {"name": "google-app-engine"}, {"name": "google-apps-script"}, {"name": "google-chrome"},
        {"name": "google-cloud-platform"}, {"name": "google-maps"}, {"name": "google-sheets"},
        {"name": "gradle"}, {"name": "hadoop"}, {"name": "haskell"}, {"name": "http"},
        {"name": "if-statement"}, {"name": "intellij-idea"}, {"name": "ionic-framework"},
        {"name": "jenkins"}, {"name": "join"}, {"name": "jpa"}, {"name": "jsp"},
        {"name": "kubernetes"}, {"name": "laravel-5"}, {"name": "listview"},
        {"name": "machine-learning"}, {"name": "math"}, {"name": "matplotlib"},
        {"name": "mongoose"}, {"name": "ms-access"}, {"name": "network-programming"},
        {"name": "next.js"}, {"name": "nginx"}, {"name": "npm"}, {"name": "object"},
        {"name": "oop"}, {"name": "opencv"}, {"name": "parsing"}, {"name": "pdf"},
        {"name": "perl"}, {"name": "pointers"}, {"name": "recursion"}, {"name": "ruby-on-rails-3"},
        {"name": "rust"}, {"name": "security"}, {"name": "selenium-webdriver"}, {"name": "session"},
        {"name": "sockets"}, {"name": "sorting"}, {"name": "spring-mvc"}, {"name": "sql-server-2008"},
        {"name": "ssl"}, {"name": "svg"}, {"name": "swing"}, {"name": "symfony"},
        {"name": "templates"}, {"name": "tensorflow"}, {"name": "testing"}, {"name": "tkinter"},
        {"name": "t-sql"}, {"name": "ubuntu"}, {"name": "uitableview"}, {"name": "unity-game-engine"},
        {"name": "unix"}, {"name": "user-interface"}, {"name": "validation"}, {"name": "variables"},
        {"name": "visual-studio-2010"}, {"name": "visual-studio-code"}, {"name": "wcf"},
        {"name": "web-scraping"}, {"name": "web-services"}, {"name": "winapi"}, {"name": "xamarin"}
    ]

    # bulk_create時はモデルの.save()メソッドが呼ばれないため、ここで事前に整形します
    skills_to_create = []

    # 既存のスキルを取得して重複作成を防止
    existing_names = set(TechSkill.objects.values_list('name', flat=True))

    for item in seed_skills:
        name = item["name"].strip().lower()
        if name not in existing_names:
            skills_to_create.append(TechSkill(name=name))
            existing_names.add(name)

    # 一括登録（ignore_conflicts=True で万が一の重複エラーも無視して安全に実行）
    TechSkill.objects.bulk_create(skills_to_create, ignore_conflicts=True)


def remove_tech_skills(apps, schema_editor):
    # ロールバック時は全件削除（必要に応じて調整）
    TechSkill = apps.get_model('project', 'TechSkill')
    TechSkill.objects.all().delete()

class Migration(migrations.Migration):

    dependencies = [
        ("project", "0008_auto_20260320_1706"),
    ]

    operations = [
        migrations.RunPython(load_tech_skills, reverse_code=remove_tech_skills),
    ]
