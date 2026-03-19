// プロフィール全情報（本体・プロジェクト・統計・スキル）をまとめて取得
const baseUrl = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ?? "";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? (sessionStorage.getItem("access_token") ?? localStorage.getItem("access_token")) : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function fetchProfileAll() {
  const headers = getAuthHeaders();
  const res = await fetch(`${baseUrl}/api/profile/me/`, {
    method: "GET",
    headers,
    credentials: "include",
  });
  if (!res.ok) throw new Error("プロフィール情報の取得に失敗しました");
  return res.json();
}
