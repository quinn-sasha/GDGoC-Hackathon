<script setup lang="ts">
definePageMeta({ layout: false });

const { register } = useApi();
const router = useRouter();

const email = ref("");
const username = ref("");
const password = ref("");
const message = ref("");
const error = ref("");
const loading = ref(false);

const handleSubmit = async () => {
  loading.value = true;
  error.value = "";
  message.value = "";
  try {
    await register(email.value, username.value, password.value);
    message.value = "確認メールを送信しました。メール内のリンクをクリックして認証を完了してください。";
  } catch (e: unknown) {
    const err = e as { data?: Record<string, string[]> };
    if (err.data) {
      // フィールドエラーを日本語で結合して表示
      const msgs = Object.values(err.data).flat().join(" / ");
      error.value = msgs || "登録に失敗しました。";
    } else {
      error.value = "登録に失敗しました。もう一度お試しください。";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="container">
    <div class="card">
      <h1 class="title">新規登録</h1>

      <p v-if="message" class="alert alert--success">{{ message }}</p>
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
          <label class="label">ユーザー名</label>
          <input
            v-model="username"
            type="text"
            required
            maxlength="30"
            class="input"
            placeholder="ユーザー名を入力"
          />
        </div>

        <div class="field">
          <label class="label">パスワード（8文字以上）</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="8"
            class="input"
            placeholder="パスワードを入力"
          />
        </div>

        <button type="submit" :disabled="loading" class="btn btn--primary">
          {{ loading ? "送信中..." : "登録する" }}
        </button>
      </form>

      <p class="link-text">
        既にアカウントをお持ちですか？
        <NuxtLink to="/login">ログイン</NuxtLink>
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

.alert--success {
  background: #e6f4ea;
  color: #137333;
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
  margin-top: 0.5rem;
  transition: opacity 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn--primary {
  background: #4285f4;
  color: #fff;
}

.btn--primary:hover:not(:disabled) {
  background: #3367d6;
}

.link-text {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #555;
}
</style>
