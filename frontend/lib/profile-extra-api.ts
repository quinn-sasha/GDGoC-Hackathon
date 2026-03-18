import { apiUrl, buildAuthHeaders } from "@/lib/api";

export async function fetchProfileAll() {
  const res = await fetch(apiUrl("/api/profile/me/"), {
    headers: buildAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("プロフィール情報の取得に失敗しました");
  return res.json();
}
