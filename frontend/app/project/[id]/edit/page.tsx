"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { SideNav } from "@/components/SideNav";
import { isMobileUA } from "@/lib/device";
import { fetchProjectDetail, updateProject, uploadProjectImage } from "@/lib/project-api";
import { buildProjectImage } from "@/lib/project-image";

export default function ProjectEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("opening");
  const [techsText, setTechsText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    let mounted = true;
    setLoading(true);
    fetchProjectDetail(projectId)
      .then((p) => {
        if (!mounted) return;
        setTitle(p.title ?? "");
        setDescription(p.description ?? "");
        setStatus(p.progress_status ?? "opening");
        setTechsText(Array.isArray(p.technologies) ? p.technologies.map((t: any) => t.name ?? t).join(", ") : "");
        setImagePreview(p.project_image_path ?? null);
      })
      .catch(() => setError("プロジェクトの読み込みに失敗しました"))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [projectId]);

  const NavBarElement = mounted ? (isPC ? <SideNav active="home" /> : <BottomNav active="home" />) : null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError("");
    setSaving(true);
    try {
      const techs = techsText.split(",").map((s) => s.trim()).filter(Boolean).map((s) => s.toLowerCase());
      await updateProject(projectId, { title: title.trim(), description: description.trim(), progress_status: status, technologies: techs });
      if (imageFile) {
        await uploadProjectImage(projectId, imageFile);
      }
      router.push(`/project/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (<>{NavBarElement}<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>読み込み中...</div></>);

  return (
    <>
      {NavBarElement}
      <div style={{ minHeight: "100vh", background: "#111111", color: "#ffffff", paddingLeft: isPC ? 100 : 0 }}>
        <main style={{ maxWidth: 800, margin: "0 auto", padding: isPC ? "32px" : "80px 16px 140px" }}>
          <h1 style={{ margin: 0, fontSize: "1.25rem", marginBottom: 12 }}>募集を編集</h1>
          {error && <p style={{ color: "#ff8f8f" }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label style={{ fontSize: "0.85rem", color: "#bdbdbd" }}>タイトル</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: 12, borderRadius: 10, background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#fff" }} />

              <label style={{ fontSize: "0.85rem", color: "#bdbdbd" }}>募集内容</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ minHeight: 160, padding: 12, borderRadius: 10, background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#fff" }} />

              <label style={{ fontSize: "0.85rem", color: "#bdbdbd" }}>ステータス</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: 10, borderRadius: 10, background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#fff" }}>
                <option value="opening">開始前</option>
                <option value="ongoing">進行中</option>
                <option value="completed">完了</option>
              </select>

              <label style={{ fontSize: "0.85rem", color: "#bdbdbd" }}>技術（カンマ区切り）</label>
              <input value={techsText} onChange={(e) => setTechsText(e.target.value)} style={{ padding: 12, borderRadius: 10, background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#fff" }} />

              <label style={{ fontSize: "0.85rem", color: "#bdbdbd" }}>サムネイル（任意）</label>
              <label style={{ display: "block", borderRadius: 10, overflow: "hidden", cursor: "pointer" }}>
                <img src={imagePreview ?? buildProjectImage(title || "プロジェクト", "")} alt="preview" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
              </label>

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button type="submit" disabled={saving} style={{ padding: "10px 14px", borderRadius: 10, background: "#8aff1d", border: "none", color: "#111" }}>{saving ? "保存中..." : "変更を保存"}</button>
                <button type="button" onClick={() => router.push(`/project/${projectId}`)} style={{ padding: "10px 14px", borderRadius: 10, background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#fff" }}>キャンセル</button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}
