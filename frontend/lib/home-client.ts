import { apiUrl, buildAuthHeaders } from "@/lib/api";

// --- バックエンドAPIの型 ---

type ApiProject = {
  id: string;
  owner_name: string;
  owner_icon: string | null;
  progress_status: string;
  title: string;
  description: string;
  project_image_path: string | null;
  created_at: string;
  updated_at: string;
  technologies: string[];
  categories: string[];
  num_saved: number;
  skill_match_count: number;
};

type ApiSection = {
  id: string;
  title: string;
  reason: string;
  reason_detail: string | null;
  projects: ApiProject[];
};

type ApiCategory = {
  id: number;
  name: string;
  slug: string;
};

// --- UI向け型 (既存ページとの互換用) ---

export type UiFeatured = {
  id: string;
  title: string;
  description: string;
  badge: string;
  label: string;
  readTime: string;
  hostInitial: string;
  hostName: string;
  category: string;
};

export type UiUpdate = {
  id: string;
  title: string;
  status: string;
  statusColor: string;
  statusBg: string;
  time: string;
  description: string;
  author: string;
  avatarInitial: string;
  category: string;
  categoryTag: string;
};

export type HomeFeedResponse = {
  categories: { name: string; slug: string }[];
  featured: UiFeatured | null;
  updates: UiUpdate[];
};

// --- アダプター ---

const PROGRESS_STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  opening: { label: "RECRUITING", color: "#4fc3a1", bg: "#1a3028" },
  ongoing: { label: "ONGOING", color: "#6b9eff", bg: "#0d1f4a" },
  completed: { label: "COMPLETED", color: "#666666", bg: "#242424" },
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "今";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return diffDays === 1 ? "Yesterday" : `${diffDays}日前`;
}

function toUiFeatured(p: ApiProject): UiFeatured {
  const s = PROGRESS_STATUS_MAP[p.progress_status] ?? PROGRESS_STATUS_MAP.opening;
  return {
    id: p.id,
    title: p.title,
    description: p.description ?? p.technologies.slice(0, 3).join(" / "),
    badge: s.label,
    label: p.categories[0] ?? "Tech",
    readTime: formatRelativeTime(p.updated_at),
    hostInitial: (p.owner_name[0] ?? "?").toUpperCase(),
    hostName: p.owner_name,
    category: p.categories[0] ?? "",
  };
}

function toUiUpdate(p: ApiProject): UiUpdate {
  const s = PROGRESS_STATUS_MAP[p.progress_status] ?? PROGRESS_STATUS_MAP.opening;
  return {
    id: p.id,
    title: p.title,
    description: p.description ?? p.technologies.slice(0, 3).join(" · "),
    status: s.label,
    statusColor: s.color,
    statusBg: s.bg,
    time: formatRelativeTime(p.updated_at),
    author: p.owner_name,
    avatarInitial: (p.owner_name[0] ?? "?").toUpperCase(),
    category: p.categories[0] ?? "",
    categoryTag: p.categories[0] ?? "",
  };
}

// --- API呼び出し ---

export async function fetchHomeFeed(params?: {
  search?: string;
  category?: string;
}): Promise<HomeFeedResponse> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.category) query.set("category", params.category);

  const qs = query.toString();
  const url = apiUrl(`/api/home/${qs ? `?${qs}` : ""}`);

  const response = await fetch(url, {
    headers: buildAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch home feed.");
  }

  const data: { categories: ApiCategory[]; sections: ApiSection[] } =
    await response.json();

  const firstSection = data.sections[0];
  const recentSection =
    data.sections.find((s) => s.id === "recent") ??
    data.sections.find((s) => s.id === "search_results") ??
    data.sections[data.sections.length - 1];

  return {
    categories: data.categories.map((c) => ({ name: c.name, slug: c.slug })),
    featured: firstSection?.projects[0] ? toUiFeatured(firstSection.projects[0]) : null,
    updates: (recentSection?.projects ?? []).map(toUiUpdate),
  };
}
