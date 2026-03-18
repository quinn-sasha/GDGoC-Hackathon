
"use client";
import { isMobileUA } from "@/lib/device";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { HOME_CATEGORIES } from "@/lib/mock-data";
import { fetchProfileAll } from "@/lib/profile-extra-api";
import { joinProject } from "@/lib/project-api";
import { fetchHomeFeed } from "@/lib/home-client";
import { buildProjectImage } from "@/lib/project-image";

const CATEGORY_LABELS: Record<string, string> = {
  All: "すべて",
  Design: "デザイン",
  Tech: "技術",
  Art: "アート",
  Music: "音楽",
  Film: "映像",
};

const STATUS_LABELS: Record<string, string> = {
  ONGOING: "進行中",
  FEATURED: "注目",
  "IN REVIEW": "レビュー中",
  COMPLETED: "完了",
  DRAFT: "下書き",
};

function translateCategory(category: string) {
  return CATEGORY_LABELS[category] ?? category;
}

function translateStatus(status: string) {
  return STATUS_LABELS[status] ?? status;
}

function translateRelativeTime(value: string) {
  if (/^(\d+)h ago$/i.test(value)) {
    return value.replace(/^(\d+)h ago$/i, "$1時間前");
  }
  if (/^(\d+)m ago$/i.test(value)) {
    return value.replace(/^(\d+)m ago$/i, "$1分前");
  }
  if (/^(\d+) min read$/i.test(value)) {
    return value.replace(/^(\d+) min read$/i, "$1分で読める");
  }
  if (value === "Yesterday") {
    return "昨日";
  }

  return value;
}

function isAllCategory(category: string) {
  return category === "All" || category === "すべて";
}

function getAllCategory(categories: string[]) {
  return categories.find((category) => isAllCategory(category)) ?? categories[0] ?? "すべて";
}

function toDisplayName(author: string) {
  return author
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0] + word.slice(1).toLowerCase())
    .join(" ");
}

const getResponsiveRootStyle = () => {
  return (isPC: boolean) => {
    const style: any = {
      display: "flex",
      flexDirection: "column" as const,
      minHeight: "100vh",
      maxWidth: isPC ? "100vw" : 480,
      margin: isPC ? "0" : "0 auto",
      background: "#111111",
      color: "#ffffff",
      fontFamily: "'Segoe UI', sans-serif",
      position: "relative" as const,
    };
    if (isPC) style.paddingLeft = 100;
    return style;
  };
};

