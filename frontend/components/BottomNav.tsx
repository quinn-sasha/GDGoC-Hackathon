"use client";
import { useRouter } from "next/navigation";
import React from "react";

export const BottomNav = ({ active }: { active: "home" | "chat" | "profile" }) => {
  const router = useRouter();
  return (
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
      <button style={{ background: "none", border: "none", color: active === "home" ? "#fff" : "#666", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: "0.72rem", padding: "0 20px" }} onClick={() => router.push("/home") }>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
        </svg>
        <span>ホーム</span>
      </button>
      <button style={{ background: "none", border: "none", color: active === "chat" ? "#fff" : "#666", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: "0.72rem", padding: "0 20px" }} onClick={() => router.push("/chat") }>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>チャット</span>
      </button>
      <button style={{ background: "none", border: "none", color: active === "profile" ? "#fff" : "#666", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: "0.72rem", padding: "0 20px" }} onClick={() => router.push(`/profile`)}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>プロフィール</span>
      </button>
    </nav>
  );
};
