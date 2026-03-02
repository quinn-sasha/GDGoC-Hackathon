// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  // ランタイム設定（環境変数）
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? "http://localhost:8000",
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
    },
  },
});
