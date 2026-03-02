<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: "auth",
});

const router = useRouter();

interface JwtPayload {
  user_id: string;
  email?: string;
  exp: number;
}

// JWT ペイロードをデコードしてユーザー情報を取得
const userEmail = computed<string>(() => {
  if (import.meta.server) return "";
  const token = localStorage.getItem("access_token");
  if (!token) return "";
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as JwtPayload;
    return payload.email ?? `ユーザー ID: ${payload.user_id}`;
  } catch {
    return "不明なユーザー";
  }
});

const accessToken = computed<string>(() => {
  if (import.meta.server) return "";
  return (localStorage.getItem("access_token") ?? "").substring(0, 50) + "...";
});

const handleLogout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  router.push("/login");
};
</script>

<template>
  <div class="container">
    <div class="card">
      <h1 class="title">ダッシュボード</h1>

      <div class="user-info">
        <p class="welcome">
          ようこそ、<strong>{{ userEmail }}</strong> さん！
        </p>
        <p class="sub-text">
          認証が完了しました。このページは認証済みユーザーのみアクセスできます。
        </p>
      </div>

      <div class="token-info">
        <h3 class="section-title">JWT 情報</h3>
        <p class="token-label">アクセストークン（60分有効）:</p>
        <code class="token-value">{{ accessToken }}</code>
      </div>

      <button @click="handleLogout" class="btn btn--danger">ログアウト</button>
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
  max-width: 500px;
}

.title {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.user-info {
  background: #e8f0fe;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.welcome {
  font-size: 1.05rem;
  margin-bottom: 0.5rem;
}

.sub-text {
  font-size: 0.875rem;
  color: #555;
}

.token-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.token-label {
  font-size: 0.8rem;
  color: #555;
  margin-bottom: 0.25rem;
}

.token-value {
  display: block;
  font-size: 0.75rem;
  background: #e9ecef;
  padding: 0.5rem;
  border-radius: 4px;
  word-break: break-all;
}

.btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn--danger {
  background: #dc3545;
  color: #fff;
}

.btn--danger:hover {
  background: #b02a37;
}
</style>
