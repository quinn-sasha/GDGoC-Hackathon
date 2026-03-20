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
  recommendedRail: { display: "flex", gap: 12, overflowX: "auto" as const, paddingBottom: 4, scrollSnapType: "x mandatory" as const, scrollBehavior: "smooth" as const },
  recommendedCard: { width: 320, minWidth: 320, scrollSnapAlign: "start" as const, borderRadius: 12, overflow: "hidden", background: "#171717", border: "1px solid #2a2a2a" },
  recommendedDots: { display: "flex", justifyContent: "center", gap: 8, marginTop: 12 },
  recommendedImageFrame: { position: "relative" as const, width: "100%", aspectRatio: "16/9", background: "#152126" },
  recommendedContent: { padding: "14px 16px 16px" },
  recommendedMetaRow: { display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 10 },
  recommendedDot: { width: 8, height: 8, borderRadius: "50%", background: "#444444", cursor: "pointer", border: "none", padding: 0, outline: "none" },
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
        // Try fetching profile projects even when no client-side token exists.
        // Some deployments authenticate via cookies (credentialed requests),
        // so require attempting the request rather than gating by local token.
        const prof = await fetchProfileAll();
        if (!isMounted) return;
        setProfileProjects(Array.isArray(prof.projects) ? prof.projects : []);
      } catch {
        // If unauthenticated or network error, keep an empty list (graceful fallback).
        if (!isMounted) return;
        setProfileProjects([]);
      }
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
      hostIcon: featured.hostIcon,
      projectImagePath: featured.projectImagePath,
    };
    const updateProjects = updates
      .filter((item) => item.id !== featured?.id)
      .slice(0, 8)
      .map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        technologies: item.technologies ?? [],
        category: item.category,
        badge: item.status,
        statusColor: item.statusColor,
        statusBg: item.statusBg,
        label: item.category,
        readTime: item.time,
        hostInitial: item.avatarInitial,
        hostName: toDisplayName(item.author),
        hostIcon: item.ownerIcon,
        projectImagePath: item.projectImagePath,
      }));
    const featuredWithExtras = {
      ...featuredProject,
      technologies: featured.technologies ?? [],
      statusColor: featured.statusColor,
      statusBg: featured.statusBg,
    };
    return [featuredWithExtras, ...updateProjects];
  }, [featured, updates]);

  const handleSelectRecommendation = (index: number) => {
    setActiveRecommendationIndex(index);
    const rail = recommendedRailRef.current;
    const nextCard = recommendedCardRefs.current[index];
    if (rail && nextCard) {
      rail.scrollTo({ left: nextCard.offsetLeft, behavior: "smooth" });
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
      <CommonHeader title="" isPC={isPC} />
      <main style={{ padding: 12, paddingBottom: isPC ? 140 : 200 }}>
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
          <h2 style={{ margin: 5, fontSize: 22 }}>おすすめ</h2>
          <div
            ref={recommendedRailRef}
            className="carousel-rail"
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
                  ref={(node) => { recommendedCardRefs.current[idx] = node; }}
                  className="rec-card"
                  style={S.recommendedCard}
                  onClick={() => handleOpenProjectDetail(p.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div style={{ ...S.recommendedImageFrame, position: "relative" }}>
                    {p.projectImagePath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.projectImagePath} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <Image src={buildProjectImage(p.title, p.category)} alt={p.title} fill sizes="(max-width:480px) 100vw, 420px" style={{ objectFit: "cover" }} />
                    )}
                    {/* ステータスバッジ（画像右上） */}
                    <span style={{ position: "absolute", top: 10, right: 10, fontSize: "0.7rem", fontWeight: 700, color: p.statusColor ?? "#888", background: p.statusBg ?? "#1a1a1a", borderRadius: 5, padding: "2px 8px", border: `1px solid ${p.statusColor ?? "#444"}33` }}>
                      {p.badge}
                    </span>
                  </div>
                  <div style={S.recommendedContent}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: "0.72rem", color: "#666" }}>{translateRelativeTime(p.readTime ?? "")}</span>
                    </div>
                    <h3 className="rec-clamp1" style={{ margin: "0 0 6px", fontSize: "0.97rem", fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{p.title}</h3>
                    <p className="rec-clamp2" style={{ margin: "0 0 10px", color: "#aaaaaa", fontSize: "0.83rem", lineHeight: 1.5 }}>{p.description}</p>
                    {p.technologies && p.technologies.length > 0 && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const, marginBottom: 10 }}>
                        {p.technologies.slice(0, 3).map((t: string) => (
                          <span key={t} style={{ fontSize: "0.68rem", color: "#777", background: "#222", borderRadius: 4, padding: "2px 6px", border: "1px solid #333" }}>{t}</span>
                        ))}
                        {p.technologies.length > 3 && (
                          <span style={{ fontSize: "0.68rem", color: "#555", padding: "2px 4px" }}>+{p.technologies.length - 3}</span>
                        )}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#4fc3a1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700, flexShrink: 0, overflow: "hidden" }}>
                        {p.hostIcon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.hostIcon} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          (p.hostInitial ?? "?").toUpperCase()
                        )}
                      </div>
                      <span style={{ fontSize: "0.78rem", color: "#777", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{p.hostName}</span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
          {/* グループドットインジケーター（3件 = 1グループ） */}
          {recommendedProjects.length > 0 && (() => {
            const groupSize = 3;
            const groupCount = Math.ceil(recommendedProjects.length / groupSize);
            const activeGroup = Math.floor(activeRecommendationIndex / groupSize);
            return (
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 14 }}>
                {Array.from({ length: groupCount }).map((_, gIdx) => (
                  <button
                    key={`group-dot-${gIdx}`}
                    type="button"
                    aria-label={`${gIdx + 1}グループ目を表示`}
                    aria-pressed={activeGroup === gIdx}
                    onClick={() => handleSelectRecommendation(gIdx * groupSize)}
                    style={{
                      width: activeGroup === gIdx ? 22 : 8,
                      height: 8,
                      borderRadius: 4,
                      background: activeGroup === gIdx ? "#ffffff" : "#444444",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      transition: "width 200ms ease, background 200ms ease",
                      outline: "none",
                    }}
                  />
                ))}
              </div>
            );
          })()}
        </section>

        <section ref={updatesSectionRef} style={S.section}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h3 style={{ margin: 5, fontSize: 22 }}>{isSearchMode ? "検索結果" : showAllUpdates ? "最近の更新プロジェクト" : "最新の更新"}</h3>
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
                      <div style={{ ...S.avatarSm, overflow: "hidden" }}>
                        {u.ownerIcon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.ownerIcon} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          u.avatarInitial
                        )}
                      </div>
                      <span style={{ color: "#aaaaaa" }}>{toDisplayName(u.author)}</span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section style={{ ...S.section, marginBottom: isPC ? 160 : 240 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h3 style={{ margin: 5, fontSize: 22 }}>参加中のプロジェクト</h3>
          </div>
          {profileProjects.length === 0 ? (
            <div style={{ ...S.card, textAlign: "center", padding: 24 }}>
              <p style={{ margin: 0, color: "#c7c7c7", fontSize: "0.96rem" }}>まだ参加中のプロジェクトがありません。</p>
              <p style={{ margin: "8px 0 16px", color: "#9a9a9a", fontSize: "0.86rem" }}>関心のあるプロジェクトを探して参加したり、新しく募集を作成してみましょう。</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => router.push("/search")} style={{ padding: "10px 14px", borderRadius: 12, border: "none", background: "#8aff1d", color: "#111111", fontWeight: 800, cursor: "pointer" }}>
                  プロジェクトを探す
                </button>
                <button type="button" onClick={() => router.push("/project/recruit")} style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #2a2a2a", background: "#111111", color: "#d0d0d0", cursor: "pointer" }}>
                  募集を作成
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {profileProjects.map((project: any) => {
                const STATUS_LABEL: Record<string, string> = { opening: "開始前", ongoing: "進行中", completed: "完了" };
                const STATUS_COLOR: Record<string, string> = { opening: "#6699ff", ongoing: "#4fc3a1", completed: "#cc9944" };
                const title = project.title ?? String(project.id ?? "");
                return (
                  <article key={project.id ?? title} style={{ borderRadius: 12, overflow: "hidden", background: "#171717", border: "1px solid #232323" }}>
                    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#152126" }}>
                      {project.project_image_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={project.project_image_path} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <Image src={buildProjectImage(title, project.categories?.[0] ?? "")} alt={title} fill sizes="(max-width:480px) 100vw, 420px" style={{ objectFit: "cover" }} />
                      )}
                    </div>
                    <div style={{ padding: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#fff" }}>{title}</h4>
                        <span style={{ fontSize: "0.75rem", color: STATUS_COLOR[project.progress_status] ?? "#aaa", background: "#1a1a1a", borderRadius: 5, padding: "2px 8px", whiteSpace: "nowrap" as const }}>
                          {STATUS_LABEL[project.progress_status] ?? project.progress_status ?? ""}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "linear-gradient(135deg,#f9a8a8 0%,#d47fa6 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 700, overflow: "hidden", flexShrink: 0 }}>
                          {project.owner_icon ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={project.owner_icon} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            (project.owner_name?.[0] ?? "?").toUpperCase()
                          )}
                        </div>
                        <span style={{ fontSize: "0.78rem", color: "#aaaaaa" }}>{project.owner_name}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button type="button" onClick={() => router.push(`/project/${project.id}`)} style={{ borderRadius: 8, background: "#8aff1d", color: "#111", fontWeight: 700, padding: "8px 12px", border: "none", cursor: "pointer", fontSize: "0.85rem" }}>開く</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <button type="button" style={S.createFab(!isPC)} onClick={() => router.push("/project/recruit")} aria-label="プロジェクト募集を作成">
          ＋
        </button>
      </main>
    </div>
  );

}
