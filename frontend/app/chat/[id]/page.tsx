"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  type ApiConversation,
  type ApiMessage,
  fetchConversationDetail,
  fetchMessages,
  sendMessage,
  markConversationRead,
} from "@/lib/chat-client";

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const conversationId = params.id;

  const [conversation, setConversation] = useState<ApiConversation | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetchConversationDetail(conversationId),
      fetchMessages(conversationId),
    ])
      .then(([conv, msgs]) => {
        if (!isMounted) return;
        setConversation(conv);
        setMessages(msgs);
        setLoading(false);
        markConversationRead(conversationId).catch(() => {});
      })
      .catch(() => {
        if (!isMounted) return;
        setError("チャットの読み込みに失敗しました");
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [conversationId]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || isSending) return;
    setIsSending(true);
    try {
      const newMsg = await sendMessage(conversationId, text);
      setMessages((prev) => [...prev, newMsg]);
      setDraft("");
    } catch {
      // 送信失敗時はドラフトを保持
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          maxWidth: 480,
          margin: "0 auto",
          background: "#111111",
          color: "#ffffff",
          fontFamily: "'Segoe UI', sans-serif",
          padding: "28px 20px",
        }}
      >
        <button
          onClick={() => router.push("/chat")}
          style={{ background: "none", border: "none", color: "#8aff1d", cursor: "pointer", padding: 0 }}
        >
          チャット一覧へ戻る
        </button>
        <p style={{ marginTop: 20, color: "#bbbbbb" }}>読み込み中...</p>
      </main>
    );
  }

  if (error || !conversation) {
    return (
      <main
        style={{
          minHeight: "100vh",
          maxWidth: 480,
          margin: "0 auto",
          background: "#111111",
          color: "#ffffff",
          fontFamily: "'Segoe UI', sans-serif",
          padding: "28px 20px",
        }}
      >
        <button
          onClick={() => router.push("/chat")}
          style={{ background: "none", border: "none", color: "#8aff1d", cursor: "pointer", padding: 0 }}
        >
          チャット一覧へ戻る
        </button>
        <p style={{ marginTop: 20, color: "#bbbbbb" }}>
          {error || "メッセージが見つかりませんでした。"}
        </p>
      </main>
    );
  }

  const title = conversation.other_user?.username ?? "チャット";
  const avatarInitial = (title[0] ?? "?").toUpperCase();
  const otherUserId = conversation.other_user?.id;

  return (
    <main
      style={{
        minHeight: "100vh",
        maxWidth: 480,
        margin: "0 auto",
        background: "#111111",
        color: "#ffffff",
        fontFamily: "'Segoe UI', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
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
        <div>
          <h1 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>{title}</h1>
          <p style={{ margin: "3px 0 0", color: "#888888", fontSize: "0.78rem" }}>
            オフライン
          </p>
        </div>
      </header>

      <section
        style={{
          margin: "14px 16px 0",
          padding: "14px",
          borderRadius: 18,
          background: "#171717",
          border: "1px solid #262626",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <p style={{ margin: 0, color: "#8a8a8a", fontSize: "0.74rem", letterSpacing: "0.08em" }}>
              PROJECT CONTEXT
            </p>
            <h2 style={{ margin: "6px 0 0", fontSize: "0.96rem" }}>
              {conversation.project_id
                ? `プロジェクト ${conversation.project_id.slice(0, 8)}`
                : "ダイレクトメッセージ"}
            </h2>
          </div>
          <span
            style={{
              borderRadius: 999,
              background: "#202020",
              border: "1px solid #313131",
              color: "#d0d0d0",
              padding: "7px 10px",
              fontSize: "0.74rem",
              whiteSpace: "nowrap",
            }}
          >
            {conversation.room_type === "PERSONAL_CHAT" ? "個人チャット" : "プロジェクト"}
          </span>
        </div>
      </section>

      <section
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "18px 16px 186px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ alignSelf: "center", color: "#777777", fontSize: "0.75rem", marginBottom: 4 }}>
          今日
        </div>
        {messages.map((message) => {
          const isMine = otherUserId !== undefined ? message.sender.id !== otherUserId : false;

          if (isMine) {
            return (
              <div
                key={message.id}
                style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}
              >
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
                    {message.content}
                  </div>
                  <p
                    style={{
                      margin: "5px 2px 0",
                      textAlign: "right",
                      color: "#888888",
                      fontSize: "0.72rem",
                    }}
                  >
                    {formatMessageTime(message.created_at)}
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div
              key={message.id}
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 5,
              }}
            >
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
                  {avatarInitial}
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
                  {message.content}
                </div>
              </div>
              <p
                style={{
                  margin: "0 0 0 42px",
                  textAlign: "left",
                  color: "#888888",
                  fontSize: "0.72rem",
                }}
              >
                {formatMessageTime(message.created_at)}
              </p>
            </div>
          );
        })}
        <div ref={endOfMessagesRef} />
      </section>

      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 480,
          padding: "12px 14px 16px",
          borderTop: "1px solid #2a2a2a",
          background: "#111111",
        }}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
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
            onChange={(event) => setDraft(event.target.value)}
            placeholder="メッセージを入力..."
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
            disabled={!draft.trim() || isSending}
            style={{
              border: "none",
              background: "none",
              color: draft.trim() && !isSending ? "#8aff1d" : "#5f6b50",
              fontWeight: 800,
              fontSize: "0.9rem",
              cursor: draft.trim() && !isSending ? "pointer" : "default",
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
