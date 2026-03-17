"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchProfile } from "@/lib/profile-api";

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

  if (loading) return <main style={{ color: "#aaa", textAlign: "center", marginTop: 40 }}>読み込み中...</main>;
  if (error) return <main style={{ color: "#ff7d7d", textAlign: "center", marginTop: 40 }}>{error}</main>;
  if (!profile) return null;

  return (
    <main style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", background: "#111111", color: "#ffffff", fontFamily: "'Segoe UI', sans-serif", paddingBottom: 96 }}>
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
