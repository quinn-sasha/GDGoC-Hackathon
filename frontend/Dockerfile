# ---- Frontend Dockerfile (multi-stage) ----

# Stage 1: Build
FROM node:22-alpine AS build

WORKDIR /app

# 依存関係のインストール（キャッシュ活用）
COPY package.json package-lock.json ./
RUN npm ci

# アプリケーションコードをコピーしてビルド
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS production

WORKDIR /app

# ビルド成果物をコピー
COPY --from=build /app/.output /app/.output

# Cloud Run は PORT 環境変数を提供する
ENV PORT=8080 \
    HOST=0.0.0.0 \
    NODE_ENV=production

EXPOSE ${PORT}

# Nuxt SSR サーバーを起動
CMD ["node", ".output/server/index.mjs"]
