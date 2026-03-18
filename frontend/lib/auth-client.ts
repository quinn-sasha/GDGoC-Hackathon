import { BASE_URL, setTokens } from "@/lib/api";

export type AuthApiResult = {
  ok: boolean;
  message: string;
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
  const requestUrl = `${BASE_URL}${url}`;

  const response = await fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  const message = extractMessage(data as ApiErrorBody | null);

  // JWT トークンが含まれていれば保存 (login / verify-email)
  if (
    response.ok &&
    data &&
    typeof data.access === "string" &&
    typeof data.refresh === "string"
  ) {
    setTokens(data.access, data.refresh);
  }

  return {
    ok: response.ok && ((data as ApiErrorBody)?.ok ?? true),
    message,
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
