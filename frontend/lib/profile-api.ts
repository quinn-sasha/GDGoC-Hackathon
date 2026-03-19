const baseUrl = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ?? "";

// プロフィール取得
export async function fetchProfile() {
  const res = await fetch(`${baseUrl}/api/profile/me/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // 認証が必要な場合
  });
  if (!res.ok) throw new Error("プロフィール取得に失敗しました");
  return res.json();
}

// プロフィール更新
export async function updateProfile(data: Partial<ProfileSummary>) {
  const res = await fetch(`${baseUrl}/api/profile/me/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("プロフィール更新に失敗しました");
  return res.json();
}

// 型定義（既存のProfileSummaryを利用）
import type { ProfileSummary } from "@/lib/mock-data";
