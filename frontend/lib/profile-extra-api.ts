// プロフィール全情報（本体・プロジェクト・統計・スキル）をまとめて取得
export async function fetchProfileAll() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ?? "";
  const res = await fetch(`${baseUrl}/api/profile/me/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!res.ok) throw new Error("プロフィール情報の取得に失敗しました");
  return res.json();
}
