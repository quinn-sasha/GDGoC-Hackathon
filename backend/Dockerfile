# ---- Backend Dockerfile ----
FROM python:3.13-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# システム依存パッケージ（psycopg2 用）
RUN apt-get update && \
    apt-get install -y --no-install-recommends libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Poetry インストール
RUN pip install --no-cache-dir poetry==2.1.1

# 依存関係のインストール（キャッシュ活用のため先にコピー）
COPY pyproject.toml poetry.lock ./
RUN poetry config virtualenvs.create false && \
    poetry lock --no-interaction && \
    poetry install --no-interaction --no-ansi --only main

# アプリケーションコードをコピー
COPY . .

# 静的ファイル収集
RUN python manage.py collectstatic --noinput 2>/dev/null || true

# Cloud Run は PORT 環境変数を提供する
ENV PORT=8080
EXPOSE ${PORT}

# gunicorn で起動
CMD exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:${PORT} \
    --workers 2 \
    --threads 4 \
    --timeout 120
