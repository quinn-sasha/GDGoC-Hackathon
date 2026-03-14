# GDGoC Hackathon

Django REST Framework + Next.js による認証システム。GCP Cloud Run へ自動デプロイ。

## 技術スタック

| レイヤー | 技術 |
| --- | --- |
| バックエンド | Python 3.13 / Django 5.x / Django REST Framework 3.15 |
| 認証 | JWT (djangorestframework-simplejwt) / Google OAuth2 (google-auth) |
| DB | PostgreSQL 15 (ローカル: Docker / 本番: Cloud SQL) |
| API ドキュメント | drf-spectacular (Swagger UI) |
| パッケージ管理 | Poetry |
| フロントエンド | Next.js (App Router) |
| インフラ | GCP Cloud Run / Artifact Registry / Cloud SQL |
| CI/CD | GitHub Actions (Workload Identity Federation) |

---

## ローカル開発

### 必要なもの

- Docker / Docker Compose

### 起動

```bash
docker compose up --build
```

| サービス | URL |
| --- | --- |
| フロントエンド | <http://localhost:3000> |
| バックエンド API | <http://localhost:8000> |
| Swagger UI | <http://localhost:8000/api/docs/> |

ローカルではメール送信が `console` バックエンドになっている。登録するとバックエンドのログに確認メールの内容が出力される。

```bash
docker compose logs -f backend
```

トークンをコピーして `/verify-email?token=<トークン>` にアクセスすると認証完了。

---

## API エンドポイント

| メソッド | エンドポイント | 説明 |
| --- | --- | --- |
| POST | `/api/auth/register` | 新規ユーザー登録・確認メール送信 |
| POST | `/api/auth/verify-email` | メールアドレス確認・JWT 発行 |
| POST | `/api/auth/login` | ログイン |
| POST | `/api/auth/google` | Google アカウントでログイン |

詳細は Swagger UI で確認できる。

- **本番**: `https://backend-301231638824.asia-northeast1.run.app/api/docs/`
- **ローカル**: `http://localhost:8000/api/docs/`

---

## GCP インフラ構成

### 前提条件

- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) がインストール済み
- GCP プロジェクトが作成済み

```bash
gcloud auth login
gcloud config set project <PROJECT_ID>
```

### 1. 必要な API を有効化

```bash
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  artifactregistry.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com
```

### 2. Artifact Registry リポジトリ作成

```bash
gcloud artifacts repositories create gdgoc-hackathon \
  --repository-format=docker \
  --location=asia-northeast1
```

### 3. Cloud SQL（PostgreSQL 15）作成

```bash
# インスタンス作成（数分かかる）
gcloud sql instances create gdgoc-hackathon-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-northeast1

# データベース作成
gcloud sql databases create google_hackathon_db \
  --instance=gdgoc-hackathon-db

# アプリ用ユーザー作成
gcloud sql users create app \
  --instance=gdgoc-hackathon-db \
  --password=<DB_PASSWORD>
```

> インスタンスの接続名は `<PROJECT_ID>:asia-northeast1:gdgoc-hackathon-db` になる。

### 4. サービスアカウントと権限設定

```bash
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

PROJECT_ID=$(gcloud config get-value project)
SA="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

for role in roles/run.admin roles/artifactregistry.writer roles/cloudsql.client roles/iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SA}" --role="${role}"
done
```

### 5. Workload Identity Federation 設定

```bash
PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)')
REPO="<GitHubオーナー名>/<リポジトリ名>"

gcloud iam workload-identity-pools create github-pool \
  --location=global --display-name="GitHub Actions Pool"

gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location=global \
  --workload-identity-pool=github-pool \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='${REPO}'"

SA="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"
gcloud iam service-accounts add-iam-policy-binding ${SA} \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/attribute.repository/${REPO}"

# Provider のリソース名を確認（GitHub Variables に設定する）
gcloud iam workload-identity-pools providers describe github-provider \
  --location=global \
  --workload-identity-pool=github-pool \
  --format='value(name)'
```

---

## GitHub Actions 設定

リポジトリの **Settings → Secrets and variables → Actions** で設定する。

### Variables（公開値）

| 変数名 | 説明 |
| --- | --- |
| `GCP_PROJECT_ID` | GCP プロジェクト ID |
| `WIF_PROVIDER` | Workload Identity Provider のリソース名 |
| `WIF_SERVICE_ACCOUNT` | サービスアカウントのメールアドレス |
| `CLOUD_SQL_INSTANCE` | Cloud SQL インスタンスの接続名（例: `project:region:instance`） |

### デプロイフロー

`main` ブランチへの push で自動実行される。

```text
push to main
  ├── deploy-backend  : Docker ビルド → Artifact Registry → Cloud Run デプロイ
  └── deploy-frontend : Docker ビルド → Artifact Registry → Cloud Run デプロイ
```

---

## プロジェクト構成

```text
.
├── docker-compose.yml
├── .github/workflows/deploy.yml
├── backend/                        # Django バックエンド
│   ├── Dockerfile
│   ├── manage.py
│   ├── pyproject.toml
│   ├── config/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── accounts/                   # 認証アプリ
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── home/                       # ホームアプリ
│   └── project/                    # プロジェクトアプリ
└── frontend/                       # Next.js フロントエンド
    ├── Dockerfile
    ├── next.config.ts
    ├── middleware.ts               # 認証ガード
    ├── lib/
    │   └── auth-client.ts          # API クライアント
    └── app/
        ├── layout.tsx
        ├── page.tsx
        ├── login/
        ├── register/
        ├── verify-email/
        └── dashboard/
```
