# Google Hackathon

Django REST Framework + Nuxt.js (Vue 3) による認証システム

## 技術スタック

### バックエンド

- **Python** 3.13+
- **Django** 5.x / **Django REST Framework** 3.15+
- **JWT 認証** djangorestframework-simplejwt
- **Google 認証** google-auth
- **メール認証** Django ビルトインメール機能
- **DB** PostgreSQL
- **API ドキュメント** drf-spectacular (Swagger UI)
- **パッケージ管理** Poetry

### フロントエンド

- **Nuxt.js 4** + **Vue 3** (Composition API)
- **vue-router** ページ遷移（ファイルベースルーティング）
- **ofetch** API通信（Nuxt ビルトイン `$fetch`）
- **Nuxt middleware** 認証ガード

## セットアップ

### 事前準備

プロジェクトに必要なPython 3.13以上、PostgreSQL、Poetryをインストールしてください。

<details>
  <summary>macOSでのインストール方法</summary>

  ```bash
  brew update
  brew install python@3.13 postgresql poetry
  ```

  インストール後、PostgreSQLのバックグラウンドサービスを起動しておきます。

  ```bash
  brew services start postgresql
  ```
</details>

### 1. バックエンドの依存関係をインストール

```bash
cd backend
poetry install
```

### 2. 環境変数の設定

`backend/` に `.env` を作成する（`.env.example` を参考にする）。

```bash
cp backend/.env.example backend/.env
# .env を編集して各値を設定する
```

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# PostgreSQL
DB_NAME=google_hackathon_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432

# Google OAuth2（Google Cloud Console で取得）
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# メール設定
# 開発時はコンソール出力、本番は smtp に変更する
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# フロントエンドのURL（確認メールのリンク生成に使用）
FRONTEND_URL=http://localhost:5173
```

### 3. データベースの作成

```bash
psql -d postgres -c "CREATE DATABASE google_hackathon_db;"
```

### 4. マイグレーションの適用

```bash
cd backend
poetry run python manage.py migrate
```

### 5. フロントエンドの依存関係をインストール

```bash
cd frontend
npm install
```

### 6. フロントエンドの環境変数（Google 認証を使う場合）

```bash
cp frontend/.env.example frontend/.env
# NUXT_PUBLIC_GOOGLE_CLIENT_ID を設定する
```

## 起動方法

ターミナルを2つ開いて実行する。

### バックエンド（ポート 8000）

```bash
cd backend
poetry run python manage.py runserver
```

### フロントエンド（ポート 3000）

```bash
cd frontend
npm run dev
```

ブラウザで `http://localhost:3000` を開く。

## API エンドポイント

| メソッド | エンドポイント | 説明 |
| --- | --- | --- |
| POST | `/api/auth/register` | 新規ユーザー登録・確認メール送信 |
| POST | `/api/auth/verify-email` | メールアドレス確認・JWT発行 |
| POST | `/api/auth/login` | ログイン |
| POST | `/api/auth/google` | Googleアカウントでログイン |

---

### POST `/api/auth/register`

メールアドレスとパスワードでユーザーを登録し、確認メールを送信する。

#### リクエスト

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### レスポンス `201 Created`

```json
{
  "message": "確認メールを送信しました。メール内のリンクで認証を完了してください。"
}
```

---

### POST `/api/auth/verify-email`

メールに記載されたトークンを送信してメールアドレスを確認する。確認完了後に JWT を発行する。

#### リクエスト

```json
{
  "token": "<メールに記載されたトークン>"
}
```

#### レスポンス `200 OK`

```json
{
  "access": "<JWTアクセストークン>",
  "refresh": "<JWTリフレッシュトークン>"
}
```

---

### POST `/api/auth/login`

#### リクエスト

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### レスポンス `200 OK`

```json
{
  "access": "<JWTアクセストークン>",
  "refresh": "<JWTリフレッシュトークン>"
}
```

---

### POST `/api/auth/google`

フロントエンドで取得した Google の ID トークンを送信する。ユーザーが未登録の場合は自動で作成される。

#### リクエスト

```json
{
  "id_token": "<GoogleのIDトークン>"
}
```

#### レスポンス `200 OK`

```json
{
  "access": "<JWTアクセストークン>",
  "refresh": "<JWTリフレッシュトークン>"
}
```

