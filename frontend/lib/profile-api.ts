const BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ?? "http://localhost:8000";

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined"
      ? (sessionStorage.getItem("access_token") ?? localStorage.getItem("access_token"))
      : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

// 自分のプロフィール取得
export async function fetchProfile() {
  const res = await fetch(`${BASE}/api/profile/me/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("プロフィール取得に失敗しました");
  return res.json();
}

// プロフィール更新
export async function updateProfile(data: Record<string, unknown>) {
  const res = await fetch(`${BASE}/api/profile/me/`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("プロフィール更新に失敗しました");
  return res.json();
}

// 他ユーザーのプロフィール取得（me の場合は自分のプロフィール）
export async function fetchProfileById(userId: string) {
  const url =
    userId === "me"
      ? `${BASE}/api/profile/me/`
      : `${BASE}/api/profile/${encodeURIComponent(userId)}/`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("プロフィール取得に失敗しました");
  return res.json();
}
