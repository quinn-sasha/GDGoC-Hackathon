"use client";


import { useRouter, useParams } from "next/navigation";
import { PROFILE_PROJECTS, PROFILE_SUMMARY } from "@/lib/mock-data";
import { buildProjectImage } from "@/lib/project-image";
import Image from "next/image";

export default function MyProjectDetailPage() {
  const router = useRouter();
  const params = useParams<{ name: string }>();
  const project = PROFILE_PROJECTS.find(p => encodeURIComponent(p.name) === params.name);

  if (!project) {
    return (
      <main style={{ padding: 32, color: "#fff", background: "#111", minHeight: "100vh" }}>
        <h2>プロジェクトが見つかりません</h2>
        <button onClick={() => router.push("/home")} style={{ marginTop: 24 }}>ホームへ戻る</button>
      </main>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "#111", color: "#fff", minHeight: "100vh", position: "relative", display: "flex", flexDirection: "column" }}>
      <main style={{ flex: 1 }}>
        <button
          onClick={() => router.push("/home")}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: 22,
            cursor: "pointer",
            margin: "18px 0 0 0",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
          aria-label="ホームに戻る"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          戻る
        </button>
        <div style={{
          borderRadius: 20,
          overflow: "hidden",
          background: "#171717",
          border: "1px solid #232323",
          margin: "22px 0 0 0",
          boxShadow: "0 6px 32px rgba(0,0,0,0.18)",
        }}>
          <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#152126" }}>
            <Image
              src={buildProjectImage(project.name, project.meta.split("·")[0].trim())}
              alt={`${project.name} の背景画像`}
              fill
              sizes="(max-width: 480px) 100vw, 420px"
              style={{ objectFit: "cover", zIndex: 0, filter: "brightness(0.92)" }}
            />
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(8,12,14,0.08) 0%, rgba(8,12,14,0.82) 100%)",
              zIndex: 1,
            }} />
            <div style={{
              position: "absolute",
              left: 0,
              bottom: 0,
              width: "100%",
              zIndex: 2,
              padding: "0 18px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ background: project.accent, color: "#fff", borderRadius: 6, padding: "3px 10px", fontSize: "0.8rem", fontWeight: 700 }}>{project.badge}</span>
                <span style={{ color: "#aaa", fontSize: "0.9rem" }}>{project.meta}</span>
              </div>
              <h1 style={{ fontSize: "1.18rem", fontWeight: 700, margin: 0, color: "#fff", textShadow: "0 2px 8px #0008" }}>{project.name}</h1>
            </div>
          </div>
          <div style={{ padding: "18px 18px 16px" }}>
            <p style={{ margin: "0 0 14px", fontSize: "0.97rem", color: "#eaeaea", lineHeight: 1.6 }}>{project.description}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.88rem", color: "#cccccc", background: "#181818", borderRadius: 12, padding: "8px 14px", marginBottom: 2 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: project.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 13 }}>{project.initial}</div>
              <span>{PROFILE_SUMMARY.name}</span>
              <span style={{ color: "#888", fontSize: "0.85rem" }}>{project.members}</span>
            </div>
          </div>
        </div>
        <section style={{ display: "flex", flexDirection: "column", gap: 18, margin: "22px 0 0 0" }}>
          <div style={{ background: "#181818", borderRadius: 16, boxShadow: "0 2px 12px #0002", padding: "18px 18px 12px" }}>
            <h2 style={{ fontSize: "1.05rem", margin: "0 0 10px", color: "#fff", letterSpacing: "0.04em" }}>進捗</h2>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", color: "#b3ffcb", fontSize: "0.97rem" }}>
              <li style={{ marginBottom: 6 }}>UI設計ドラフト作成 <span style={{ color: "#4fc3a1" }}>完了</span></li>
              <li style={{ marginBottom: 6 }}>API連携 <span style={{ color: "#c9973a" }}>進行中</span></li>
              <li>テスト <span style={{ color: "#aaaaaa" }}>未着手</span></li>
            </ul>
          </div>
          <div style={{ background: "#181818", borderRadius: 16, boxShadow: "0 2px 12px #0002", padding: "18px 18px 12px" }}>
            <h2 style={{ fontSize: "1.05rem", margin: "0 0 10px", color: "#fff", letterSpacing: "0.04em" }}>タスク</h2>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", color: "#fff", fontSize: "0.97rem" }}>
              <li style={{ marginBottom: 6 }}>Figmaで画面遷移図を作成</li>
              <li style={{ marginBottom: 6 }}>バックエンドAPIのエンドポイント設計</li>
              <li>週次ミーティングで進捗共有</li>
            </ul>
          </div>
        </section>
      </main>
      {/* Bottom nav */}
      <nav style={{
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
      }}>
        <button style={{ background: "none", border: "none", color: "#666", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: "0.72rem", padding: "0 20px" }} onClick={() => router.push("/home")}> 
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
          </svg>
          <span>ホーム</span>
        </button>
        <button style={{ background: "none", border: "none", color: "#666", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: "0.72rem", padding: "0 20px" }} onClick={() => router.push("/chat")}> 
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>チャット</span>
        </button>
        <button style={{ background: "none", border: "none", color: "#666", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: "0.72rem", padding: "0 20px" }} onClick={() => router.push("/profile/me")}> 
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>プロフィール</span>
        </button>
      </nav>
    </div>
  );
}
