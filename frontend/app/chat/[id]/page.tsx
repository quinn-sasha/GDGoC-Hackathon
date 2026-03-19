"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { isMobileUA } from "@/lib/device";
import { SideNav } from "@/components/SideNav";
import {
  fetchConversationById,
  fetchMessages,
  sendMessage,
  markRead,
  getMyUserId,
  type Conversation,
  type ChatMessage,
} from "@/lib/chat-client";

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const conversationId = params.id;

  const [isPC, setIsPC] = useState(false);
  useEffect(() => {
    setIsPC(window.innerWidth >= 900 && !isMobileUA());
    const handleResize = () => setIsPC(window.innerWidth >= 900 && !isMobileUA());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!conversationId) return;
    Promise.all([
      fetchConversationById(conversationId),
      fetchMessages(conversationId),
    ])
      .then(([conv, msgs]) => {
        setConversation(conv);
        setMessages(msgs.results);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // 既読マーク
    markRead(conversationId).catch(() => {});
  }, [conversationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft("");
    try {
      const sent = await sendMessage(conversationId, text);
      setMessages((prev) => [...prev, sent]);
    } catch {
      setDraft(text); // 失敗したら入力を戻す
    } finally {
      setSending(false);
    }
  };

  const otherName = conversation?.other_user?.username ?? "チャット";
  const otherInitial = otherName[0]?.toUpperCase() ?? "?";

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          maxWidth: isPC ? "100vw" : 480,
          margin: isPC ? "0" : "0 auto",
          background: "#111111",
          color: "#ffffff",
          fontFamily: "'Segoe UI', sans-serif",
          paddingLeft: isPC ? 100 : 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isPC && <SideNav active="chat" />}
        <p style={{ color: "#888" }}>読み込み中...</p>
      </main>
    );
  }

  if (!conversation) {
    return (
      <main
        style={{
          minHeight: "100vh",
          maxWidth: isPC ? "100vw" : 480,
          margin: isPC ? "0" : "0 auto",
          background: "#111111",
          color: "#ffffff",
          fontFamily: "'Segoe UI', sans-serif",
          padding: "28px 20px",
          paddingLeft: isPC ? 120 : 20,
        }}
      >
        {isPC && <SideNav active="chat" />}
        <button
          onClick={() => router.push("/chat")}
          style={{ background: "none", border: "none", color: "#8aff1d", cursor: "pointer", padding: 0 }}
        >
          チャット一覧へ戻る
        </button>
        <p style={{ marginTop: 20, color: "#bbbbbb" }}>メッセージが見つかりませんでした。</p>
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
        display: "flex",
        flexDirection: "column",
        paddingLeft: isPC ? 100 : 0,
      }}
    >
      {isPC && <SideNav active="chat" />}

      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 20px 12px",
          borderBottom: "1px solid #2a2a2a",
        }}
      >
        <button
          aria-label="戻る"
          onClick={() => router.push("/chat")}
          style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer", padding: 4 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #f2d5c8 0%, #c98f87 100%)",
            display: "grid",
            placeItems: "center",
            fontSize: "0.9rem",
            fontWeight: 800,
            color: "#2b1f1c",
            flexShrink: 0,
          }}
        >
          {otherInitial}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>{otherName}</h1>
          <p style={{ margin: "3px 0 0", color: "#888888", fontSize: "0.78rem" }}>
            {conversation.room_type === "PERSONAL_CHAT" ? "個人チャット" : "プロジェクトチャット"}
          </p>
        </div>
      </header>

      <section
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "18px 16px 100px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.length === 0 && (
          <div style={{ alignSelf: "center", color: "#777777", fontSize: "0.85rem", marginTop: 40 }}>
            まだメッセージはありません
          </div>
        )}
        {messages.map((msg) => {
          const myId = getMyUserId();
          const isMine = myId !== null && msg.sender.id === myId;

          if (isMine) {
            return (
              <div key={msg.id} style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
                <div style={{ maxWidth: "78%" }}>
                  <div
                    style={{
                      background: "#8aff1d",
                      color: "#111111",
                      borderRadius: 16,
                      padding: "10px 12px",
                      fontSize: "0.9rem",
                      lineHeight: 1.45,
                    }}
                  >
                    {msg.content}
                  </div>
                  <p style={{ margin: "5px 2px 0", textAlign: "right", color: "#888888", fontSize: "0.72rem" }}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "2px solid #1f4f26",
                    background: "linear-gradient(135deg, #f2d5c8 0%, #c98f87 100%)",
                    color: "#2b1f1c",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {msg.sender.username[0]?.toUpperCase() ?? "?"}
                </div>
                <div
                  style={{
                    maxWidth: "calc(78% - 40px)",
                    background: "#1a1a1a",
                    color: "#f2f2f2",
                    border: "1px solid #2a2a2a",
                    borderRadius: 16,
                    padding: "10px 12px",
                    fontSize: "0.9rem",
                    lineHeight: 1.45,
                  }}
                >
                  {msg.content}
                </div>
              </div>
              <p style={{ margin: "0 0 0 42px", textAlign: "left", color: "#888888", fontSize: "0.72rem" }}>
                {formatTime(msg.created_at)}
              </p>
            </div>
          );
        })}
        <div ref={endRef} />
      </section>

      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: isPC ? 100 : "50%",
          transform: isPC ? "none" : "translateX(-50%)",
          width: isPC ? `calc(100% - 100px)` : "100%",
          maxWidth: isPC ? "none" : 480,
          padding: "12px 14px 16px",
          borderTop: "1px solid #2a2a2a",
          background: "#111111",
        }}
      >
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          style={{
            height: 46,
            borderRadius: 24,
            background: "#1a1a1a",
            border: "1px solid #2a2a2a",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 8px 0 14px",
            fontSize: "0.9rem",
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="メッセージを入力..."
            disabled={sending}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "#f2f2f2",
              outline: "none",
              fontSize: "0.9rem",
            }}
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            style={{
              border: "none",
              background: "none",
              color: draft.trim() && !sending ? "#8aff1d" : "#5f6b50",
              fontWeight: 800,
              fontSize: "0.9rem",
              cursor: draft.trim() && !sending ? "pointer" : "default",
              padding: "0 8px",
            }}
          >
            送信
          </button>
        </form>
      </footer>
    </main>
  );
}
