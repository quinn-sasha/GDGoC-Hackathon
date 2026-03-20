/** ストレージからアクセストークンを取得する共通関数 */
export function getAuthToken(): string | null {
  return typeof window !== "undefined"
    ? (sessionStorage.getItem("access_token") ?? localStorage.getItem("access_token"))
    : null;
}

export type AuthApiResult = {
  ok: boolean;
  message: string;
  access?: string;
  refresh?: string;
};

type ApiErrorBody = {
  ok?: boolean;
  message?: string;
  detail?: string;
  non_field_errors?: string[];
  [key: string]: unknown;
};

type LoginPayload = {
  email: string;
  password: string;
  remember: boolean;
};

type RegisterPayload = {
  email: string;
  username: string;
  password: string;
};

type VerifyEmailPayload = {
  token: string;
};

function extractMessage(data: ApiErrorBody | null): string {
  if (!data) return "Request failed.";
  if (data.message) return String(data.message);
  if (data.detail) return String(data.detail);
  if (data.non_field_errors?.[0]) return String(data.non_field_errors[0]);
  // フィールドエラー（例: {"email": ["既に存在します"]}）の最初のメッセージを返す
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (Array.isArray(val) && typeof val[0] === "string") return val[0];
  }
  return "Request failed.";
}

async function postJson<TPayload>(
  url: string,
  payload: TPayload,
): Promise<AuthApiResult> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ??
    "http://localhost:8000";
  const requestUrl = `${baseUrl}${url}`;

  const response = await fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as ApiErrorBody | null;
  const message = extractMessage(data);

  // JWTトークンが返ってきた場合はlocalStorageに保存
  if (response.ok && data && typeof data.access === "string" && typeof window !== "undefined") {
    localStorage.setItem("access_token", data.access);
    if (typeof data.refresh === "string") {
      localStorage.setItem("refresh_token", data.refresh);
    }
  }

  return {
    ok: response.ok && (data?.ok ?? true),
    message,
    access: data?.access as string | undefined,
    refresh: data?.refresh as string | undefined,
  };
}

export function login(payload: LoginPayload) {
  return postJson("/api/auth/login", payload);
}

export function register(payload: RegisterPayload) {
  return postJson("/api/auth/register", payload);
}

export function verifyEmail(payload: VerifyEmailPayload) {
  return postJson("/api/auth/verify-email", payload);
}
