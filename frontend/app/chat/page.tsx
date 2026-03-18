
"use client";
import { isMobileUA } from "@/lib/device";
import { BottomNav } from "@/components/BottomNav";
import { SideNav } from "@/components/SideNav";
import { CommonHeader } from "@/components/CommonHeader";
import { CommonSearchBar } from "@/components/CommonSearchBar";
import { CommonCategoryTabs } from "@/components/CommonCategoryTabs";


import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchConversations, type Conversation } from "@/lib/conversation-client";


const FILTERS = ["すべて", "未読"] as const;
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchConversations()
      .then((data) => {
        setConversations(data.results);
        setLoading(false);
      })
      .catch(() => {
        setError("チャット一覧の取得に失敗しました");
        setLoading(false);
      });
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      // ユーザー名・last_message・typeで検索
      const otherUser = conv.users[0]; // 1対1想定
      const matchesQuery =
        normalizedQuery === "" ||
        otherUser.username.toLowerCase().includes(normalizedQuery) ||
        (conv.last_message?.content?.toLowerCase().includes(normalizedQuery) ?? false);
      const matchesFilter =
        activeFilter === "すべて" ||
        (activeFilter === "未読" && conv.unread_count > 0);
      return matchesQuery && matchesFilter;
    });
  }, [activeFilter, conversations, normalizedQuery]);

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
        {filteredConversations.length}件の会話
      </section>
      <section
        style={{
          borderTop: "1px solid #2a2a2a",
          marginTop: 14,
        }}
      >
        {filteredConversations.length === 0 ? (
          <div style={{ padding: "28px 20px", color: "#8a8a8a", fontSize: "0.9rem", lineHeight: 1.7 }}>
            条件に一致するチャットはありません。検索語やフィルタを変えてください。
          </div>
        ) : filteredConversations.map((conv) => {
          const otherUser = conv.users[0];
          return (
            <article
              key={conv.id}
              onClick={() => router.push(`/chat/${conv.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  router.push(`/chat/${conv.id}`);
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
                    color: "2b1f1c",
                  }}
                >
                  {otherUser.avatar}
                </div>
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
                    {otherUser.username}
                  </h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {conv.unread_count > 0 ? (
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
                        {conv.unread_count}
                      </span>
                    ) : null}
                    <span
                      style={{
                        color: "#888888",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                      }}
                    >
                      {conv.last_message?.created_at ? new Date(conv.last_message.created_at).toLocaleString() : ""}
                    </span>
                  </div>
                </div>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: conv.unread_count > 0 ? "#dfdfdf" : "#999999",
                    fontSize: "0.83rem",
                    lineHeight: 1.5,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {conv.last_message?.content ?? "まだメッセージがありません"}
                </p>
              </div>
            </article>
          );
        })}
      </section>
      {isPC ? <SideNav active="chat" /> : <BottomNav active="chat" />}
    </main>
  );
}
