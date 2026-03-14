#!/usr/bin/env bash
#
# GCP 環境セットアップスクリプト
# 使い方: ./scripts/gcp-setup.sh <PROJECT_ID> <GITHUB_REPO>
#   例: ./scripts/gcp-setup.sh my-project-123 myorg/myrepo
#
set -euo pipefail

PROJECT_ID="${1:?Usage: $0 <PROJECT_ID> <GITHUB_REPO>}"
GITHUB_REPO="${2:?Usage: $0 <PROJECT_ID> <GITHUB_REPO>}"
REGION="asia-northeast1"
REPOSITORY="gdgoc-hackathon"
SA_NAME="github-actions"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
WIF_POOL="github-pool"
WIF_PROVIDER="github-provider"
DB_INSTANCE="gdgoc-hackathon-db"
DB_NAME="google_hackathon_db"
DB_USER="app"

echo "=== GCP CI/CD セットアップ ==="
echo "Project: ${PROJECT_ID}"
echo "Region:  ${REGION}"
echo "Repo:    ${GITHUB_REPO}"
echo ""

gcloud config set project "${PROJECT_ID}"

echo ">>> API を有効化中..."
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com

echo ">>> Artifact Registry リポジトリを作成中..."
gcloud artifacts repositories create "${REPOSITORY}" \
  --repository-format=docker \
  --location="${REGION}" \
  --description="GDGoC Hackathon Docker images" \
  2>/dev/null || echo "  (既に存在します)"

echo ">>> Cloud SQL インスタンスを作成中..."
gcloud sql instances create "${DB_INSTANCE}" \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region="${REGION}" \
  --storage-auto-increase \
  2>/dev/null || echo "  (既に存在します)"

gcloud sql databases create "${DB_NAME}" \
  --instance="${DB_INSTANCE}" \
  2>/dev/null || echo "  (既に存在します)"

DB_PASSWORD=$(openssl rand -base64 24)
gcloud sql users create "${DB_USER}" \
  --instance="${DB_INSTANCE}" \
  --password="${DB_PASSWORD}" \
  2>/dev/null || echo "  (既に存在します)"

CLOUD_SQL_INSTANCE="${PROJECT_ID}:${REGION}:${DB_INSTANCE}"

echo ">>> シークレットを作成中..."
DJANGO_SECRET_KEY=$(openssl rand -base64 50)
gcloud secrets create "django-secret-key" --replication-policy="automatic" 2>/dev/null || true
echo -n "${DJANGO_SECRET_KEY}" | gcloud secrets versions add "django-secret-key" --data-file=-
gcloud secrets create "db-password" --replication-policy="automatic" 2>/dev/null || true
echo -n "${DB_PASSWORD}" | gcloud secrets versions add "db-password" --data-file=-

echo ">>> サービスアカウントを作成中..."
gcloud iam service-accounts create "${SA_NAME}" \
  --display-name="GitHub Actions" \
  2>/dev/null || echo "  (既に存在します)"

for role in roles/run.admin roles/artifactregistry.writer roles/iam.serviceAccountUser roles/secretmanager.secretAccessor roles/cloudsql.client; do
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="${role}" \
    --condition=None \
    --quiet
done

echo ">>> Workload Identity Federation を設定中..."
gcloud iam workload-identity-pools create "${WIF_POOL}" \
  --location="global" \
  --display-name="GitHub Actions Pool" \
  2>/dev/null || echo "  (Pool 既に存在します)"

gcloud iam workload-identity-pools providers create-oidc "${WIF_PROVIDER}" \
  --location="global" \
  --workload-identity-pool="${WIF_POOL}" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='${GITHUB_REPO}'" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  2>/dev/null || echo "  (Provider 既に存在します)"

WIF_POOL_ID=$(gcloud iam workload-identity-pools describe "${WIF_POOL}" \
  --location="global" --format="value(name)")

gcloud iam service-accounts add-iam-policy-binding "${SA_EMAIL}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${WIF_POOL_ID}/attribute.repository/${GITHUB_REPO}" \
  --quiet

WIF_PROVIDER_FULL="${WIF_POOL_ID}/providers/${WIF_PROVIDER}"

echo ""
echo "========================================="
echo "  セットアップ完了!"
echo "========================================="
echo ""
echo "GitHub Variables:"
echo "  GCP_PROJECT_ID:      ${PROJECT_ID}"
echo "  WIF_PROVIDER:        ${WIF_PROVIDER_FULL}"
echo "  WIF_SERVICE_ACCOUNT: ${SA_EMAIL}"
echo "  CLOUD_SQL_INSTANCE:  ${CLOUD_SQL_INSTANCE}"
