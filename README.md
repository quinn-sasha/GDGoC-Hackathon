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
