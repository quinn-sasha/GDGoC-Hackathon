// プロフィール取得
export async function fetchProfile() {
  const token = typeof window !== "undefined" ? (sessionStorage.getItem("access_token") ?? localStorage.getItem("access_token")) : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch("/api/profile/me/", {
    method: "GET",
    headers,
    credentials: "include",
  });
  if (!res.ok) throw new Error("プロフィール取得に失敗しました");
  return res.json();
}

// プロフィール更新
export async function updateProfile(data: Partial<ProfileSummary>) {
  const token = typeof window !== "undefined" ? (sessionStorage.getItem("access_token") ?? localStorage.getItem("access_token")) : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch("/api/profile/me/", {
    method: "PATCH",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("プロフィール更新に失敗しました");
  return res.json();
}

// 型定義（既存のProfileSummaryを利用）
import type { ProfileSummary } from "@/lib/mock-data";