const S = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px 8px",
  },
  avatarLg: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f9a8a8 0%, #d47fa6 100%)",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 700,
    color: "#fff",
  },
  avatarSm: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f9a8a8 0%, #d47fa6 100%)",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    color: "#fff",
  },
  // iconBtn: 未使用のため削除
  searchWrap: {
    position: "relative" as const,
    margin: "10px 20px",
  },
  searchIcon: {
    position: "absolute" as const,
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#888888",
    pointerEvents: "none" as const,
  },
  searchInput: {
    width: "100%",
    background: "#1e1e1e",
    border: "none",
    borderRadius: 24,
    padding: "12px 16px 12px 42px",
    color: "#ffffff",
    fontSize: "0.9rem",
    boxSizing: "border-box" as const,
    outline: "none",
  },
  searchClearBtn: {
    position: "absolute" as const,
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    background: "#2a2a2a",
    color: "#cfcfcf",
    borderRadius: 999,
    width: 26,
    height: 26,
    fontSize: "0.9rem",
    lineHeight: 1,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
  },
  catsRow: {
    display: "flex",
    gap: 8,
    padding: "8px 20px 12px",
    overflowX: "auto" as const,
    scrollbarWidth: "none" as const,
  },
  feedTools: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "0 20px 6px",
  },
  resultMeta: {
    fontSize: "0.78rem",
    color: "#888888",
    whiteSpace: "nowrap" as const,
  },
  sortSelect: {
    background: "#1e1e1e",
    border: "1px solid #343434",
    borderRadius: 10,
    color: "#e2e2e2",
    fontSize: "0.8rem",
    padding: "7px 10px",
    outline: "none",
  },
  subtleBtn: {
    background: "none",
    border: "none",
    color: "#9f9f9f",
    fontSize: "0.8rem",
    cursor: "pointer",
    padding: "0 2px",
  },
  catBase: {
    flexShrink: 0,
    background: "#1e1e1e",
    border: "1px solid #333333",
    borderRadius: 20,
    color: "#cccccc",
    padding: "7px 16px",
    fontSize: "0.88rem",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  },
  catActive: {
    background: "#ffffff",
    color: "#111111",
    border: "1px solid #ffffff",
    fontWeight: 700,
    borderRadius: 20,
    padding: "7px 16px",
    fontSize: "0.88rem",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },
  scroll: {
    flex: 1,
    overflowY: "auto" as const,
    paddingBottom: 80,
  },
  section: {
    padding: "12px 20px 8px",
  },
  sectionLabel: {
    margin: "0 0 10px",
    fontSize: "0.72rem",
    letterSpacing: "0.1em",
    color: "#888888",
    fontWeight: 700,
  },
  sectionLabelRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  recommendedRail: {
    display: "flex",
    gap: 12,
    overflowX: "auto" as const,
    scrollSnapType: "x mandatory" as const,
    scrollbarWidth: "none" as const,
    paddingBottom: 4,
  },
  recommendedDots: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  recommendedDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    border: "none",
    padding: 0,
    background: "#444444",
    cursor: "pointer",
    transition: "transform 0.2s ease, background 0.2s ease",
  },
  recommendedDotActive: {
    background: "#ffffff",
    transform: "scale(1.15)",
  },
  recommendedCard: {
    width: "100%",
    minWidth: "100%",
    maxWidth: "100%",
    flexShrink: 0,
    scrollSnapAlign: "start" as const,
    cursor: "pointer",
    boxSizing: "border-box" as const,
    borderRadius: 18,
    overflow: "hidden",
    background: "#171717",
    border: "1px solid #2a2a2a",
  },
  recommendedImageFrame: {
    position: "relative" as const,
    width: "100%",
    aspectRatio: "16 / 9",
    background: "#152126",
  },
  recommendedContent: {
    padding: "14px 16px 16px",
  },
  recommendedMetaRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  recommendedStatus: {
    background: "#1a3028",
    color: "#4fc3a1",
    border: "1px solid #2d5a47",
    borderRadius: 6,
    padding: "3px 10px",
    fontSize: "0.7rem",
    letterSpacing: "0.08em",
    fontWeight: 700,
    whiteSpace: "nowrap" as const,
  },
  featured: {
    position: "relative" as const,
    borderRadius: 18,
    overflow: "hidden",
    minHeight: 200,
    background: "#152126",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "flex-end",
  },
  featuredImage: {
    objectFit: "cover" as const,
    zIndex: 0,
  },
  featuredOverlay: {
    position: "absolute" as const,
    inset: 0,
    background: "linear-gradient(180deg, rgba(8, 12, 14, 0.12) 0%, rgba(8, 12, 14, 0.72) 100%)",
    zIndex: 1,
  },
  // badgeOngoing: 未使用のため削除
  featuredBottom: {
    position: "relative" as const,
    zIndex: 2,
    padding: "0 18px 18px",
  },
  featuredTags: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  badgeBlue: {
    background: "#0d1f4a",
    color: "#6b9eff",
    border: "1px solid #1a3080",
    borderRadius: 6,
    padding: "3px 10px",
    fontSize: "0.7rem",
    letterSpacing: "0.08em",
    fontWeight: 700,
  },
  readTime: {
    fontSize: "0.78rem",
    color: "#aaaaaa",
  },
  featuredTitle: {
    margin: "0 0 8px",
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#ffffff",
    lineHeight: 1.3,
  },
  featuredDesc: {
    margin: "0 0 12px",
    fontSize: "0.85rem",
    color: "#aaaaaa",
    lineHeight: 1.5,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
  },
  featuredHost: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: "0.82rem",
    color: "#cccccc",
  },
  sectionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 700,
    color: "#ffffff",
  },
  viewAll: {
    fontSize: "0.82rem",
    color: "#888888",
    textDecoration: "none",
  },
  updates: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  card: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: 14,
    padding: "14px 16px",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  cardTitle: {
    margin: 0,
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#ffffff",
    lineHeight: 1.3,
    flex: 1,
  },
  cardRight: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-end",
    gap: 4,
    flexShrink: 0,
  },
  statusBadge: (color: string, bg: string) => ({
    fontSize: "0.68rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    color,
    background: bg,
    borderRadius: 5,
    padding: "2px 8px",
    whiteSpace: "nowrap" as const,
  }),
  cardTime: {
    fontSize: "0.75rem",
    color: "#666666",
  },
  cardDesc: {
    margin: "0 0 10px",
    fontSize: "0.83rem",
    color: "#999999",
    lineHeight: 1.5,
  },
  cardMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardAuthorLeft: {
    fontSize: "0.72rem",
    color: "#666666",
    letterSpacing: "0.04em",
  },
  cardAuthorRight: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: "0.8rem",
    color: "#aaaaaa",
  },
  nav: {
    position: "fixed" as const,
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 480,
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    background: "#1a1a1a",
    borderTop: "1px solid #2a2a2a",
    padding: "10px 0 14px",
    zIndex: 100,
  },
  navItem: {
    background: "none",
    border: "none",
    color: "#666666",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 4,
    fontSize: "0.72rem",
    padding: "0 20px",
  },
  navItemActive: {
    background: "none",
    border: "none",
    color: "#ffffff",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 4,
    fontSize: "0.72rem",
    padding: "0 20px",
  },
  createFab: (isMobile: boolean) => ({
    position: "fixed" as const,
    right: 20,
    bottom: isMobile ? 100 : 20, // モバイル時はナビバー分上げる
    width: 72,
    height: 72,
    border: "none",
    borderRadius: "50%",
    background: "#8aff1d",
    color: "#111111",
    fontWeight: 800,
    fontSize: "2.2rem",
    lineHeight: 1,
    padding: 0,
    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.35)",
    cursor: "pointer",
    zIndex: 120,
  }),
};

