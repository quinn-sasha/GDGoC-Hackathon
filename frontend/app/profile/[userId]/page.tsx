"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";


export default function UserProfilePage() {
  const { userId } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    fetchProfileById(userId as string)
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        setError("プロフィール取得に失敗しました");
        setLoading(false);
      });
  }, [userId]);

  // スケルトンUI
  if (loading || error || !profile) {
    return (
      <main style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", background: "#111111", color: "#ffffff", fontFamily: "'Segoe UI', sans-serif", paddingBottom: 96, position: "relative" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 8px" }}>
          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800 }}>プロフィール</h1>
          <div style={{ display: "flex", gap: 8 }}>
            {/* 歯車マーク（設定） */}
            <button aria-label="プロフィール編集" style={{ background: "none", border: "none", color: "#888888", cursor: "pointer", padding: 4 }} onClick={() => router.push("/profile/edit") }>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3.2" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 5 15.4a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 16 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8c.14.31.22.65.22 1v.09A1.65 1.65 0 0 0 21 12c0 .35-.08.69-.22 1v.09A1.65 1.65 0 0 0 19.4 15z" />
              </svg>
            </button>
            {/* 戻るボタン */}
            <button aria-label="戻る" style={{ background: "none", border: "none", color: "#888888", cursor: "pointer", padding: 4 }} onClick={() => router.back()}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>
        </header>
        <section style={{ padding: "8px 20px 0", textAlign: "center" }}>
          <div style={{ width: 156, height: 156, margin: "0 auto", borderRadius: "50%", border: "6px solid #1f4f26", background: "#1a1a1a", position: "relative", display: "grid", placeItems: "center", boxShadow: "0 10px 28px rgba(0, 0, 0, 0.28)" }}>
            <div style={{ width: 140, height: 140, borderRadius: "50%", background: "#222", opacity: 0.3 }} />
          </div>
          <div style={{ width: 120, height: 28, margin: "22px auto 0", background: "#222", borderRadius: 8, opacity: 0.3 }} />
          <div style={{ width: 80, height: 18, margin: "8px auto 0", background: "#222", borderRadius: 8, opacity: 0.2 }} />
          <div style={{ width: 200, height: 16, margin: "16px auto 0", background: "#222", borderRadius: 8, opacity: 0.15 }} />
        </section>
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
          <button style={{ background: "none", border: "none", color: "#666666", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: "0.72rem", padding: "0 20px" }} onClick={() => router.push("/home") }>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
            </svg>
            <span>ホーム</span>
          </button>
          <button style={{ background: "none", border: "none", color: "#666666", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: "0.72rem", padding: "0 20px" }} onClick={() => router.push("/chat") }>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>チャット</span>
          </button>
          <button style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: "0.72rem", padding: "0 20px" }} onClick={() => router.push(`/profile`)}>
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
    <main style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", background: "#111111", color: "#ffffff", fontFamily: "'Segoe UI', sans-serif", paddingBottom: 96, position: "relative" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 8px" }}>
        <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800 }}>プロフィール</h1>
        <button aria-label="戻る" onClick={() => router.back()} style={{ background: "none", border: "none", color: "#888888", cursor: "pointer", padding: 4 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </header>
      <section style={{ padding: "8px 20px 0", textAlign: "center" }}>
        <div style={{ width: 156, height: 156, margin: "0 auto", borderRadius: "50%", border: "6px solid #1f4f26", background: "#1a1a1a", position: "relative", display: "grid", placeItems: "center", boxShadow: "0 10px 28px rgba(0, 0, 0, 0.28)" }}>
          <div style={{ width: 140, height: 140, borderRadius: "50%", background: "linear-gradient(135deg, #f2d5c8 0%, #c98f87 100%)", display: "grid", placeItems: "center", fontSize: "2.4rem", fontWeight: 800, color: "#2b1f1c" }}>
            {profile.avatarInitial}
          </div>
        </div>
        <h2 style={{ margin: "22px 0 0", fontSize: "1.8rem", fontWeight: 800 }}>{profile.name}</h2>
        <p style={{ margin: "8px 0 0", color: "#7dff2b", fontSize: "0.95rem", fontWeight: 700 }}>{profile.handle}</p>
        <p style={{ margin: "16px auto 0", maxWidth: 320, color: "#aaaaaa", fontSize: "0.85rem", lineHeight: 1.6 }}>{profile.bio}</p>
      </section>
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
            color: "#666666",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            fontSize: "0.72rem",
            padding: "0 20px",
          }}
          onClick={() => router.push("/chat")}
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
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>プロフィール</span>
        </button>
      </nav>
    </main>
  );
}

// ユーザーID指定でプロフィール取得
async function fetchProfileById(userId: string) {
  const res = await fetch(`/api/profile/${encodeURIComponent(userId)}/`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error("プロフィール取得に失敗しました");
  return res.json();
}
