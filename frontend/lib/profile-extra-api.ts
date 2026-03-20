// プロフィール全情報（本体・プロジェクト・統計・スキル）をまとめて取得
const baseUrl = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ?? "";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? (sessionStorage.getItem("access_token") ?? localStorage.getItem("access_token")) : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

const ACCENTS = [
  "#8b5cf6",
  "#22c55e",
  "#0f766e",
  "#f97316",
  "#2563eb",
  "#16a34a",
  "#9333ea",
  "#6559ff",
  "#2f68ff",
  "#ff8a22",
  "#3d66ff",
  "#2f4c77",
  "#dc4e89",
];

function hashStringToIndex(s: string, mod: number) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % mod;
}

function mapProjectForUI(p: any) {
  const title = p.title ?? p.name ?? (p.id ? String(p.id) : "プロジェクト");
  const categories = Array.isArray(p.categories) ? p.categories : (p.categories ? [p.categories] : []);
  const categoryText = categories.length ? categories.join(" · ") : "";
  const owner = p.owner_name ?? "";
  const meta = categoryText ? (owner ? `${categoryText} · ${owner}` : categoryText) : owner;
  const badge = p.progress_status ?? "";
  const initial = title.trim().charAt(0).toUpperCase() || "P";
  const accent = ACCENTS[hashStringToIndex(title + (p.id ?? ""), ACCENTS.length)];
  const description = p.description ?? "";
  const members = p.members ?? "";
  return {
    // fields expected by existing UI
    id: p.id,
    name: title,
    meta,
    description,
    badge,
    initial,
    accent,
    members,
    // keep original raw data available if needed
    _raw: p,
  };
}

export async function fetchProfileAll() {
  const headers = getAuthHeaders();
  const res = await fetch(`${baseUrl}/api/profile/me/`, {
    method: "GET",
    headers,
    credentials: "include",
  });
  if (!res.ok) throw new Error("プロフィール情報の取得に失敗しました");
  const data = await res.json();
  const projects = Array.isArray(data.projects) ? data.projects.map(mapProjectForUI) : [];
  return { ...data, projects };
}