export default function HomePage() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rootStyle, setRootStyle] = useState(getResponsiveRootStyle()(false));
  useEffect(() => {
    // PC/モバイル判定とrootStyleを一括管理
    const updateDeviceState = () => {
      const isPC = window.innerWidth >= 900;
      setIsMobile(isMobileUA());
      setRootStyle(getResponsiveRootStyle()(isPC));
    };
    updateDeviceState();
    setMounted(true);
    window.addEventListener("resize", updateDeviceState);
    return () => window.removeEventListener("resize", updateDeviceState);
  }, []);
  const [activeCategory, setActiveCategory] = useState(HOME_CATEGORIES[0] ?? "すべて");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>(HOME_CATEGORIES);
  const [featured, setFeatured] = useState<any>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [profileProjects, setProfileProjects] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [showAllUpdates, setShowAllUpdates] = useState(false);
  const [sortMode, setSortMode] = useState<"new" | "old" | "title">("new");
  const [activeRecommendationIndex, setActiveRecommendationIndex] = useState(0);
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const updatesSectionRef = useRef<HTMLElement | null>(null);
  const recommendedRailRef = useRef<HTMLDivElement | null>(null);
  const recommendedCardRefs = useRef<Array<HTMLElement | null>>([]);

  const recommendedProjects = useMemo(() => {
    if (!featured) return [];
    const featuredProject = {
      id: featured.id,
      title: featured.title,
      description: featured.description,
      category: featured.category,
      badge: featured.badge,
      label: featured.label,
      readTime: featured.readTime,
      hostInitial: featured.hostInitial,
      hostName: featured.hostName,
    };
    const updateProjects = updates
      .filter((item) => item.id !== featured.id)
      .slice(0, 2)
      .map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        badge: item.status,
        label: item.category,
        readTime: item.time,
        hostInitial: item.avatarInitial,
        hostName: toDisplayName(item.author),
      }));
    return [featuredProject, ...updateProjects];
  }, [featured, updates]);

  const handleSelectRecommendation = (index: number) => {
    setActiveRecommendationIndex(index);
    const nextCard = recommendedCardRefs.current[index];
    if (nextCard) {
      nextCard.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadHomeFeed = async () => {
      try {
        const data = await fetchHomeFeed();
        if (!isMounted) return;
        const nextCategories = data.categories?.length ? data.categories : HOME_CATEGORIES;
        setCategories(nextCategories);
        setFeatured(data.featured ?? null);
        setUpdates(Array.isArray(data.updates) ? data.updates : []);
        setActiveCategory((prev) => nextCategories.includes(prev) ? prev : (nextCategories[0] ?? HOME_CATEGORIES[0] ?? "すべて"));
        setFetchError("");
      } catch {
        if (!isMounted) return;
        setFetchError("最新の更新を同期できませんでした。保存済みデータを表示しています。");
      }
    };

    const loadProfileProjects = async () => {
      try {
        const data = await fetchProfileAll();
        if (!isMounted) return;
        setProfileProjects(Array.isArray(data.projects) ? data.projects : []);
      } catch {
        if (!isMounted) return;
        setProfileProjects([]);
      }
    };

    loadHomeFeed();
    loadProfileProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const isSearchMode = normalizedSearchQuery !== "";

  const filteredUpdates = updates.filter((u) => {
    const matchesCategory =
      isAllCategory(activeCategory) || u.categoryTag === activeCategory;
    const matchesSearch =
      normalizedSearchQuery === "" ||
      u.title.toLowerCase().includes(normalizedSearchQuery) ||
      u.description.toLowerCase().includes(normalizedSearchQuery) ||
      u.author.toLowerCase().includes(normalizedSearchQuery);
    return matchesCategory && matchesSearch;
  });

  const sortedUpdates = [...filteredUpdates];
  if (sortMode === "old") {
    sortedUpdates.reverse();
  } else if (sortMode === "title") {
    sortedUpdates.sort((a, b) => a.title.localeCompare(b.title, "ja"));
  }

  const visibleUpdates = showAllUpdates || isSearchMode
    ? sortedUpdates
    : sortedUpdates.slice(0, 2);

  const handleViewAll = () => {
    setShowAllUpdates(true);
    setSearchQuery("");
    setActiveCategory(getAllCategory(categories));
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      updatesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleCloseAllUpdates = () => {
    setShowAllUpdates(false);
  };

  const handleResetFeedFilters = () => {
    setSearchQuery("");
    setActiveCategory(getAllCategory(categories));
    setSortMode("new");
    setShowAllUpdates(false);
  };

  const handleOpenProjectDetail = (projectId: number) => {
    router.push(`/project/${projectId}`);
  };

  const handleRecommendationRailScroll = () => {
    const rail = recommendedRailRef.current;
    if (!rail) {
      return;
    }

    const railCenter = rail.scrollLeft + rail.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    recommendedCardRefs.current.forEach((card, index) => {
      if (!card) {
        return;
      }

      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(cardCenter - railCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeRecommendationIndex) {
      setActiveRecommendationIndex(closestIndex);
    }
  };

  // ナビバー分岐（mounted後のみ描画）
  let NavBar = null;
  if (mounted) {
    NavBar = isMobile ? (
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 480,
          background: "#1a1a1a",
          borderTop: "1px solid #2a2a2a",
          display: "flex",
          justifyContent: "space-around",
          padding: "10px 0 calc(10px + env(safe-area-inset-bottom))",
          zIndex: 100,
        }}
      >
        <button style={{ background: "none", border: "none", color: "#fff", font: "inherit", fontSize: "0.72rem", padding: "0 20px" }} onClick={() => router.push("/home")}>ホーム</button>
        <button style={{ background: "none", border: "none", color: "#fff", font: "inherit", fontSize: "0.72rem", padding: "0 20px" }} onClick={() => router.push("/chat")}>チャット</button>
        <button style={{ background: "none", border: "none", color: "#fff", font: "inherit", fontSize: "0.72rem", padding: "0 20px" }} onClick={() => router.push("/profile/me")}>プロフィール</button>
      </nav>
    ) : (
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: 100,
          background: "#1a1a1a",
          borderRight: "1px solid #2a2a2a",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          padding: "32px 0 0",
          zIndex: 100,
          gap: 8,
        }}
      >
        <button style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: "0.82rem", marginBottom: 16, padding: "0 12px" }} onClick={() => router.push("/home") }>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
          </svg>
          <span style={{ fontSize: "0.82rem", color: "#fff", fontWeight: 700 }}>ホーム</span>
        </button>
        <button style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: "0.82rem", marginBottom: 16, padding: "0 12px" }} onClick={() => router.push("/chat") }>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span style={{ fontSize: "0.82rem", color: "#fff", fontWeight: 700 }}>チャット</span>
        </button>
        <button style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: "0.82rem", marginBottom: 16, padding: "0 12px" }} onClick={() => router.push("/profile/me") }>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span style={{ fontSize: "0.82rem", color: "#fff", fontWeight: 700 }}>プロフィール</span>
        </button>
      </nav>
    );
  }

  return (
    <div style={rootStyle}>
      {mounted && NavBar}
      {/* Header */}
      <header style={S.header}>
        <div
          style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
          onClick={() => router.push("/profile/me")}
        >
          <div style={S.avatarLg}>Me</div>
          <span style={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff" }}>マイページ</span>
        </div>
      </header>

      {/* Search */}
      <div style={S.searchWrap}>
        <svg style={S.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          style={S.searchInput}
          type="search"
          placeholder="プロジェクト、アイデア、クリエイターを検索"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery ? (
          <button type="button" style={S.searchClearBtn} onClick={() => setSearchQuery("")} aria-label="検索をクリア">
            ×
          </button>
        ) : null}
      </div>

      {fetchError ? (
        <div style={{ color: "#b3b3b3", fontSize: "0.78rem", margin: "0 20px 10px" }}>
          {fetchError}
        </div>
      ) : null}

      {/* Category tabs */}
      <div style={S.catsRow}>
        {categories.map((cat) => (
          <button
            key={cat}
            style={activeCategory === cat ? S.catActive : S.catBase}
            onClick={() => setActiveCategory(cat)}
          >
            {translateCategory(cat)}
          </button>
        ))}
      </div>

      <div style={S.feedTools}>
        <span style={S.resultMeta}>{sortedUpdates.length}件ヒット</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as "new" | "old" | "title")}
            style={S.sortSelect}
            aria-label="並び替え"
          >
            <option value="new">新着順</option>
            <option value="old">古い順</option>
            <option value="title">タイトル順</option>
          </select>
          {(searchQuery || !isAllCategory(activeCategory) || sortMode !== "new" || showAllUpdates) ? (
            <button type="button" style={S.subtleBtn} onClick={handleResetFeedFilters}>
              リセット
            </button>
          ) : null}
        </div>
      </div>

      <div ref={scrollContainerRef} style={S.scroll}>
        {!showAllUpdates && !isSearchMode ? (
          <section style={S.section}>
            <div style={S.sectionLabelRow}>
              <p style={{ ...S.sectionLabel, margin: 0 }}>あなたへのおすすめ</p>
            </div>
            <div ref={recommendedRailRef} style={S.recommendedRail} onScroll={handleRecommendationRailScroll}>
              {recommendedProjects.map((project) => (
                <article
                  key={project.id}
                  ref={(node) => {
                    recommendedCardRefs.current[recommendedProjects.findIndex((item) => item.id === project.id)] = node;
                  }}
                  style={S.recommendedCard}
                  onClick={() => handleOpenProjectDetail(project.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleOpenProjectDetail(project.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${project.title} の詳細へ移動`}
                >
                  <div style={S.recommendedImageFrame}>
                    <Image
                      src={buildProjectImage(project.title, project.category)}
                      alt={`${project.title} の背景画像`}
                      fill
                      sizes="(max-width: 480px) 100vw, 420px"
                      style={S.featuredImage}
                    />
                  </div>
                  <div style={S.recommendedContent}>
                    <div style={S.recommendedMetaRow}>
                      <span style={S.recommendedStatus}>{translateStatus(project.badge)}</span>
                      <span style={S.readTime}>{translateRelativeTime(project.readTime)}</span>
                    </div>
                    <div style={S.featuredTags}>
                      <span style={S.badgeBlue}>{translateStatus(project.label)}</span>
                    </div>
                    <h2 style={S.featuredTitle}>{project.title}</h2>
                    <p style={S.featuredDesc}>{project.description}</p>
                    <div style={S.featuredHost}>
                      <div style={S.avatarSm}>{project.hostInitial}</div>
                      <span>{project.hostName}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div style={S.recommendedDots} aria-label="おすすめのページ切り替え">
              {recommendedProjects.map((project, index) => (
                <button
                  key={project.id}
                  type="button"
                  aria-label={`${index + 1}件目のおすすめを表示`}
                  aria-pressed={activeRecommendationIndex === index}
                  style={{
                    ...S.recommendedDot,
                    ...(activeRecommendationIndex === index ? S.recommendedDotActive : {}),
                  }}
                  onClick={() => handleSelectRecommendation(index)}
                />
              ))}
            </div>
          </section>

        ) : null}

        {/* Latest Updates */}
        <section ref={updatesSectionRef} style={S.section}>
          <div style={S.sectionRow}>
            <h3 style={S.sectionTitle}>{isSearchMode ? "検索結果" : showAllUpdates ? "最近の更新プロジェクト" : "最新の更新"}</h3>
            {showAllUpdates && !isSearchMode ? (
              <button type="button" style={{ ...S.viewAll, background: "none", border: "none", cursor: "pointer" }} onClick={handleCloseAllUpdates}>
                閉じる
              </button>
            ) : !isSearchMode ? (
              <button type="button" style={{ ...S.viewAll, background: "none", border: "none", cursor: "pointer" }} onClick={handleViewAll}>
                すべて見る
              </button>
            ) : null}
          </div>
          <div style={S.updates}>
            {visibleUpdates.length === 0 ? (
              <p style={{ color: "#666666", fontSize: "0.88rem", textAlign: "center", padding: "24px 0" }}>
                条件に一致する更新はありません。
              </p>
            ) : (
              visibleUpdates.map((u) => (
              <article
                key={u.id}
                style={{ ...S.card, cursor: "pointer" }}
                onClick={() => handleOpenProjectDetail(u.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleOpenProjectDetail(u.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`${u.title} の詳細へ移動`}
              >
                <div style={S.cardTop}>
                  <h4 style={S.cardTitle}>{u.title}</h4>
                  <div style={S.cardRight}>
                    <span style={S.statusBadge(u.statusColor, u.statusBg)}>
                      {translateStatus(u.status)}
                    </span>
                    <span style={S.cardTime}>{translateRelativeTime(u.time)}</span>
                  </div>
                </div>
                <p style={S.cardDesc}>{u.description}</p>
                <div style={S.cardMeta}>
                  <span style={S.cardAuthorLeft}>
                    {u.author} ・ {translateCategory(u.category)}
                  </span>
                  <div style={S.cardAuthorRight}>
                    <div style={S.avatarSm}>{u.avatarInitial}</div>
                    <span>{toDisplayName(u.author)}</span>
                  </div>
                </div>
              </article>
            ))
            )}
          </div>
        </section>

        <section style={S.section}>
          <div style={S.sectionRow}>
            <h3 style={S.sectionTitle}>参加中のプロジェクト</h3>
          </div>
          <div style={S.updates}>
            {profileProjects.slice(0, 3).map((project: any) => (
              <article key={project.name} style={{ ...S.card, borderLeft: `6px solid ${project.accent}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <div style={{ ...S.avatarSm, background: project.accent }}>{project.initial}</div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ ...S.cardTitle, margin: 0 }}>{project.name}</h4>
                    <span style={{ fontSize: "0.78rem", color: "#aaaaaa" }}>{project.meta}</span>
                  </div>
                  <span style={{ ...S.statusBadge("#ffffff", project.accent), fontSize: "0.7rem" }}>{project.badge}</span>
                  <button
                    type="button"
                    style={{
                      marginLeft: 8,
                      borderRadius: 8,
                      border: "none",
                      background: "#8aff1d",
                      color: "#111111",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      padding: "7px 14px",
                      cursor: "pointer",
                    }}
                    onClick={async () => {
                      try {
                        await joinProject({ projectId: project.id });
                        alert("プロジェクトに参加しました！");
                      } catch (e) {
                        alert("参加に失敗しました");
                      }
                    }}
                  >参加</button>
                </div>
                <p style={S.cardDesc}>{project.description}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", color: "#888888" }}>
                  <span>{project.members}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <button type="button" style={S.createFab(isMobile)} onClick={() => router.push("/project/recruit")} aria-label="プロジェクト募集を作成">
        ＋
      </button>

      {/* Bottom nav（isMobileのみ表示） */}
      {/* hydrationエラー防止のためmounted後のみ描画 */}
      {mounted && isMobile && (
        <nav style={S.nav}>
          <button style={S.navItemActive}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
            </svg>
            <span>ホーム</span>
          </button>
          <button style={S.navItem} onClick={() => router.push("/chat")}> 
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>チャット</span>
          </button>
          <button style={S.navItem} onClick={() => router.push("/profile/me")}> 
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>プロフィール</span>
          </button>
        </nav>
      )}
    </div>
  );
}


