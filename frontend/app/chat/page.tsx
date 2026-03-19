"use client";
import { isMobileUA } from "@/lib/device";
import { BottomNav } from "@/components/BottomNav";
import { SideNav } from "@/components/SideNav";
import { CommonHeader } from "@/components/CommonHeader";
import { CommonSearchBar } from "@/components/CommonSearchBar";
import { CommonCategoryTabs } from "@/components/CommonCategoryTabs";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchConversations, type Conversation } from "@/lib/chat-client";

const FILTERS = ["すべて", "未読"] as const;
type ChatFilter = (typeof FILTERS)[number];

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

export default function ChatPage() {
  const router = useRouter();
  const [isPC, setIsPC] = useState(false);
  useEffect(() => {
    setIsPC(window.innerWidth >= 900 && !isMobileUA());
    const handleResize = () => setIsPC(window.innerWidth >= 900 && !isMobileUA());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ChatFilter>("すべて");
  const [threads, setThreads] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchConversations()
      .then((data) => {
        setThreads(data.results ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError("チャット一覧の取得に失敗しました");
        setLoading(false);
      });
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredThreads = useMemo(() => {
    return threads
      .filter((thread) => {
        const name = thread.other_user?.username ?? "";
        const preview = thread.last_message?.content ?? "";
        const matchesQuery =
          normalizedQuery === "" ||
          name.toLowerCase().includes(normalizedQuery) ||
          preview.toLowerCase().includes(normalizedQuery);

        const matchesFilter =
          activeFilter === "すべて" ||
          (activeFilter === "未読" && thread.unread_count > 0);

        return matchesQuery && matchesFilter;
      })
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }, [activeFilter, threads, normalizedQuery]);

  const SkeletonList = (
    <section style={{ marginTop: 24 }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ display: "flex", gap: 14, padding: "14px 20px", alignItems: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#222", opacity: 0.3 }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: "60%", height: 18, background: "#222", borderRadius: 6, marginBottom: 8, opacity: 0.3 }} />
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
        placeholder="ユーザー名で検索"
      />
      <CommonCategoryTabs
        categories={FILTERS as unknown as string[]}
        active={activeFilter}
        onSelect={(cat: string) => setActiveFilter(cat as ChatFilter)}
      />
      <section style={{ padding: "0 20px 10px", color: "#7f7f7f", fontSize: "0.78rem" }}>
        {filteredThreads.length}件の会話
      </section>
      <section style={{ borderTop: "1px solid #2a2a2a", marginTop: 14 }}>
        {filteredThreads.length === 0 ? (
          <div style={{ padding: "28px 20px", color: "#8a8a8a", fontSize: "0.9rem", lineHeight: 1.7 }}>
            {error ? error : "条件に一致するチャットはありません。"}
          </div>
        ) : (
          filteredThreads.map((thread) => {
            const name = thread.other_user?.username ?? "不明なユーザー";
            const avatarInitial = name[0]?.toUpperCase() ?? "?";
            const preview = thread.last_message?.content ?? "メッセージはまだありません";
            const timeStr = formatRelativeTime(thread.updated_at);
            const projectLabel = thread.room_type === "PROJECT_CHAT" && thread.project_title
              ? thread.project_title
              : null;

            return (
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
                style={{ display: "flex", gap: 14, padding: "14px 20px", cursor: "pointer" }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "#1a1a1a",
                    border: "3px solid #1f4f26",
                    position: "relative",
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
                      overflow: "hidden",
                    }}
                  >
                    {thread.other_user?.icon_image_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thread.other_user.icon_image_path} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      avatarInitial
                    )}
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
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
                        {name}
                      </h2>
                      {projectLabel && (
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "0.72rem",
                            color: "#8aff1d",
                            background: "rgba(138,255,29,0.1)",
                            borderRadius: 4,
                            padding: "1px 6px",
                            marginTop: 2,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "100%",
                          }}
                        >
                          {projectLabel}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      {thread.unread_count > 0 ? (
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
                          {thread.unread_count}
                        </span>
                      ) : null}
                      <span style={{ color: "#888888", fontSize: "0.75rem" }}>{timeStr}</span>
                    </div>
                  </div>
                  <p
                    style={{
                      margin: "6px 0 0",
                      color: thread.unread_count > 0 ? "#dfdfdf" : "#999999",
                      fontSize: "0.83rem",
                      lineHeight: 1.5,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {preview}
                  </p>
                </div>
              </article>
            );
          })
        )}
      </section>
      {isPC ? <SideNav active="chat" /> : <BottomNav active="chat" />}
    </main>
  );
}
