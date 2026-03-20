"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SideNav } from "@/components/SideNav";
import { BottomNav } from "@/components/BottomNav";
import Image from "next/image";
import { fetchProfileAll } from "@/lib/profile-extra-api";
import { buildProjectImage } from "@/lib/project-image";
import { isMobileUA } from "@/lib/device";

export default function MyProjectsIndexPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPC, setIsPC] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const update = () => setIsPC(window.innerWidth >= 900 && !isMobileUA());
    update();
    setMounted(true);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    let isMountedFlag = true;
    setLoading(true);
    fetchProfileAll()
      .then((data) => {
        if (!isMountedFlag) return;
        setProjects(Array.isArray(data.projects) ? data.projects : []);
        setError("");
      })
      .catch(() => {
        if (!isMountedFlag) return;
        setError("マイプロジェクトを取得できませんでした。ログインしてください。");
        setProjects([]);
      })
      .finally(() => {
        if (!isMountedFlag) return;
        setLoading(false);
      });
    return () => { isMountedFlag = false; };
  }, []);

  const NavBarElement = mounted ? (isPC ? <SideNav active="myproject" /> : <BottomNav active="home" />) : null;

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
          <h1 style={{ margin: 0 }}>マイプロジェクト</h1>
        </header>

        {error ? (
          <div style={{ padding: 24, background: "#161616", borderRadius: 12, border: "1px solid #262626" }}>
            <p style={{ margin: 0, color: "#f3c3c3" }}>{error}</p>
            <div style={{ marginTop: 12 }}>
              <button onClick={() => router.push("/auth/login")} style={{ marginRight: 8, borderRadius: 8, padding: "8px 12px", border: "1px solid #333", background: "#111", color: "#fff" }}>ログイン</button>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div style={{ padding: 24, background: "#161616", borderRadius: 12, border: "1px solid #262626" }}>
            <p style={{ margin: 0, color: "#d0d0d0" }}>参加中または作成したプロジェクトがありません。</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {projects.map((p: any) => (
              <article key={p.id ?? p.title} style={{ borderRadius: 12, overflow: "hidden", background: "#171717", border: "1px solid #232323" }}>
                <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#152126" }}>
                  {p.project_image_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.project_image_path} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Image src={buildProjectImage(p.title ?? String(p.id ?? "proj"), p.categories?.[0] ?? "") } alt={p.title ?? "project"} fill sizes="(max-width:480px) 100vw, 420px" style={{ objectFit: "cover" }} />
                  )}
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <h3 style={{ margin: 0, fontSize: "1rem" }}>{p.title}</h3>
                    <span style={{ fontSize: "0.78rem", color: "#aaa" }}>{p.meta ?? p.progress_status ?? ""}</span>
                  </div>
                  <p style={{ margin: "0 0 12px", color: "#cfcfcf", fontSize: "0.9rem", lineHeight: 1.5 }}>{p.description ?? "説明がありません"}</p>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => router.push(p.id ? `/project/${p.id}` : `/myproject/${encodeURIComponent(p.title)}`)} style={{ borderRadius: 8, background: "#8aff1d", color: "#111", fontWeight: 700, padding: "8px 12px", border: "none", cursor: "pointer" }}>開く</button>
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
