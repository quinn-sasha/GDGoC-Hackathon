<script setup lang="ts">
// ルートは認証状態に応じてリダイレクト
const token = import.meta.client ? localStorage.getItem("access_token") : null;
await navigateTo(token ? "/dashboard" : "/register", { replace: true });
</script>
