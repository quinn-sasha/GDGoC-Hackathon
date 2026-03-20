"use client";
import { useRouter } from "next/navigation";
import React from "react";

export const SideNav = ({ active }: { active: "home" | "chat" | "profile" | "myproject" }) => {
  const router = useRouter();
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: 100,
        background: "#1a1a1a",
        borderRight: "1px solid #2a2a2a",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        padding: "32px 0 0",
        zIndex: 100,
        gap: 8,
      }}
    >
      <button style={{ background: "none", border: "none", color: active === "home" ? "#fff" : "#fff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: "0.82rem", marginBottom: 16, padding: "0 12px" }} onClick={() => router.push("/home") }>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
        </svg>
        <span style={{ fontSize: "0.82rem", color: "#fff", fontWeight: 700 }}>ホーム</span>
      </button>
      <button style={{ background: "none", border: "none", color: active === "chat" ? "#fff" : "#fff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: "0.82rem", marginBottom: 16, padding: "0 12px" }} onClick={() => router.push("/chat") }>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span style={{ fontSize: "0.82rem", color: "#fff", fontWeight: 700 }}>チャット</span>
      </button>
      <button style={{ background: "none", border: "none", color: active === "myproject" ? "#fff" : "#fff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: "0.82rem", marginBottom: 16, padding: "0 12px" }} onClick={() => router.push("/myproject") }>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 7h18v13H3z" />
          <path d="M7 3h10v4H7z" />
        </svg>
        <span style={{ fontSize: "0.82rem", color: "#fff", fontWeight: 700 }}>マイプロジェクト</span>
      </button>
      <button style={{ background: "none", border: "none", color: active === "profile" ? "#fff" : "#fff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: "0.82rem", marginBottom: 16, padding: "0 12px" }} onClick={() => router.push(`/profile/me`)}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span style={{ fontSize: "0.82rem", color: "#fff", fontWeight: 700 }}>プロフィール</span>
      </button>
    </nav>
  );
};
