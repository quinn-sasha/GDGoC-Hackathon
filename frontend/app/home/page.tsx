"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HOME_CATEGORIES,
  HOME_FEATURED,
  HOME_UPDATES,
  PROFILE_SUMMARY,
  type HomeFeatured,
  type HomeUpdate,
} from "@/lib/mock-data";
import { fetchHomeFeed } from "@/lib/home-client";

const S = {
  root: {
    display: "flex",
    flexDirection: "column" as const,
    minHeight: "100vh",
    maxWidth: 480,
    margin: "0 auto",
    background: "#111111",
    color: "#ffffff",
    fontFamily: "'Segoe UI', sans-serif",
    position: "relative" as const,
  },
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
  iconBtn: {
    background: "none",
    border: "none",
    color: "#ffffff",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
  },
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
  catsRow: {
    display: "flex",
    gap: 8,
    padding: "8px 20px 12px",
    overflowX: "auto" as const,
    scrollbarWidth: "none" as const,
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
  featured: {
    position: "relative" as const,
    borderRadius: 18,
    overflow: "hidden",
    minHeight: 200,
    background: "linear-gradient(160deg, #2a4a3e 0%, #1a3028 50%, #0f1e18 100%)",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "flex-end",
  },
  badgeOngoing: {
    position: "absolute" as const,
    top: 14,
    right: 14,
    background: "#1a3028",
    color: "#4fc3a1",
    border: "1px solid #2d5a47",
    borderRadius: 6,
    padding: "3px 10px",
    fontSize: "0.7rem",
    letterSpacing: "0.08em",
    fontWeight: 700,
  },
  featuredBottom: {
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
};

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>(HOME_CATEGORIES);
  const [featured, setFeatured] = useState<HomeFeatured>(HOME_FEATURED);
  const [updates, setUpdates] = useState<HomeUpdate[]>(HOME_UPDATES);
  const [fetchError, setFetchError] = useState("");
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const loadHomeFeed = async () => {
      try {
        const data = await fetchHomeFeed();
        if (!isMounted) {
          return;
        }

        const nextCategories = data.categories?.length
          ? data.categories
          : HOME_CATEGORIES;
        setCategories(nextCategories);
        setFeatured(data.featured ?? HOME_FEATURED);
        setUpdates(Array.isArray(data.updates) ? data.updates : HOME_UPDATES);
        setActiveCategory((prev) =>
          nextCategories.includes(prev) ? prev : (nextCategories[0] ?? "All"),
        );
        setFetchError("");
      } catch {
        if (!isMounted) {
          return;
        }
        setFetchError("Could not sync latest updates. Showing saved data.");
      }
    };

    loadHomeFeed();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredUpdates = updates.filter((u) => {
    const matchesCategory =
      activeCategory === "All" || u.categoryTag === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === "" ||
      u.title.toLowerCase().includes(q) ||
      u.description.toLowerCase().includes(q) ||
      u.author.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={S.root}>
      {/* Header */}
      <header style={S.header}>
        <div
          style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
          onClick={() => router.push("/profile")}
        >
          <div style={S.avatarLg}>{PROFILE_SUMMARY.avatarInitial}</div>
          <span style={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff" }}>{PROFILE_SUMMARY.name}</span>
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
          placeholder="Search projects, ideas, or creators..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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
            {cat}
          </button>
        ))}
      </div>

      <div style={S.scroll}>
        {/* Recommended */}
        <section style={S.section}>
          <p style={S.sectionLabel}>RECOMMENDED FOR YOU</p>
          <div style={S.featured}>
            <span style={S.badgeOngoing}>{featured.badge}</span>
            <div style={S.featuredBottom}>
              <div style={S.featuredTags}>
                <span style={S.badgeBlue}>{featured.label}</span>
                <span style={S.readTime}>{featured.readTime}</span>
              </div>
              <h2 style={S.featuredTitle}>{featured.title}</h2>
              <p style={S.featuredDesc}>{featured.description}</p>
              <div style={S.featuredHost}>
                <div style={S.avatarSm}>{featured.hostInitial}</div>
                <span>{featured.hostName}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Updates */}
        <section style={S.section}>
          <div style={S.sectionRow}>
            <h3 style={S.sectionTitle}>Latest Updates</h3>
            <a href="#" style={S.viewAll}>View all</a>
          </div>
          <div style={S.updates}>
            {filteredUpdates.length === 0 ? (
              <p style={{ color: "#666666", fontSize: "0.88rem", textAlign: "center", padding: "24px 0" }}>
                No updates found.
              </p>
            ) : (
              filteredUpdates.map((u) => (
              <article key={u.id} style={S.card}>
                <div style={S.cardTop}>
                  <h4 style={S.cardTitle}>{u.title}</h4>
                  <div style={S.cardRight}>
                    <span style={S.statusBadge(u.statusColor, u.statusBg)}>
                      {u.status}
                    </span>
                    <span style={S.cardTime}>{u.time}</span>
                  </div>
                </div>
                <p style={S.cardDesc}>{u.description}</p>
                <div style={S.cardMeta}>
                  <span style={S.cardAuthorLeft}>
                    BY {u.author} · {u.category}
                  </span>
                  <div style={S.cardAuthorRight}>
                    <div style={S.avatarSm}>{u.avatarInitial}</div>
                    <span>
                      {u.author
                        .split(" ")
                        .map((w) => w[0] + w.slice(1).toLowerCase())
                        .join(" ")}
                    </span>
                  </div>
                </div>
              </article>
            ))
            )}
          </div>
        </section>
      </div>

      {/* Bottom nav */}
      <nav style={S.nav}>
        <button style={S.navItemActive}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
          </svg>
          <span>Home</span>
        </button>
        <button style={S.navItem} onClick={() => router.push("/chat")}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Chat</span>
        </button>
        <button style={S.navItem} onClick={() => router.push("/profile")}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}

