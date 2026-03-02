<script setup lang="ts">
definePageMeta({ layout: false });

const { login, googleAuth } = useApi();
const config = useRuntimeConfig();
const router = useRouter();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);
const googleButtonRef = ref<HTMLDivElement | null>(null);

// Google Sign-In 初期化（クライアントサイドのみ）
onMounted(() => {
  const clientId = config.public.googleClientId as string;
  if (!clientId) return;

  // Google GSI スクリプトを動的に読み込む
  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  script.onload = () => {
    if (!window.google || !googleButtonRef.value) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCallback,
    });
    window.google.accounts.id.renderButton(googleButtonRef.value, {
      theme: "outline",
      size: "large",
      width: 340,
    });
  };
  document.head.appendChild(script);
});

const handleGoogleCallback = async (response: { credential: string }) => {
  loading.value = true;
  error.value = "";
  try {
    const res = await googleAuth(response.credential);
    localStorage.setItem("access_token", res.access);
    localStorage.setItem("refresh_token", res.refresh);
    router.push("/dashboard");
  } catch {
    error.value = "Google 認証に失敗しました。もう一度お試しください。";
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = "";
  try {
    const res = await login(email.value, password.value);
    localStorage.setItem("access_token", res.access);
    localStorage.setItem("refresh_token", res.refresh);
    router.push("/dashboard");
  } catch (e: unknown) {
    const err = e as { data?: { non_field_errors?: string[] } };
    const msg =
      err.data?.non_field_errors?.[0] ??
      "ログインに失敗しました。メールアドレスとパスワードを確認してください。";
    error.value = msg;
  } finally {
    loading.value = false;
  }
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: {
            client_id: string;
            callback: (r: { credential: string }) => void;
          }) => void;
          renderButton: (el: HTMLElement, opts: object) => void;
        };
      };
    };
  }
}
</script>

<template>
  <div class="container">
    <div class="card">
      <h1 class="title">ログイン</h1>

      <p v-if="error" class="alert alert--error">{{ error }}</p>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="field">
          <label class="label">メールアドレス</label>
          <input
            v-model="email"
            type="email"
            required
            class="input"
            placeholder="user@example.com"
          />
        </div>

        <div class="field">
          <label class="label">パスワード</label>
          <input
            v-model="password"
            type="password"
            required
            class="input"
            placeholder="パスワードを入力"
          />
        </div>

        <button type="submit" :disabled="loading" class="btn btn--primary">
          {{ loading ? "ログイン中..." : "ログイン" }}
        </button>
      </form>

      <div class="divider"><span>または</span></div>

      <!-- Google Sign-In ボタン（NUXT_PUBLIC_GOOGLE_CLIENT_ID が設定されている場合のみ有効） -->
      <div ref="googleButtonRef" class="google-btn" />

      <p class="link-text">
        アカウントをお持ちでない方は
        <NuxtLink to="/register">新規登録</NuxtLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.card {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.title {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.alert {
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.alert--error {
  background: #fce8e6;
  color: #c5221f;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 0.875rem;
  color: #555;
}

.input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
}

.input:focus {
  outline: none;
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
}

.btn {
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn--primary {
  background: #4285f4;
  color: #fff;
  margin-top: 0.5rem;
}

.btn--primary:hover:not(:disabled) {
  background: #3367d6;
}

.divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.5rem 0;
  color: #aaa;
  font-size: 0.875rem;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #e0e0e0;
}

.google-btn {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  min-height: 44px;
}

.link-text {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #555;
}
</style>
