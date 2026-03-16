"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CHAT_THREADS } from "@/lib/mock-data";

export default function ChatDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const threadId = Number(params.id);

  const thread = CHAT_THREADS.find((item) => item.id === threadId);
  const [messages, setMessages] = useState([
    {
      id: 1,
      mine: false,
      text: thread?.preview ?? "",
      time: thread?.time ?? "今",
    },
    {
      id: 2,
      mine: true,
      text: "了解です。詳細をこのスレッドで進めましょう。",
      time: "今",
    },
  ]);
  const [draft, setDraft] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const handleSend = () => {
    const nextText = draft.trim();
    if (!nextText) return;

    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        mine: true,
        text: nextText,
        time: "今",
      },
    ]);
    setDraft("");
  };

  if (!thread) {
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
        <p style={{ marginTop: 20, color: "#bbbbbb" }}>メッセージが見つかりませんでした。</p>
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
          <h1 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>{thread.title}</h1>
          <p style={{ margin: "3px 0 0", color: thread.online ? "#4fc3a1" : "#888888", fontSize: "0.78rem" }}>
            {thread.online ? "オンライン" : "オフライン"}
          </p>
        </div>
      </header>

      <section
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "18px 16px 90px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.map((message) => {
          if (message.mine) {
            return (
              <div
                key={message.id}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
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
                    {message.text}
                  </div>
                  <p
                    style={{
                      margin: "5px 2px 0",
                      textAlign: "right",
                      color: "#888888",
                      fontSize: "0.72rem",
                    }}
                  >
                    {message.time}
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                }}
              >
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
                  {thread.avatar}
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
                  {message.text}
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
                {message.time}
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
            style={{
              border: "none",
              background: "none",
              color: draft.trim() ? "#8aff1d" : "#5f6b50",
              fontWeight: 800,
              fontSize: "0.9rem",
              cursor: draft.trim() ? "pointer" : "default",
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
