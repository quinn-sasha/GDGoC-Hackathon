"use client";
import { isMobileUA } from "@/lib/device";
import { BottomNav } from "@/components/BottomNav";
import { SideNav } from "@/components/SideNav";
import { CommonHeader } from "@/components/CommonHeader";
import { CommonSearchBar } from "@/components/CommonSearchBar";
import { CommonCategoryTabs } from "@/components/CommonCategoryTabs";


import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchChatThreads } from "@/lib/chat-client";


const FILTERS = ["すべて", "未読", "オンライン"] as const;
type ChatFilter = (typeof FILTERS)[number];


export default function ChatPage() {
  const router = useRouter();
  // SSR時はスマホ幅で固定
  const [isPC, setIsPC] = useState(false);
  useEffect(() => {
    setIsPC(window.innerWidth >= 900 && !isMobileUA());
    const handleResize = () => setIsPC(window.innerWidth >= 900 && !isMobileUA());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ChatFilter>("すべて");
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchChatThreads()
      .then((data) => {
        setThreads(data);
        setLoading(false);
      })
      .catch(() => {
        setError("チャット一覧の取得に失敗しました");
        setLoading(false);
      });
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredThreads = useMemo(() => {
    return threads.filter((thread) => {
      const matchesQuery =
        normalizedQuery === "" ||
        thread.title.toLowerCase().includes(normalizedQuery) ||
        thread.project.toLowerCase().includes(normalizedQuery) ||
        thread.role.toLowerCase().includes(normalizedQuery) ||
        thread.preview.toLowerCase().includes(normalizedQuery);

      const matchesFilter =
        activeFilter === "すべて" ||
        (activeFilter === "未読" && thread.unreadCount > 0) ||
        (activeFilter === "オンライン" && thread.online);

      return matchesQuery && matchesFilter;
    }).sort((left, right) => {
      if (left.pinned && !right.pinned) return -1;
      if (!left.pinned && right.pinned) return 1;
      return right.unreadCount - left.unreadCount;
    });
  }, [activeFilter, threads, normalizedQuery]);

  // スケルトンUI
  const SkeletonList = (
    <section style={{ marginTop: 24 }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ display: "flex", gap: 14, padding: "14px 20px", alignItems: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#222", opacity: 0.3 }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: "60%", height: 18, background: "#222", borderRadius: 6, marginBottom: 8, opacity: 0.3 }} />
            <div style={{ width: "40%", height: 14, background: "#222", borderRadius: 6, marginBottom: 6, opacity: 0.2 }} />
            <div style={{ width: "80%", height: 12, background: "#222", borderRadius: 6, opacity: 0.15 }} />
          </div>
        </div>
      ))}
    </section>
  );

  if (loading || error) {
    return (
      <main
        style={{
          minHeight: "100vh",
          maxWidth: isPC ? "100vw" : 480,
          margin: isPC ? "0" : "0 auto",
          background: "#111111",
          color: "#ffffff",
          fontFamily: "'Segoe UI', sans-serif",
          paddingBottom: 96,
          position: "relative",
          paddingLeft: isPC ? 100 : 0,
          overflow: "hidden",
        }}
      >
        <CommonHeader title="メッセージ" isPC={isPC} />
        {SkeletonList}
        {isPC ? <SideNav active="chat" /> : <BottomNav active="chat" />}
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        maxWidth: isPC ? "100vw" : 480,
        margin: isPC ? "0" : "0 auto",
        background: "#111111",
        color: "#ffffff",
        fontFamily: "'Segoe UI', sans-serif",
        paddingBottom: 96,
        position: "relative",
        paddingLeft: isPC ? 100 : 0,
        overflow: "hidden",
      }}
    >
      <CommonHeader title="メッセージ" isPC={isPC} />
      <CommonSearchBar
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onClear={() => setQuery("")}
        placeholder="ユーザー・案件名で検索"
      />
      <CommonCategoryTabs
        categories={FILTERS as unknown as string[]}
        active={activeFilter}
        onSelect={(cat: string) => setActiveFilter(cat as ChatFilter)}
      />
      <section style={{ padding: "0 20px 10px", color: "#7f7f7f", fontSize: "0.78rem" }}>
        {filteredThreads.length}件の会話
      </section>
      <section
        style={{
          borderTop: "1px solid #2a2a2a",
          marginTop: 14,
        }}
      >
        {filteredThreads.length === 0 ? (
          <div style={{ padding: "28px 20px", color: "#8a8a8a", fontSize: "0.9rem", lineHeight: 1.7 }}>
            条件に一致するチャットはありません。検索語やフィルタを変えてください。
          </div>
        ) : filteredThreads.map((thread) => (
          <article
            key={thread.id}
            onClick={() => router.push(`/chat/${thread.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                router.push(`/chat/${thread.id}`);
              }
            }}
            style={{
              display: "flex",
              gap: 14,
              padding: "14px 20px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#1a1a1a",
                border: "3px solid #1f4f26",
                position: "relative",
                boxShadow: thread.online ? "0 0 20px rgba(79, 195, 161, 0.18)" : "none",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #f2d5c8 0%, #c98f87 100%)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  color: "#2b1f1c",
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #f2d5c8 0%, #c98f87 100%)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    color: "2b1f1c",
                  }}
                >
                  {otherUser.avatar}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    margin: 0,
                    fontSize: "0.95rem",
                    lineHeight: 1.3,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {thread.title}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {thread.unreadCount > 0 ? (
                    <span
                      style={{
                        minWidth: 20,
                        height: 20,
                        borderRadius: 999,
                        padding: "0 6px",
                        background: "#8aff1d",
                        color: "#111111",
                        display: "grid",
                        placeItems: "center",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                      }}
                    >
                      {thread.unreadCount}
                    </span>
                  ) : null}
                  <span
                    style={{
                      color: thread.online ? "#4fc3a1" : "#888888",
                      fontSize: "0.75rem",
                      fontWeight: thread.online ? 700 : 500,
                    }}
                  >
                    {thread.time}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7, minWidth: 0 }}>
                {thread.pinned ? (
                  <span style={{ color: "#8aff1d", fontSize: "0.72rem", fontWeight: 700 }}>固定</span>
                ) : null}
                <span
                  style={{
                    color: "#cfcfcf",
                    fontSize: "0.76rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {thread.project}
                </span>
                <span style={{ color: "#555555" }}>•</span>
                <span style={{ color: "#7f7f7f", fontSize: "0.76rem", whiteSpace: "nowrap" }}>{thread.role}</span>
              </div>
              <p
                style={{
                  margin: "6px 0 0",
                  color: thread.unreadCount > 0 ? "#dfdfdf" : "#999999",
                  fontSize: "0.83rem",
                  lineHeight: 1.5,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {thread.preview}
              </p>
            </div>
          </article>
        ))}
      </section>
      {isPC ? <SideNav active="chat" /> : <BottomNav active="chat" />}
    </main>
  );
}
