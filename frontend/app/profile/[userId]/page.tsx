"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { isMobileUA } from "@/lib/device";
import { BottomNav } from "@/components/BottomNav";
import { SideNav } from "@/components/SideNav";
import { fetchProfileById } from "@/lib/profile-api";

export default function UserProfilePage() {
  const { userId } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPC, setIsPC] = useState(false);

  useEffect(() => {
    setIsPC(window.innerWidth >= 900 && !isMobileUA());
    const handleResize = () => setIsPC(window.innerWidth >= 900 && !isMobileUA());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const mainStyle = {
    minHeight: "100vh",
    maxWidth: isPC ? "100vw" : 480,
    margin: isPC ? "0" : "0 auto",
    background: "#111111",
    color: "#ffffff",
    fontFamily: "'Segoe UI', sans-serif",
    paddingBottom: 96,
    position: "relative" as const,
    paddingLeft: isPC ? 100 : 0,
  };

  // スケルトンUI
  if (loading || error || !profile) {
    return (
      <main style={mainStyle}>
        {isPC ? <SideNav active="profile" /> : null}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 8px" }}>
          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800 }}>プロフィール</h1>
          <button
            aria-label="戻る"
            onClick={() => router.back()}
            style={{ background: "none", border: "none", color: "#888888", cursor: "pointer", padding: 4 }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </header>
        <section style={{ padding: "8px 20px 0", textAlign: "center" }}>
          <div style={{ width: 156, height: 156, margin: "0 auto", borderRadius: "50%", border: "6px solid #1f4f26", background: "#1a1a1a", position: "relative", display: "grid", placeItems: "center", boxShadow: "0 10px 28px rgba(0, 0, 0, 0.28)" }}>
            <div style={{ width: 140, height: 140, borderRadius: "50%", background: "#222", opacity: 0.3 }} />
          </div>
          <div style={{ width: 120, height: 28, margin: "22px auto 0", background: "#222", borderRadius: 8, opacity: 0.3 }} />
          <div style={{ width: 80, height: 18, margin: "8px auto 0", background: "#222", borderRadius: 8, opacity: 0.2 }} />
          <div style={{ width: 200, height: 16, margin: "16px auto 0", background: "#222", borderRadius: 8, opacity: 0.15 }} />
          {error && <p style={{ marginTop: 20, color: "#ff7d7d", fontSize: "0.85rem" }}>{error}</p>}
        </section>
        {isPC ? null : <BottomNav active="profile" />}
      </main>
    );
  }

  return (
    <main style={mainStyle}>
      {isPC ? <SideNav active="profile" /> : null}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 8px" }}>
        <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800 }}>プロフィール</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {String(userId) === "me" && (
            <button
              aria-label="プロフィール編集"
              onClick={() => router.push("/profile/edit")}
              style={{ background: "none", border: "none", color: "#888888", cursor: "pointer", padding: 4 }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3.2" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 5 15.4a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 16 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8c.14.31.22.65.22 1v.09A1.65 1.65 0 0 0 21 12c0 .35-.08.69-.22 1v.09A1.65 1.65 0 0 0 19.4 15z" />
              </svg>
            </button>
          )}
          <button
            aria-label="戻る"
            onClick={() => router.back()}
            style={{ background: "none", border: "none", color: "#888888", cursor: "pointer", padding: 4 }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>
      </header>
      <section style={{ padding: "8px 20px 0", textAlign: "center" }}>
        <div style={{ width: 156, height: 156, margin: "0 auto", borderRadius: "50%", border: "6px solid #1f4f26", background: "#1a1a1a", position: "relative", display: "grid", placeItems: "center", boxShadow: "0 10px 28px rgba(0, 0, 0, 0.28)" }}>
          <div style={{ width: 140, height: 140, borderRadius: "50%", background: "linear-gradient(135deg, #f2d5c8 0%, #c98f87 100%)", display: "grid", placeItems: "center", fontSize: "2.4rem", fontWeight: 800, color: "#2b1f1c", overflow: "hidden" }}>
            {profile.icon_image_path ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.icon_image_path} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              profile.username?.[0]?.toUpperCase() ?? "?"
            )}
          </div>
        </div>
        <h2 style={{ margin: "22px 0 0", fontSize: "1.8rem", fontWeight: 800 }}>{profile.username}</h2>
        <p style={{ margin: "8px 0 0", color: "#7dff2b", fontSize: "0.95rem", fontWeight: 700 }}>@{profile.username}</p>
        <p style={{ margin: "16px auto 0", maxWidth: 320, color: "#aaaaaa", fontSize: "0.85rem", lineHeight: 1.6 }}>{profile.profile_bio}</p>
        {profile.github_url && (
          <a
            href={profile.github_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-block", marginTop: 12, color: "#7dff2b", fontSize: "0.85rem", textDecoration: "none" }}
          >
            GitHub
          </a>
        )}
        {profile.skills && profile.skills.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 20 }}>
            {profile.skills.map((skill: { id: number; name: string }) => (
              <span
                key={skill.id}
                style={{
                  background: "#152413",
                  border: "1px solid #7dff2b",
                  borderRadius: 99,
                  padding: "6px 14px",
                  fontSize: "0.82rem",
                  color: "#7dff2b",
                  fontWeight: 700,
                }}
              >
                {skill.name}
              </span>
            ))}
          </div>
        )}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button
            type="button"
            onClick={() => router.push(String(userId) === "me" ? "/myproject" : `/profile/${userId}/projects`)}
            style={{ borderRadius: 8, padding: "8px 12px", background: "#8aff1d", color: "#111", fontWeight: 700, border: "none", cursor: "pointer" }}
          >
            {String(userId) === "me" ? "マイプロジェクトを開く" : "プロジェクトを見る"}
          </button>
        </div>
      </section>
      {isPC ? null : <BottomNav active="profile" />}
    </main>
  );
}
