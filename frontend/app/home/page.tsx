"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { CommonHeader } from "@/components/CommonHeader";
import { CommonSearchBar } from "@/components/CommonSearchBar";
import { CommonCategoryTabs } from "@/components/CommonCategoryTabs";
import { BottomNav } from "@/components/BottomNav";
import { SideNav } from "@/components/SideNav";
import { fetchHomeFeed, type HomeFeedUpdate, type HomeFeedFeatured } from "@/lib/home-client";
import { fetchProfileAll } from "@/lib/profile-extra-api";
import { buildProjectImage } from "@/lib/project-image";
import { HOME_CATEGORIES } from "@/lib/mock-data";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { buildUrl } from "@/lib/url";

const S = {
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 8px" },
  searchWrap: { margin: "10px 20px" },
  catsRow: { display: "flex", gap: 8, padding: "8px 20px", overflowX: "auto" as const },
  recommendedRail: { display: "flex", gap: 12, overflowX: "auto" as const, paddingBottom: 4 },
  recommendedCard: { width: 320, minWidth: 320, scrollSnapAlign: "start" as const, borderRadius: 12, overflow: "hidden", background: "#171717", border: "1px solid #2a2a2a" },
  recommendedDots: { display: "flex", justifyContent: "center", gap: 8, marginTop: 12 },
  recommendedImageFrame: { position: "relative" as const, width: "100%", aspectRatio: "16/9", background: "#152126" },
  recommendedContent: { padding: "14px 16px 16px" },
  recommendedMetaRow: { display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 10 },
  recommendedDot: { width: 8, height: 8, borderRadius: "50%", background: "#444444", cursor: "pointer" },
  recommendedDotActive: { background: "#ffffff", transform: "scale(1.15)" },
  section: { padding: "12px 20px 8px" },
  viewAll: { fontSize: "0.82rem", color: "#888888", textDecoration: "none" },
  updates: { display: "flex", flexDirection: "column" as const, gap: 12 },
  card: { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 14, padding: "14px 16px" },
  avatarSm: { width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#f9a8a8 0%,#d47fa6 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11 },
  createFab: (isMobile: boolean) => ({ position: "fixed" as const, right: 20, bottom: isMobile ? 100 : 20, width: 72, height: 72, borderRadius: "50%", background: "#8aff1d", color: "#111111", fontWeight: 800, fontSize: "2.2rem", lineHeight: 1, cursor: "pointer" }),
};

function toDisplayName(author: string) {
  return author
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(" ");
}

function translateRelativeTime(value: string) {
  if (/^(\d+)h ago$/i.test(value)) return value.replace(/^(\d+)h ago$/i, "$1時間前");
  if (/^(\d+)m ago$/i.test(value)) return value.replace(/^(\d+)m ago$/i, "$1分前");
  if (/^(\d+) min read$/i.test(value)) return value.replace(/^(\d+) min read$/i, "$1分で読める");
  if (value === "Yesterday") return "昨日";
  return value;
}

function isAllCategory(cat: string) {
  return cat === "すべて";
}

function getAllCategory(cats: string[]) {
  return cats.find((c) => isAllCategory(c)) ?? cats[0] ?? "すべて";
}

export default function HomePage() {
  const [isPC, setIsPC] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState(HOME_CATEGORIES[0] ?? "すべて");
  const [categories, setCategories] = useState<string[]>(HOME_CATEGORIES);
  const [featured, setFeatured] = useState<HomeFeedFeatured | null>(null);
  const [updates, setUpdates] = useState<HomeFeedUpdate[]>([]);
  const [profileProjects, setProfileProjects] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState("");
  const [showAllUpdates, setShowAllUpdates] = useState(false);
  const [sortMode, setSortMode] = useState<"new" | "old" | "title">("new");
  const [activeRecommendationIndex, setActiveRecommendationIndex] = useState(0);
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const updatesSectionRef = useRef<HTMLElement | null>(null);
  const recommendedRailRef = useRef<HTMLDivElement | null>(null);
  const recommendedCardRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const update = () => setIsPC(window.innerWidth >= 900);
    update();
    setMounted(true);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await fetchHomeFeed();
        if (!isMounted) return;
        setCategories(data.categories && data.categories.length ? data.categories : HOME_CATEGORIES);
        setFeatured(data.featured ?? null);
        setUpdates(Array.isArray(data.updates) ? data.updates : []);
        setFetchError("");
      } catch {
        if (!isMounted) return;
        setFetchError("最新の更新を同期できませんでした。保存済みデータを表示しています。");
      }

      try {
        const prof = await fetchProfileAll();
        if (!isMounted) return;
        setProfileProjects(Array.isArray(prof.projects) ? prof.projects : []);
      } catch {
        /* ignore */ }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // On the Home page, typing into the search bar should not filter the feed in-place.
  // The search input is kept for UX, but actual search is performed on the separate /search page
  // when the user submits (Enter / icon). Therefore ignore `search` for filtering here.
  const normalizedSearchQuery = "";
  const isSearchMode = false;

  const filteredUpdates = updates.filter((u) => {
    const matchesCategory = isAllCategory(activeCat) || u.categoryTag === activeCat;
    return matchesCategory;
  });

  const sortedUpdates = [...filteredUpdates];
  if (sortMode === "old") sortedUpdates.reverse();
  else if (sortMode === "title") sortedUpdates.sort((a, b) => a.title.localeCompare(b.title, "ja"));

  const visibleUpdates = showAllUpdates || isSearchMode ? sortedUpdates : sortedUpdates.slice(0, 2);

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
      .filter((item) => item.id !== featured?.id)
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

  const handleRecommendationRailScroll = () => {
    const rail = recommendedRailRef.current;
    if (!rail) return;
    const railCenter = rail.scrollLeft + rail.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    recommendedCardRefs.current.forEach((card, index) => {
      if (!card) return;
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(cardCenter - railCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    if (closestIndex !== activeRecommendationIndex) setActiveRecommendationIndex(closestIndex);
  };

  const handleRecommendationKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = Math.max(0, activeRecommendationIndex - 1);
      handleSelectRecommendation(prev);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = Math.min(recommendedCardRefs.current.length - 1, activeRecommendationIndex + 1);
      handleSelectRecommendation(next);
    }
  };

  const handleOpenProjectDetail = (projectId: string | number) => {
    router.push(`/project/${projectId}`);
  };

  const handleViewAll = () => {
    setShowAllUpdates(true);
    setSearch("");
    setActiveCat(getAllCategory(categories));
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      updatesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleCloseAllUpdates = () => setShowAllUpdates(false);
  const handleResetFeedFilters = () => {
    setSearch("");
    setActiveCat(getAllCategory(categories));
    setSortMode("new");
    setShowAllUpdates(false);
  };

  const NavBarElement = mounted ? (isPC ? <SideNav active="home" /> : <BottomNav active="home" />) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#111111", color: "#ffffff", paddingLeft: isPC ? 100 : 0 }}>
      {NavBarElement}
      <CommonHeader title="ホーム" isPC={isPC} />
      <main style={{ padding: 12 }}>
        <CommonSearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
          placeholder="プロジェクト、アイデアを検索"
          onSubmit={(v) => router.push(buildUrl("/search", { q: (v ?? search) || "" }))}
        />
        <CommonCategoryTabs categories={categories} active={activeCat} onSelect={(c) => setActiveCat(c)} />

        {fetchError ? <div style={{ color: "#b3b3b3", fontSize: "0.88rem", margin: "8px 20px" }}>{fetchError}</div> : null}

        <section style={S.section}>
          <h2 style={{ margin: 0, fontSize: 18 }}>おすすめ</h2>
          <div
            ref={recommendedRailRef}
            style={S.recommendedRail}
            onScroll={handleRecommendationRailScroll}
            tabIndex={0}
            onKeyDown={handleRecommendationKeyDown}
            aria-label="おすすめカルーセル"
          >
            {recommendedProjects.length === 0 ? (
              <div style={{ marginTop: 12, color: "#9a9a9a" }}>おすすめコンテンツはここに表示されます（プレースホルダ）</div>
            ) : (
              recommendedProjects.map((p, idx) => (
                <article
                  key={p.id}
                  ref={(node) => {
                    recommendedCardRefs.current[idx] = node;
                  }}
                  style={S.recommendedCard}
                  onClick={() => handleOpenProjectDetail(p.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div style={S.recommendedImageFrame}>
                    <Image src={buildProjectImage(p.title, p.category)} alt={p.title} fill sizes="(max-width:480px) 100vw, 420px" style={{ objectFit: "cover" }} />
                  </div>
                  <div style={S.recommendedContent}>
                    <div style={S.recommendedMetaRow}>
                      <span style={{ fontSize: "0.78rem", color: "#9a9a9a" }}>{p.badge}</span>
                      <span style={{ fontSize: "0.78rem", color: "#9a9a9a" }}>{translateRelativeTime(p.readTime ?? "")}</span>
                    </div>
                    <h3 style={{ margin: "6px 0 8px" }}>{p.title}</h3>
                    <p style={{ margin: 0, color: "#aaaaaa", fontSize: "0.9rem" }}>{p.description}</p>
                  </div>
                </article>
              ))
            )}
          </div>
          <div style={S.recommendedDots} aria-hidden={recommendedProjects.length === 0}>
            {recommendedProjects.map((p, idx) => (
              <button
                key={`dot-${p.id}`}
                type="button"
                aria-label={`${idx + 1}件目のおすすめを表示`}
                aria-pressed={activeRecommendationIndex === idx}
                style={{ ...S.recommendedDot, ...(activeRecommendationIndex === idx ? S.recommendedDotActive : {}) }}
                onClick={() => handleSelectRecommendation(idx)}
              />
            ))}
          </div>
        </section>

        <section ref={updatesSectionRef} style={S.section}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>{isSearchMode ? "検索結果" : showAllUpdates ? "最近の更新プロジェクト" : "最新の更新"}</h3>
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
              <p style={{ color: "#666666", fontSize: "0.88rem", textAlign: "center", padding: "24px 0" }}>条件に一致する更新はありません。</p>
            ) : (
              visibleUpdates.map((u) => (
                <article key={u.id} style={{ ...S.card, cursor: "pointer" }} onClick={() => handleOpenProjectDetail(u.id)} role="button" tabIndex={0}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                    <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#fff", lineHeight: 1.3, flex: 1 }}>{u.title}</h4>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", color: u.statusColor, background: u.statusBg, borderRadius: 5, padding: "2px 8px", whiteSpace: "nowrap" }}>{u.status}</span>
                      <span style={{ fontSize: "0.75rem", color: "#666666" }}>{translateRelativeTime(u.time)}</span>
                    </div>
                  </div>
                  <p style={{ margin: "0 0 10px", fontSize: "0.83rem", color: "#999999", lineHeight: 1.5 }}>{u.description}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.72rem", color: "#666666" }}>{u.author} ・ {u.category}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={S.avatarSm}>{u.avatarInitial}</div>
                      <span style={{ color: "#aaaaaa" }}>{toDisplayName(u.author)}</span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section style={S.section}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>参加中のプロジェクト</h3>
            <a style={S.viewAll}>もっと見る</a>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {profileProjects.slice(0, 3).map((project: any) => (
              <article key={project.name} style={{ ...S.card, borderLeft: `6px solid ${project.accent}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <div style={{ ...S.avatarSm, background: project.accent }}>{project.initial}</div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#fff" }}>{project.name}</h4>
                    <span style={{ fontSize: "0.78rem", color: "#aaaaaa" }}>{project.meta}</span>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "#fff", background: project.accent, borderRadius: 6, padding: "3px 8px" }}>{project.badge}</span>
                  <button type="button" style={{ marginLeft: 8, borderRadius: 8, border: "none", background: "#8aff1d", color: "#111111", fontWeight: 700, fontSize: "0.85rem", padding: "7px 14px", cursor: "pointer" }} onClick={() => router.push(`/myproject/${encodeURIComponent(project.name)}`)}>
                    開く
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <button type="button" style={S.createFab(!isPC)} onClick={() => router.push("/project/recruit")} aria-label="プロジェクト募集を作成">
          ＋
        </button>
      </main>
    </div>
  );

}
