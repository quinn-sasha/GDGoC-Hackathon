"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SideNav } from "@/components/SideNav";
import { BottomNav } from "@/components/BottomNav";
import Image from "next/image";
import { isMobileUA } from "@/lib/device";
import { fetchProfileById } from "@/lib/profile-api";
import { fetchProjects } from "@/lib/project-api";

export default function UserProjectsPage() {
  const { userId } = useParams();
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPC, setIsPC] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const update = () => setIsPC(window.innerWidth >= 900 && !isMobileUA());
    update();
    setMounted(true);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    let mountedFlag = true;
    setLoading(true);
    setError("");
    // Try to get the username for the profile, then fetch projects and filter by owner_name
    Promise.all([fetchProfileById(userId as string).catch((e) => null), fetchProjects().catch((e) => null)])
      .then(([profileResp, projectsResp]) => {
        if (!mountedFlag) return;
        if (!projectsResp) {
          setError("プロジェクトの取得に失敗しました");
          setProjects([]);
          return;
        }
        const allProjects = Array.isArray(projectsResp) ? projectsResp : projectsResp.results ?? [];
        if (profileResp && profileResp.username) {
          const filtered = allProjects.filter((p: any) => p.owner_name === profileResp.username || String(p.owner) === String(profileResp.id));
          setProjects(filtered);
        } else {
          // If profile fetch failed (unauthenticated), try to filter by userId matching owner field
          const filtered = allProjects.filter((p: any) => String(p.owner) === String(userId) || p.owner_name === String(userId));
          setProjects(filtered);
        }
      })
      .catch(() => {
        if (!mountedFlag) return;
        setError("データ取得に失敗しました");
        setProjects([]);
      })
      .finally(() => {
        if (!mountedFlag) return;
        setLoading(false);
      });
    return () => { mountedFlag = false; };
  }, [userId]);

  const NavBarElement = mounted ? (isPC ? <SideNav active="home" /> : <BottomNav active="home" />) : null;

  if (loading) {
    return (
      <>
        {NavBarElement}
        <div style={{ minHeight: "100vh", background: "#111111", color: "#ffffff", paddingLeft: isPC ? 100 : 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          読み込み中...
        </div>
      </>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#111111", color: "#ffffff", paddingLeft: isPC ? 100 : 0 }}>
      {NavBarElement}
      <main style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h1 style={{ margin: 0 }}>ユーザーのプロジェクト</h1>
          <div>
            <button onClick={() => router.back()} style={{ borderRadius: 8, padding: "8px 12px", border: "1px solid #333", background: "#111", color: "#fff" }}>戻る</button>
          </div>
        </header>

        {error ? (
          <div style={{ padding: 24, background: "#161616", borderRadius: 12, border: "1px solid #262626" }}>{error}</div>
        ) : projects.length === 0 ? (
          <div style={{ padding: 24, background: "#161616", borderRadius: 12, border: "1px solid #262626" }}>このユーザーのプロジェクトが見つかりません。</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {projects.map((p: any) => (
              <article key={p.id ?? p.title} style={{ borderRadius: 12, overflow: "hidden", background: "#171717", border: "1px solid #232323" }}>
                <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#152126" }}>
                  {p.project_image_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.project_image_path} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Image src={`/api/project-image?title=${encodeURIComponent(p.title ?? "project")}`} alt={p.title ?? "project"} fill sizes="(max-width:480px) 100vw, 420px" style={{ objectFit: "cover" }} />
                  )}
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <h3 style={{ margin: 0, fontSize: "1rem" }}>{p.title}</h3>
                    <span style={{ fontSize: "0.78rem", color: "#aaa" }}>{p.progress_status ?? ""}</span>
                  </div>
                  <p style={{ margin: "0 0 12px", color: "#cfcfcf", fontSize: "0.9rem", lineHeight: 1.5 }}>{p.description ?? "説明がありません"}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: p.owner_icon ?? "#333", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800 }}>{(p.owner_name ?? "?")[0]}</div>
                      <div style={{ color: "#9a9a9a", fontSize: "0.85rem" }}>{p.owner_name}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => router.push(`/project/${p.id}`)} style={{ borderRadius: 8, background: "#8aff1d", color: "#111", fontWeight: 700, padding: "8px 12px", border: "none", cursor: "pointer" }}>開く</button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
