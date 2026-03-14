export type AuthApiResult = {
  ok: boolean;
  message: string;
};

type ApiErrorBody = {
  ok?: boolean;
  message?: string;
  detail?: string;
  non_field_errors?: string[];
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
  const messageFromArray = data?.non_field_errors?.[0];
  const message =
    data?.message ?? data?.detail ?? messageFromArray ?? "Request failed.";

  return {
    ok: response.ok && (data?.ok ?? true),
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
