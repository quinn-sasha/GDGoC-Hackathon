<script setup lang="ts">
definePageMeta({ layout: false });

const { verifyEmail } = useApi();
const route = useRoute();
const router = useRouter();

type Status = "verifying" | "success" | "error";
const status = ref<Status>("verifying");
const errorMessage = ref("");

onMounted(async () => {
  const token = route.query.token as string | undefined;

  if (!token) {
    errorMessage.value = "トークンが見つかりません。確認メールのリンクを再度クリックしてください。";
    status.value = "error";
    return;
  }

  try {
    const res = await verifyEmail(token);
    localStorage.setItem("access_token", res.access);
    localStorage.setItem("refresh_token", res.refresh);
    status.value = "success";
    // 2秒後にダッシュボードへ遷移
    setTimeout(() => router.push("/dashboard"), 2000);
  } catch (e: unknown) {
    const err = e as { data?: { token?: string[] } };
    const msg = err.data?.token?.[0] ?? "メールアドレスの確認に失敗しました。";
    errorMessage.value = msg;
    status.value = "error";
  }
});
</script>

<template>
  <div class="container">
    <div class="card">
      <!-- 確認中 -->
      <template v-if="status === 'verifying'">
        <div class="spinner" />
        <h1 class="title">メールアドレスを確認中...</h1>
        <p class="text">しばらくお待ちください。</p>
      </template>

      <!-- 成功 -->
      <template v-else-if="status === 'success'">
        <div class="icon icon--success">✓</div>
        <h1 class="title title--success">確認完了！</h1>
        <p class="text">
          メールアドレスが確認されました。<br />ダッシュボードにリダイレクトします...
        </p>
      </template>

      <!-- エラー -->
      <template v-else>
        <div class="icon icon--error">✕</div>
        <h1 class="title title--error">確認に失敗しました</h1>
        <p class="error-text">{{ errorMessage }}</p>
        <NuxtLink to="/register" class="btn">再登録する</NuxtLink>
      </template>
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
  padding: 2.5rem 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top-color: #4285f4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.icon {
  font-size: 2.5rem;
  font-weight: bold;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.icon--success {
  background: #e6f4ea;
  color: #137333;
}

.icon--error {
  background: #fce8e6;
  color: #c5221f;
}

.title {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  color: #333;
}

.title--success {
  color: #137333;
}

.title--error {
  color: #c5221f;
}

.text {
  color: #555;
  font-size: 0.95rem;
  line-height: 1.6;
}

.error-text {
  color: #c5221f;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #4285f4;
  color: #fff;
  border-radius: 4px;
  font-size: 0.95rem;
  text-decoration: none;
}

.btn:hover {
  background: #3367d6;
  text-decoration: none;
}
</style>
