const BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ?? "";

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined"
      ? (sessionStorage.getItem("access_token") ?? localStorage.getItem("access_token"))
      : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "今";
  if (min < 60) return `${min}分前`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}時間前`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}日前`;
  return new Date(isoString).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
}

type StatusStyle = { statusColor: string; statusBg: string; label: string };
const STATUS_STYLE_MAP: Record<string, StatusStyle> = {
  opening: { statusColor: "#6699ff", statusBg: "#1a1a2e", label: "開始前" },
  ongoing: { statusColor: "#4fc3a1", statusBg: "#0d2e22", label: "進行中" },
  completed: { statusColor: "#cc9944", statusBg: "#2a1a1a", label: "完了" },
};
function getStatusStyle(status: string): StatusStyle {
  return STATUS_STYLE_MAP[status] ?? { statusColor: "#888888", statusBg: "#1a1a1a", label: status };
}

export type HomeFeedUpdate = {
  id: string | number;
  title: string;
  status: string;
  statusColor: string;
  statusBg: string;
  time: string;
  description: string;
  technologies: string[];
  author: string;
  category: string;
  categoryTag: string;
  avatarInitial: string;
  ownerIcon: string;
  projectImagePath: string | null;
};

export type HomeFeedFeatured = {
  id: string | number;
  badge: string;
  label: string;
  readTime: string;
  title: string;
  description: string;
  technologies: string[];
  hostInitial: string;
  hostName: string;
  hostIcon: string;
  category: string;
  statusColor: string;
  statusBg: string;
  time: string;
  projectImagePath: string | null;
};

export type HomeFeedResponse = {
  categories: string[];
  featured: HomeFeedFeatured | null;
  updates: HomeFeedUpdate[];
};

export async function fetchHomeFeed(): Promise<HomeFeedResponse> {
  const res = await fetch(`${BASE}/api/projects/`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("プロジェクト一覧の取得に失敗しました");
  const data = await res.json();
  // Django REST Framework のリスト API はページネーション付き { results: [] } または配列
  const list: any[] = Array.isArray(data) ? data : (data.results ?? []);

  if (list.length === 0) {
    return { categories: ["すべて"], featured: null, updates: [] };
  }

  const updates: HomeFeedUpdate[] = list.map((p: any) => {
    const style = getStatusStyle(p.progress_status ?? "");
    const category =
      Array.isArray(p.categories) && p.categories.length > 0 ? String(p.categories[0]) : "";
    const techs: string[] = Array.isArray(p.technologies) ? p.technologies : [];
    return {
      id: p.id,
      title: p.title ?? "",
      status: style.label,
      statusColor: style.statusColor,
      statusBg: style.statusBg,
      time: formatRelativeTime(p.updated_at),
      description: p.description ?? techs.join(" / "),
      technologies: techs,
      author: p.owner_name ?? "",
      category,
      categoryTag: category,
      avatarInitial: (p.owner_name?.[0] ?? "?").toUpperCase(),
      ownerIcon: p.owner_icon ?? "",
      projectImagePath: p.project_image_path ?? null,
    };
  });

  const first = list[0];
  const firstStyle = getStatusStyle(first.progress_status ?? "");
  const firstCategory =
    Array.isArray(first.categories) && first.categories.length > 0
      ? String(first.categories[0])
      : "";
  const firstTechs: string[] = Array.isArray(first.technologies) ? first.technologies : [];
  const featured: HomeFeedFeatured = {
    id: first.id,
    badge: firstStyle.label,
    label: "注目",
    readTime: formatRelativeTime(first.updated_at),
    title: first.title ?? "",
    description: first.description ?? firstTechs.join(" / "),
    technologies: firstTechs,
    hostInitial: (first.owner_name?.[0] ?? "?").toUpperCase(),
    hostName: first.owner_name ?? "",
    hostIcon: first.owner_icon ?? "",
    category: firstCategory,
    projectImagePath: first.project_image_path ?? null,
    statusColor: firstStyle.statusColor,
    statusBg: firstStyle.statusBg,
    time: formatRelativeTime(first.updated_at),
  };

  const categoriesSet = new Set<string>(["すべて"]);
  for (const p of list) {
    if (Array.isArray(p.categories)) {
      for (const cat of p.categories) {
        if (cat) categoriesSet.add(String(cat));
      }
    }
  }

  return {
    categories: Array.from(categoriesSet),
    featured,
    updates,
  };
}
