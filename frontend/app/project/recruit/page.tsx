"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, type FormEvent } from "react";
import { BottomNav } from "@/components/BottomNav";
import { SideNav } from "@/components/SideNav";
import { isMobileUA } from "@/lib/device";
import { createProject, uploadProjectImage, fetchAvailableSkills } from "@/lib/project-api";
import { buildProjectImage } from "@/lib/project-image";

const STATUS_OPTIONS = [
  { value: "opening", label: "開始前" },
  { value: "ongoing", label: "進行中" },
  { value: "completed", label: "完了" },
];

const TITLE_MAX = 50;
const DESCRIPTION_MAX = 400;

export default function ProjectRecruitPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [showSkillPicker, setShowSkillPicker] = useState(false);
  const [status, setStatus] = useState(STATUS_OPTIONS[0]?.value ?? "opening");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [imageWarning, setImageWarning] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPC, setIsPC] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [skillSearch, setSkillSearch] = useState("");

  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const canSubmit =
    trimmedTitle.length > 0 &&
    trimmedDescription.length > 0 &&
    skills.length > 0 &&
    !isSubmitting;

  useEffect(() => {
    const token = sessionStorage.getItem("access_token") ?? localStorage.getItem("access_token");
    if (!token) {
      router.replace("/auth/login");
      return;
    }
    const update = () => setIsPC(window.innerWidth >= 900 && !isMobileUA());
    update();
    setMounted(true);
    window.addEventListener("resize", update);
    fetchAvailableSkills()
      .then((skills) => setAvailableSkills(skills.map((s) => s.name)))
      .catch(() => {});
    return () => window.removeEventListener("resize", update);
  }, [router]);

  const NavBarElement = mounted ? (isPC ? <SideNav active="home" /> : <BottomNav active="home" />) : null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const closeSkillPicker = () => {
    setShowSkillPicker(false);
    setSkillSearch("");
  };

  const filteredSkills = skillSearch.trim()
    ? availableSkills.filter((s) => s.includes(skillSearch.trim().toLowerCase()))
    : availableSkills;

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((item) => item !== skill) : [...prev, skill],
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!canSubmit) {
      if (!trimmedTitle) setFormError("タイトルを入力してください。");
      else if (!trimmedDescription) setFormError("募集内容を入力してください。");
      else if (skills.length === 0) setFormError("スキルを1つ以上選択してください。");
      return;
    }

    setIsSubmitting(true);
    setImageWarning("");

    try {
      // バックエンドは英数字と . + # - スペースのみ許可
      const validTechs = skills
        .map((s) => s.toLowerCase().trim())
        .filter((s) => /^[a-z0-9\s.+#-]+$/.test(s));
      const project = await createProject({
        title: trimmedTitle,
        description: trimmedDescription,
        progress_status: status,
        technologies: validTechs,
      });
      // 画像が選択されていればアップロード（失敗しても作成自体は成功とする）
      if (imageFile && project?.id) {
        try {
          await uploadProjectImage(String(project.id), imageFile);
        } catch {
          setImageWarning("画像のアップロードに失敗しました。プロジェクトは作成されました。");
          setIsSubmitting(false);
          return;
        }
      }
      router.push("/home");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "プロジェクトの作成に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {NavBarElement}
      <div
        style={{
          minHeight: "100vh",
          background: "#111111",
          color: "#ffffff",
          paddingLeft: isPC ? 100 : 0,
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        <main
          style={{
            width: isPC ? 720 : "100%",
            maxWidth: isPC ? "calc(100% - 120px)" : 480,
            margin: isPC ? "0 0 0 12px" : "0 auto",
            padding: isPC ? "18px 18px 26px" : "64px 18px 140px",
            boxSizing: "border-box",
          }}
        >
          <header
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
              ...(isPC
                ? {}
                : {
                    position: "fixed",
                    top: 8,
                    left: 12,
                    zIndex: 220,
                    width: "calc(100% - 24px)",
                  }),
            }}
          >
            <button
              type="button"
              aria-label="戻る"
              onClick={() => router.back()}
              style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer", padding: 4 }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>プロジェクト募集を作成</h1>
          </header>

          <form onSubmit={handleSubmit}>
            <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              <label style={{ fontSize: "0.8rem", color: "#8b8b8b" }}>タイトル</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={TITLE_MAX}
                placeholder="プロジェクト名を入力"
                style={{
                  width: "100%",
                  background: "#1a1a1a",
                  border: "1px solid #2d2d2d",
                  borderRadius: 12,
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  padding: "12px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
              <p style={{ margin: "-6px 0 2px", color: "#747474", fontSize: "0.75rem", textAlign: "right" }}>
                {trimmedTitle.length}/{TITLE_MAX}
              </p>

              <label style={{ fontSize: "0.8rem", color: "#8b8b8b" }}>募集内容</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={DESCRIPTION_MAX}
                placeholder="プロジェクトの内容や募集要件を入力"
                style={{
                  width: "100%",
                  minHeight: 120,
                  resize: "vertical",
                  background: "#1a1a1a",
                  border: "1px solid #2d2d2d",
                  borderRadius: 12,
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  padding: "12px",
                  boxSizing: "border-box",
                  outline: "none",
                  lineHeight: 1.5,
                }}
              />
              <p style={{ margin: "-6px 0 2px", color: "#747474", fontSize: "0.75rem", textAlign: "right" }}>
                {trimmedDescription.length}/{DESCRIPTION_MAX}
              </p>

              <label style={{ fontSize: "0.8rem", color: "#8b8b8b" }}>スキル</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {skills.length === 0 ? (
                  <span
                    style={{
                      borderRadius: 999,
                      border: "1px solid #3b3b3b",
                      background: "#1f1f1f",
                      color: "#8b8b8b",
                      fontSize: "0.8rem",
                      padding: "7px 12px",
                    }}
                  >
                    未選択
                  </span>
                ) : (
                  skills.map((skill) => (
                    <span
                      key={skill}
                      style={{
                        borderRadius: 999,
                        border: "1px solid #7dff2b",
                        background: "#152413",
                        color: "#7dff2b",
                        fontSize: "0.82rem",
                        padding: "7px 8px 7px 12px",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        aria-label={`${skill}を削除`}
                        style={{
                          border: "none",
                          background: "none",
                          color: "#7dff2b",
                          cursor: "pointer",
                          padding: "0 2px",
                          lineHeight: 1,
                          fontSize: "0.9rem",
                          opacity: 0.8,
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowSkillPicker(true)}
                style={{
                  width: "100%",
                  background: "#1f1f1f",
                  border: "1px solid #3b3b3b",
                  borderRadius: 12,
                  color: "#d6d6d6",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  padding: "11px 0",
                  cursor: "pointer",
                }}
              >
                スキルを選択
              </button>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#8b8b8b", marginBottom: 8 }}>
                  サムネイル画像（任意）
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    aspectRatio: "16 / 9",
                    maxHeight: 220,
                    borderRadius: 12,
                    border: "1px dashed #3b3b3b",
                    background: "transparent",
                    cursor: "pointer",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <img
                    src={imagePreview ?? buildProjectImage(trimmedTitle || "プロジェクト", "")}
                    alt="プレビュー"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  {!imagePreview && (
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(0,0,0,0.3)",
                    }}>
                      <span style={{ color: "#ffffff", fontSize: "0.85rem" }}>
                        クリックして画像を選択
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                  />
                </label>
                {imageFile && (
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    style={{
                      marginTop: 6,
                      background: "none",
                      border: "none",
                      color: "#8b8b8b",
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    画像を削除
                  </button>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#8b8b8b", marginBottom: 8 }}>ステータス</label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  style={{
                    width: "100%",
                    background: "#1a1a1a",
                    border: "1px solid #2d2d2d",
                    borderRadius: 12,
                    color: "#ffffff",
                    fontSize: "0.9rem",
                    padding: "11px",
                    outline: "none",
                  }}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </section>

            {formError ? (
              <p style={{ margin: "12px 0 0", color: "#ff7d7d", fontSize: "0.83rem" }}>{formError}</p>
            ) : null}
            {imageWarning ? (
              <p style={{ margin: "12px 0 0", color: "#ffcc44", fontSize: "0.83rem" }}>{imageWarning}</p>
            ) : null}

            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button
                type="button"
                onClick={() => router.back()}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  border: "1px solid #343434",
                  background: "#1f1f1f",
                  color: "#d0d0d0",
                  fontWeight: 700,
                  padding: "12px 0",
                  cursor: "pointer",
                }}
              >
                キャンセル
              </button>
              <button
                type="submit"
                style={{
                  flex: 1,
                  borderRadius: 12,
                  border: "none",
                  background: "#8aff1d",
                  color: "#111111",
                  fontWeight: 800,
                  padding: "12px 0",
                  cursor: canSubmit ? "pointer" : "default",
                  opacity: canSubmit ? 1 : 0.55,
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "作成中..." : "作成"}
              </button>
            </div>
          </form>

          {showSkillPicker ? (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0, 0, 0, 0.65)",
                zIndex: 180,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
              onClick={closeSkillPicker}
            >
              <section
                style={{
                  width: "100%",
                  maxWidth: isPC ? 720 : 480,
                  background: "#1a1a1a",
                  borderRadius: "22px 22px 0 0",
                  borderTop: "1px solid #2a2a2a",
                  padding: "18px 16px 22px",
                }}
                onClick={(event) => event.stopPropagation()}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 800 }}>スキルを選択</h3>
                  <button
                    type="button"
                    onClick={closeSkillPicker}
                    style={{
                      border: "none",
                      background: "none",
                      color: "#8b8b8b",
                      fontSize: "1.4rem",
                      lineHeight: 1,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#111111",
                    border: "1px solid #353535",
                    borderRadius: 10,
                    padding: "8px 12px",
                    marginBottom: 12,
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8b8b8b" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    placeholder="スキルを検索..."
                    autoFocus
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#ffffff",
                      fontSize: "0.88rem",
                    }}
                  />
                  {skillSearch && (
                    <button
                      type="button"
                      onClick={() => setSkillSearch("")}
                      style={{ background: "none", border: "none", color: "#8b8b8b", cursor: "pointer", padding: 0, lineHeight: 1, fontSize: "1rem" }}
                    >
                      ×
                    </button>
                  )}
                </div>

                <div
                  style={{
                    maxHeight: "45vh",
                    overflowY: "auto",
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 8,
                    paddingRight: 2,
                  }}
                >
                  {availableSkills.length === 0 ? (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#8b8b8b", padding: "20px 0", fontSize: "0.85rem" }}>
                      読み込み中...
                    </div>
                  ) : filteredSkills.length === 0 ? (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#8b8b8b", padding: "20px 0", fontSize: "0.85rem" }}>
                      「{skillSearch}」に一致するスキルがありません
                    </div>
                  ) : filteredSkills.map((skill) => {
                    const selected = skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        style={{
                          borderRadius: 10,
                          border: selected ? "1px solid #7dff2b" : "1px solid #353535",
                          background: selected ? "#152413" : "#202020",
                          color: selected ? "#7dff2b" : "#d0d0d0",
                          fontSize: "0.84rem",
                          padding: "11px 10px",
                          cursor: "pointer",
                          fontWeight: selected ? 700 : 500,
                          textAlign: "center",
                        }}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={closeSkillPicker}
                  style={{
                    marginTop: 14,
                    width: "100%",
                    borderRadius: 12,
                    border: "none",
                    background: "#8aff1d",
                    color: "#111111",
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    padding: "12px 0",
                    cursor: "pointer",
                  }}
                >
                  選択を完了
                </button>
              </section>
            </div>
          ) : null}
        </main>
      </div>
    </>
  );
}
