"use client";


import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchChatThreads } from "@/lib/chat-client";


const FILTERS = ["すべて", "未読", "オンライン"] as const;
type ChatFilter = (typeof FILTERS)[number];


export default function ChatPage() {
  const router = useRouter();
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
          maxWidth: 480,
          margin: "0 auto",
          background: "#111111",
          color: "#ffffff",
          padding: "24px 0 106px",
          fontFamily: "'Segoe UI', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <header style={{ display: "flex", alignItems: "center", marginBottom: 10, padding: "16px 20px 8px" }}>
          <h1 style={{ margin: 0, fontSize: "1.75rem", letterSpacing: "0.01em", fontWeight: 800 }}>メッセージ</h1>
        </header>
        {SkeletonList}
        {/* 下部ナビバー */}
        <nav
          style={{
            position: "fixed",
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
          }}
        >
          <button
            style={{
              background: "none",
              border: "none",
              color: "#666666",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              fontSize: "0.72rem",
              padding: "0 20px",
            }}
            onClick={() => router.push("/home")}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
            </svg>
            <span>ホーム</span>
          </button>
          <button
            style={{
              background: "none",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              fontSize: "0.72rem",
              padding: "0 20px",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>チャット</span>
          </button>
          <button
            style={{
              background: "none",
              border: "none",
              color: "#666666",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              fontSize: "0.72rem",
              padding: "0 20px",
            }}
            onClick={() => router.push("/profile/me")}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>プロフィール</span>
          </button>
        </nav>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        maxWidth: 480,
        margin: "0 auto",
        background: "#111111",
        color: "#ffffff",
        padding: "24px 0 106px",
        fontFamily: "'Segoe UI', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 10,
          padding: "16px 20px 8px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.75rem", letterSpacing: "0.01em", fontWeight: 800 }}>
          メッセージ
        </h1>
      </header>

      <section style={{ marginBottom: 12 }}>
        <div
          style={{
            margin: "0 20px",
            height: 48,
            borderRadius: 24,
            background: "#1e1e1e",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 14px",
            color: "#888888",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ユーザー・案件名で検索"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "#ffffff",
              outline: "none",
              fontSize: "0.9rem",
            }}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              style={{
                border: "none",
                background: "#2a2a2a",
                color: "#d0d0d0",
                width: 24,
                height: 24,
                borderRadius: "50%",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          ) : null}
        </div>
      </section>

      <section style={{ display: "flex", gap: 8, padding: "0 20px 12px", overflowX: "auto" }}>
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              style={{
                borderRadius: 999,
                border: isActive ? "1px solid #ffffff" : "1px solid #343434",
                background: isActive ? "#ffffff" : "#1a1a1a",
                color: isActive ? "#111111" : "#d0d0d0",
                fontSize: "0.8rem",
                fontWeight: 700,
                padding: "8px 12px",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {filter}
            </button>
          );
        })}
      </section>

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
                {thread.avatar}
              </div>
              <span
                style={{
                  position: "absolute",
                  right: -3,
                  bottom: -3,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: thread.online ? "#4fc3a1" : "#5a5a5a",
                  border: "3px solid #111111",
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 10,
                }}
              >
                <h2
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

      {/* 新規チャット作成ボタン削除済み */}

      {/* 下部ナビバー */}
      {/* Bottom nav: ホームと同じデザイン */}
      <nav
        style={{
          position: "fixed",
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
        }}
      >
        <button
          style={{
            background: "none",
            border: "none",
            color: "#666666",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            fontSize: "0.72rem",
            padding: "0 20px",
          }}
          onClick={() => router.push("/home")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
          </svg>
          <span>ホーム</span>
        </button>
        <button
          style={{
            background: "none",
            border: "none",
            color: "#ffffff",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            fontSize: "0.72rem",
            padding: "0 20px",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>チャット</span>
        </button>
        <button
          style={{
            background: "none",
            border: "none",
            color: "#666666",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            fontSize: "0.72rem",
            padding: "0 20px",
          }}
          onClick={() => router.push("/profile/me")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>プロフィール</span>
        </button>
      </nav>
    </main>
  );
}
