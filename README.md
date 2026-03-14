# GDGoC Hackathon

Django REST Framework + Nuxt.js (Vue 3) による認証システム。GCP Cloud Run へ自動デプロイ。

## 技術スタック

| レイヤー | 技術 |
| --- | --- |
| バックエンド | Python 3.13 / Django 5.x / Django REST Framework 3.15 |
| 認証 | JWT (djangorestframework-simplejwt) / Google OAuth2 (google-auth) |
| DB | PostgreSQL 15 (ローカル: Docker / 本番: Cloud SQL) |
| API ドキュメント | drf-spectacular (Swagger UI) |
| パッケージ管理 | Poetry |
| フロントエンド | Nuxt.js 4 + Vue 3 (Composition API) |
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
| フロントエンド | http://localhost:3000 |
| バックエンド API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/api/docs/ |

### 環境変数（任意）

`backend/` に `.env` を作成すると追加設定が可能（デフォルトで動作します）。

```bash
cp backend/.env.example backend/.env
```

---

## API エンドポイント

| メソッド | エンドポイント | 説明 |
| --- | --- | --- |
| POST | `/api/auth/register` | 新規ユーザー登録・確認メール送信 |
| POST | `/api/auth/verify-email` | メールアドレス確認・JWT 発行 |
| POST | `/api/auth/login` | ログイン |
| POST | `/api/auth/google` | Google アカウントでログイン |

詳細は Swagger UI で確認できます。

- **本番**: `https://backend-301231638824.asia-northeast1.run.app/api/docs/`
- **ローカル**: `http://localhost:8000/api/docs/`

---

## GCP インフラ構成

### 1. 必要な API を有効化

```bash
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  artifactregistry.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com
```

### 2. Artifact Registry リポジトリを作成

```bash
gcloud artifacts repositories create gdgoc-hackathon \
  --repository-format=docker \
  --location=asia-northeast1
```

### 3. Cloud SQL インスタンスを作成

```bash
# インスタンス作成（PostgreSQL 15）
gcloud sql instances create <インスタンス名> \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-northeast1

# データベース作成
gcloud sql databases create google_hackathon_db --instance=<インスタンス名>

# DBユーザー作成
gcloud sql users create app --instance=<インスタンス名> --password=<パスワード>
```

### 4. サービスアカウントを作成

```bash
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# 必要なロールを付与
for role in \
  roles/run.admin \
  roles/storage.admin \
  roles/artifactregistry.writer \
  roles/cloudsql.client \
  roles/iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding <PROJECT_ID> \
    --member="serviceAccount:github-actions@<PROJECT_ID>.iam.gserviceaccount.com" \
    --role="$role"
done
```

### 5. Workload Identity Federation (WIF) を設定

```bash
# プールを作成
gcloud iam workload-identity-pools create github-pool \
  --location=global \
  --display-name="GitHub Actions Pool"

# プロバイダーを作成
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location=global \
  --workload-identity-pool=github-pool \
  --issuer-uri=https://token.actions.githubusercontent.com \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='<GitHubユーザー名>/<リポジトリ名>'"

# サービスアカウントへのバインド
gcloud iam service-accounts add-iam-policy-binding \
  github-actions@<PROJECT_ID>.iam.gserviceaccount.com \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github-pool/attribute.repository/<GitHubユーザー名>/<リポジトリ名>"
```

---

## GitHub 設定

### Variables（Settings → Secrets and variables → Actions → Variables）

| 変数名 | 値 | 説明 |
| --- | --- | --- |
| `GCP_PROJECT_ID` | `your-project-id` | GCP プロジェクト ID |
| `WIF_PROVIDER` | `projects/.../providers/github-provider` | WIF プロバイダーのリソース名 |
| `WIF_SERVICE_ACCOUNT` | `github-actions@....iam.gserviceaccount.com` | サービスアカウントのメールアドレス |
| `CLOUD_SQL_INSTANCE` | `project:region:instance` | Cloud SQL インスタンス接続名 |

### Secrets（Settings → Secrets and variables → Actions → Secrets）

| 変数名 | 説明 |
| --- | --- |
| `DJANGO_SECRET_KEY` | Django のシークレットキー |
| `DB_PASSWORD` | Cloud SQL の DB パスワード |
| `GOOGLE_CLIENT_ID` | Google OAuth2 クライアント ID |
| `EMAIL_HOST_USER` | 送信元メールアドレス（Gmail）|
| `EMAIL_HOST_PASSWORD` | Gmail アプリパスワード |
| `FRONTEND_URL` | フロントエンドの URL（確認メールリンク用）|
| `CORS_ALLOWED_ORIGINS` | フロントエンドの URL（CORS 許可用）|

---

## デプロイ

`main` ブランチへの push で自動デプロイされます。

```
push to main
  ├── deploy-backend  : バックエンドイメージのビルド・Artifact Registry へプッシュ・Cloud Run デプロイ
  └── deploy-frontend : フロントエンドイメージのビルド・Artifact Registry へプッシュ・Cloud Run デプロイ
```

---

## プロジェクト構成

```
.
├── docker-compose.yml
├── .github/workflows/deploy.yml
├── backend/                        # Django バックエンド
│   ├── Dockerfile
│   ├── manage.py
│   ├── pyproject.toml
│   ├── .env.example
│   ├── config/
│   │   ├── settings.py
│   │   └── urls.py
│   └── accounts/
│       ├── models.py               # User / EmailVerificationToken
│       ├── serializers.py
│       ├── views.py
│       └── urls.py
└── frontend/                       # Nuxt.js 4 + Vue 3
    ├── Dockerfile
    ├── nuxt.config.ts
    └── app/
        ├── composables/
        ├── middleware/
        └── pages/
            ├── index.vue
            ├── register.vue
            ├── verify-email.vue
            ├── login.vue
            └── dashboard.vue
```
