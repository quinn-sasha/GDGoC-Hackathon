"use client";
import { useRouter } from "next/navigation";
import React from "react";

export const SideNav = ({ active }: { active: "home" | "chat" | "profile" | "myproject" }) => {
  const router = useRouter();

  const navStyle: React.CSSProperties = {
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
  };

  const buttonBase: React.CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    fontSize: "0.82rem",
    marginBottom: 12,
    padding: "8px 6px",
    width: "100%",
    boxSizing: "border-box",
  };

  const activeColor = "#8aff1d";
  const inactiveColor = "#bdbdbd";

  const renderItem = (key: "home" | "chat" | "profile" | "myproject", label: string, onClick: () => void, node: React.ReactNode) => {
    const isActive = active === key;
    const style: React.CSSProperties = {
      ...buttonBase,
      color: isActive ? activeColor : inactiveColor,
      background: isActive ? "rgba(138,255,29,0.06)" : "none",
      paddingLeft: isActive ? 12 : 6,
      borderLeft: isActive ? `4px solid ${activeColor}` : "4px solid transparent",
      borderRadius: 8,
      textAlign: "center",
    };
    return (
      <button
        aria-current={isActive ? "page" : undefined}
        key={key}
        onClick={onClick}
        style={style}
        type="button"
      >
        {node}
        <span style={{ fontSize: "0.82rem", color: isActive ? activeColor : inactiveColor, fontWeight: 700 }}>{label}</span>
      </button>
    );
  };

  return (
    <nav style={navStyle}>
      {renderItem(
        "home",
        "ホーム",
        () => router.push("/home"),
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
        </svg>
      )}
      {renderItem(
        "chat",
        "チャット",
        () => router.push("/chat"),
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )}
      {renderItem(
        "myproject",
        "マイプロジェクト",
        () => router.push("/myproject"),
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 7h18v13H3z" />
          <path d="M7 3h10v4H7z" />
        </svg>
      )}
      {renderItem(
        "profile",
        "プロフィール",
        () => router.push(`/profile/me`),
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )}
    </nav>
  );
};
