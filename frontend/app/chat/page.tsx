"use client";

import { useRouter } from "next/navigation";
import { CHAT_THREADS as THREADS } from "@/lib/mock-data";

export default function ChatPage() {
  const router = useRouter();

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
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
          padding: "16px 20px 8px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.75rem", letterSpacing: "0.01em", fontWeight: 800 }}>
          Messages
        </h1>
        <button
          aria-label="Filter messages"
          style={{
            background: "transparent",
            border: "none",
            color: "#888888",
            cursor: "pointer",
            padding: 4,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h10" />
            <path d="M18 6h2" />
            <path d="M8 12h12" />
            <path d="M4 12h2" />
            <path d="M4 18h10" />
            <path d="M18 18h2" />
            <circle cx="15" cy="6" r="1" fill="currentColor" />
            <circle cx="9" cy="12" r="1" fill="currentColor" />
            <circle cx="15" cy="18" r="1" fill="currentColor" />
          </svg>
        </button>
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
          <span style={{ fontSize: "0.9rem" }}>Search projects or devs...</span>
        </div>
      </section>

      <section
        style={{
          borderTop: "1px solid #2a2a2a",
          marginTop: 14,
        }}
      >
        {THREADS.map((thread) => (
          <article
            key={thread.id}
            style={{
              display: "flex",
              gap: 14,
              padding: "14px 20px",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: "#1a1a1a",
                border: `2px solid ${thread.accent}`,
                position: "relative",
                boxShadow: thread.online ? "0 0 20px rgba(79, 195, 161, 0.18)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.35rem",
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {thread.avatar}
              <span
                style={{
                  position: "absolute",
                  right: -4,
                  bottom: -4,
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
                  }}
                >
                  {thread.title}
                </h2>
                <span
                  style={{
                    color: thread.online ? "#4fc3a1" : "#888888",
                    fontSize: "0.75rem",
                    fontWeight: thread.online ? 700 : 500,
                    flexShrink: 0,
                  }}
                >
                  {thread.time}
                </span>
              </div>
              <p
                style={{
                  margin: "6px 0 0",
                  color: "#999999",
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

      <button
        aria-label="Create new conversation"
        style={{
          position: "fixed",
          right: "max(22px, calc(50vw - 218px))",
          bottom: 84,
          width: 72,
          height: 72,
          borderRadius: "50%",
          border: "none",
          color: "#111111",
          background: "#ffffff",
          boxShadow: "0 12px 26px rgba(0, 0, 0, 0.35)",
          fontSize: "2.4rem",
          lineHeight: 1,
          cursor: "pointer",
          zIndex: 120,
        }}
      >
        +
      </button>

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
          <span>Home</span>
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
          <span>Chat</span>
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
          onClick={() => router.push("/profile")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Profile</span>
        </button>
      </nav>
    </main>
  );
}
