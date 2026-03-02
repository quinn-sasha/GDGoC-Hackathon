/**
 * API 通信用コンポーザブル
 * Nuxt の $fetch（ofetch ベース）を使ってバックエンドと通信する
 */

interface TokenResponse {
  access: string;
  refresh: string;
}

export const useApi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase as string;

  /** Authorization ヘッダー付きのベースオプションを生成 */
  const authHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const register = (email: string, password: string) =>
    $fetch<{ message: string }>("/api/auth/register", {
      baseURL,
      method: "POST",
      body: { email, password },
    });

  const verifyEmail = (token: string) =>
    $fetch<TokenResponse>("/api/auth/verify-email", {
      baseURL,
      method: "POST",
      body: { token },
    });

  const login = (email: string, password: string) =>
    $fetch<TokenResponse>("/api/auth/login", {
      baseURL,
      method: "POST",
      body: { email, password },
    });

  const googleAuth = (idToken: string) =>
    $fetch<TokenResponse>("/api/auth/google", {
      baseURL,
      method: "POST",
      body: { id_token: idToken },
    });

  /** 認証済みリクエスト（Authorization ヘッダーを自動付与） */
  const authFetch = <T>(path: string, opts?: Parameters<typeof $fetch>[1]) =>
    $fetch<T>(path, {
      baseURL,
      ...opts,
      headers: {
        ...authHeaders(),
        ...(opts?.headers as Record<string, string> | undefined),
      },
    });

  return { register, verifyEmail, login, googleAuth, authFetch };
};