> **事前準備**: [Google Cloud Console](https://console.cloud.google.com/) で OAuth クライアント ID を作成し、`backend/.env` の `GOOGLE_CLIENT_ID` に設定する。

---

## メール認証フロー

```text
1. POST /api/auth/register
       ↓
   is_active=False でユーザー作成
   確認トークン生成（有効期限 24時間）
   確認メールを送信（開発時はコンソールに出力）

2. メール内のリンクをクリック
   → http://localhost:5173/verify-email?token=<UUID>

3. POST /api/auth/verify-email  { "token": "..." }
       ↓
   トークン検証
   is_active=True に更新
   JWT トークンを返す
```

## API ドキュメント

バックエンド起動後、以下の URL で Swagger UI を確認できる。

- **Swagger UI**: `http://localhost:8000/api/docs/`
- **OpenAPI スキーマ**: `http://localhost:8000/api/schema/`

## JWT の利用方法

取得したアクセストークンをリクエストヘッダーに付与する。

```http
Authorization: Bearer <アクセストークン>
```

アクセストークンの有効期限は **60分**、リフレッシュトークンは **7日**。

## ローカル開発（Docker Compose）

Docker と Docker Compose がインストールされていれば、コマンド1つで起動できる。

```bash
docker compose up
```

| サービス | URL |
|---|---|
| フロントエンド | http://localhost:3000 |
| バックエンド API | http://localhost:8000 |
| PostgreSQL | localhost:5432 |

> ローカルではメール送信が `console` バックエンドになっている。登録すると**バックエンドのログ**に確認メールの内容が出力される。トークンをコピーして `/verify-email?token=xxx` にアクセスすれば認証完了。

```bash
# バックグラウンドで起動
docker compose up -d

# ログ確認
docker compose logs -f backend
docker compose logs -f frontend

# 停止
docker compose down

# DBも含めて完全削除
docker compose down -v
```

---

## GCP インフラ構成

### 前提条件

- [Google Cloud CLI (`gcloud`)](https://cloud.google.com/sdk/docs/install) がインストール済み
- GCPプロジェクトが作成済み

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

Docker イメージの保存先。

```bash
gcloud artifacts repositories create gdgoc-hackathon \
  --repository-format=docker \
  --location=asia-northeast1
```

### 3. Cloud SQL（PostgreSQL）作成

```bash
# インスタンス作成（数分かかる）
gcloud sql instances create gdgoc-hackathon-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-northeast1

# データベース作成
gcloud sql databases create google_hackathon_db \
  --instance=gdgoc-hackathon-db

# アプリ用ユーザー作成（パスワードは任意の値に変更）
gcloud sql users create app \
  --instance=gdgoc-hackathon-db \
  --password=<DB_PASSWORD>
```

> インスタンスの接続名は `<PROJECT_ID>:asia-northeast1:gdgoc-hackathon-db` になる。

### 4. サービスアカウントと権限設定

GitHub Actions が GCP を操作するためのサービスアカウント。

```bash
# サービスアカウント作成
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# 必要な権限を付与
PROJECT_ID=$(gcloud config get-value project)
SA="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA}" --role="roles/run.admin"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA}" --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA}" --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA}" --role="roles/iam.serviceAccountUser"
```

### 5. Workload Identity Federation 設定

サービスアカウントキーを使わずに GitHub Actions から GCP へ認証する仕組み。

```bash
PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)')
REPO="<GitHubのオーナー名>/<リポジトリ名>"  # 例: quinn-sasha/GDGoC-Hackathon

# Workload Identity Pool 作成
gcloud iam workload-identity-pools create github-pool \
  --location=global \
  --display-name="GitHub Actions Pool"

# Provider 作成
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location=global \
  --workload-identity-pool=github-pool \
  --display-name="GitHub Provider" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='${REPO}'"

# サービスアカウントへのバインド
SA="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"
gcloud iam service-accounts add-iam-policy-binding ${SA} \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/attribute.repository/${REPO}"

# Provider のリソース名を確認（後で GitHub Variables に設定する）
gcloud iam workload-identity-pools providers describe github-provider \
  --location=global \
  --workload-identity-pool=github-pool \
  --format='value(name)'
```

---

## GitHub Actions 設定

### Variables（公開値）

GitHubリポジトリの **Settings → Secrets and variables → Actions → Variables** で設定する。

| 変数名 | 値 | 説明 |
|---|---|---|
| `GCP_PROJECT_ID` | `<PROJECT_ID>` | GCP プロジェクト ID |
| `WIF_PROVIDER` | `projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github-pool/providers/github-provider` | Workload Identity Provider のリソース名 |
| `WIF_SERVICE_ACCOUNT` | `github-actions@<PROJECT_ID>.iam.gserviceaccount.com` | サービスアカウントのメールアドレス |
| `CLOUD_SQL_INSTANCE` | `<PROJECT_ID>:asia-northeast1:gdgoc-hackathon-db` | Cloud SQL インスタンスの接続名 |
| `BACKEND_URL` | `https://backend-xxxx-an.a.run.app` | バックエンドの Cloud Run URL（初回デプロイ後に設定） |

### Secrets（機密値）

GitHubリポジトリの **Settings → Secrets and variables → Actions → Secrets** で設定する。

| シークレット名 | 説明 |
|---|---|
| `DJANGO_SECRET_KEY` | Django のシークレットキー（ランダムな文字列） |
| `DB_NAME` | データベース名（例: `google_hackathon_db`） |
| `DB_USER` | DB ユーザー名（例: `app`） |
| `DB_PASSWORD` | DB ユーザーのパスワード |
| `EMAIL_HOST` | SMTP ホスト（Gmail の場合 `smtp.gmail.com`） |
| `EMAIL_HOST_USER` | 送信用メールアドレス |
| `EMAIL_HOST_PASSWORD` | Gmail のアプリパスワード（16桁）※通常のパスワードは不可 |
| `DEFAULT_FROM_EMAIL` | 送信元として表示されるメールアドレス |
| `GOOGLE_CLIENT_ID` | Google OAuth クライアント ID（Google 認証不要なら空） |
| `FRONTEND_URL` | フロントエンドの Cloud Run URL（初回デプロイ後に設定） |

> **DJANGO_SECRET_KEY の生成方法:**
> ```bash
> python3 -c "import secrets; print(secrets.token_urlsafe(50))"
> ```

> **Gmail アプリパスワードの取得方法:**
> 1. Google アカウントで 2 段階認証を有効化
> 2. https://myaccount.google.com/security の「アプリパスワード」で生成

### デプロイフロー

`main` ブランチへのプッシュで自動的に以下の順で実行される。

```
push to main
    │
    ▼
[1] deploy-backend       ← Docker ビルド → Artifact Registry → Cloud Run
    │
    ▼
[2] migrate-database     ← Cloud Run Jobs で python manage.py migrate
    │
    ▼
[3] deploy-frontend      ← Docker ビルド（NEXT_PUBLIC_API_BASE を埋め込み）→ Cloud Run
    │
    ▼
[4] configure-backend-public-env  ← バックエンドの CORS をフロントエンド URL に更新
```

### 初回デプロイ後にやること

初回デプロイが完了したら、Cloud Run の URL を確認して GitHub に追加する。

```bash
# バックエンド URL 確認
gcloud run services describe backend --region=asia-northeast1 --format='value(status.url)'

# フロントエンド URL 確認
gcloud run services describe frontend --region=asia-northeast1 --format='value(status.url)'
```

確認した URL を以下に設定する：
- `BACKEND_URL` → GitHub **Variables** に設定
- `FRONTEND_URL` → GitHub **Secrets** に設定

設定後、もう一度 `main` にプッシュ（または GitHub Actions から手動実行）してデプロイし直す。

---

## プロジェクト構成

```text
GDGoC-Hackathon/
├── README.md
├── backend/                    # Django バックエンド
│   ├── manage.py
│   ├── pyproject.toml          # Poetry 依存関係
│   ├── .env                    # 環境変数（.env.example を参考に作成）
│   ├── .env.example
│   ├── config/
│   │   ├── settings.py         # Django設定
│   │   ├── urls.py             # メインルーティング
│   │   ├── wsgi.py
│   │   └── asgi.py
│   └── accounts/
│       ├── models.py           # User / EmailVerificationToken
│       ├── serializers.py      # バリデーション・認証ロジック
│       ├── views.py            # APIビュー
│       ├── urls.py             # /api/auth/* ルーティング
│       ├── admin.py
│       └── apps.py
└── frontend/                   # Nuxt.js 4 + Vue 3 フロントエンド
    ├── package.json
    ├── nuxt.config.ts
    ├── .env.example
    └── app/
        ├── app.vue             # ルートコンポーネント
        ├── composables/
        │   └── useApi.ts       # $fetch ベースの API クライアント
        ├── middleware/
        │   └── auth.ts         # 認証ガード（未ログイン → /login）
        └── pages/
            ├── index.vue       # ルート（認証状態でリダイレクト）
            ├── register.vue    # 新規登録
            ├── verify-email.vue # メール確認
            ├── login.vue       # ログイン
            └── dashboard.vue   # ダッシュボード（要認証）
```
