"use client";
import React, { useEffect, useMemo, useState } from "react";
import { CommonHeader } from "@/components/CommonHeader";
import { CommonSearchBar } from "@/components/CommonSearchBar";
import { BottomNav } from "@/components/BottomNav";
import { SideNav } from "@/components/SideNav";
import { fetchHomeFeed, type HomeFeedUpdate } from "@/lib/home-client";
import { useRouter } from "next/navigation";

const S = {
  section: { padding: "12px 20px 8px" },
  updates: { display: "flex", flexDirection: "column" as const, gap: 12 },
  card: { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 14, padding: "14px 16px" },
  avatarSm: { width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#f9a8a8 0%,#d47fa6 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11 },
};

export default function SearchClient({ initialQuery }: { initialQuery?: string }) {
  const [isPC, setIsPC] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [search, setSearch] = useState(initialQuery ?? "");
  const [updates, setUpdates] = useState<HomeFeedUpdate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const update = () => setIsPC(window.innerWidth >= 900);
    update();
    setMounted(true);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    setSearch(initialQuery ?? "");
  }, [initialQuery]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchHomeFeed()
      .then((data) => {
        if (!isMounted) return;
        setUpdates(data.updates ?? []);
      })
      .catch(() => {
        if (!isMounted) return;
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedSearch = (search ?? "").trim().toLowerCase();

  const filtered = useMemo(() => {
    return updates.filter((u) => {
      if (normalizedSearch === "") return true;
      return (
        u.title.toLowerCase().includes(normalizedSearch) ||
        u.description.toLowerCase().includes(normalizedSearch) ||
        u.author.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [updates, normalizedSearch]);

  const handleOpenProjectDetail = (id: string | number) => {
    router.push(`/project/${id}`);
  };

  const NavBarElement = mounted ? (isPC ? <SideNav active="home" /> : <BottomNav active="home" />) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#111111", color: "#ffffff", paddingLeft: isPC ? 100 : 0 }}>
      {NavBarElement}
      <CommonHeader title="検索結果" isPC={isPC} />
      <main style={{ padding: 12 }}>
        <CommonSearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
          placeholder="プロジェクト、アイデアを検索"
          onSubmit={(v) => router.push(`/search?q=${encodeURIComponent((v ?? search) || "")}`)}
        />

        <section style={S.section}>
          <h3 style={{ margin: 0, fontSize: 16 }}>検索結果{normalizedSearch ? `：${normalizedSearch}` : ""}</h3>
          <div style={{ height: 12 }} />
          {loading ? (
            <p style={{ color: "#888888" }}>読み込み中…</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: "#666666", fontSize: "0.88rem", textAlign: "center", padding: "24px 0" }}>条件に一致するプロジェクトはありません。</p>
          ) : (
            <div style={S.updates}>
              {filtered.map((u) => (
                <article key={u.id} style={{ ...S.card, cursor: "pointer" }} onClick={() => handleOpenProjectDetail(u.id)} role="button" tabIndex={0}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                    <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#fff", lineHeight: 1.3, flex: 1 }}>{u.title}</h4>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <span style={{ fontSize: "0.75rem", color: "#666666" }}>{u.time}</span>
                    </div>
                  </div>
                  <p style={{ margin: "0 0 10px", fontSize: "0.83rem", color: "#999999", lineHeight: 1.5 }}>{u.description}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.72rem", color: "#666666" }}>{u.author} ・ {u.category}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={S.avatarSm}>{u.avatarInitial}</div>
                      <span style={{ color: "#aaaaaa" }}>{u.author}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
