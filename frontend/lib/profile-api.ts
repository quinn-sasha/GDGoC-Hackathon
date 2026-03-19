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

function getAuthToken(): string | null {
  return typeof window !== "undefined"
    ? (sessionStorage.getItem("access_token") ?? localStorage.getItem("access_token"))
    : null;
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

// 技術スキル一覧取得
export async function fetchSkills(): Promise<{ id: number; name: string }[]> {
  const res = await fetch(`${BASE}/api/profile/skills/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("スキル一覧取得に失敗しました");
  return res.json();
}

// プロフィールアイコンをアップロード
export async function uploadProfileIcon(file: File): Promise<string> {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("image", file);
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}/api/profile/me/upload-icon/`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) {
    let detail = "アイコンのアップロードに失敗しました";
    try {
      const err = await res.json();
      if (err.detail) detail = String(err.detail);
    } catch { /* ignore */ }
    throw new Error(detail);
  }
  const data = await res.json();
  return data.icon_image_path as string;
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
