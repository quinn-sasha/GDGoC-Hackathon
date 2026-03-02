/**
 * 認証ミドルウェア
 * access_token がなければ /login にリダイレクトする
 */
export default defineNuxtRouteMiddleware(() => {
  // サーバーサイドではスキップ（localStorage はクライアント専用）
  if (import.meta.server) return;

  const token = localStorage.getItem("access_token");
  if (!token) {
    return navigateTo("/login");
  }
});
