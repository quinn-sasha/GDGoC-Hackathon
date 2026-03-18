"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROFILE_SUMMARY, PROFILE_SKILLS } from "@/lib/mock-data";
import { updateProfile } from "@/lib/profile-api";

export default function ProfileEditPage() {
  const router = useRouter();

  const [name, setName] = useState(PROFILE_SUMMARY.name);
  const [handle, setHandle] = useState(PROFILE_SUMMARY.handle);
  const [bio, setBio] = useState(PROFILE_SUMMARY.bio);
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [skills, setSkills] = useState<string[]>(PROFILE_SKILLS.filter((s) => s !== "+"));
  const [showPicker, setShowPicker] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const isValidLink = (value: string) => value.trim() === "" || /^https?:\/\/\S+$/i.test(value.trim());
  const hasInvalidLink = !isValidLink(githubUrl) || !isValidLink(portfolioUrl);
  const canSave = name.trim() !== "" && handle.trim() !== "" && !hasInvalidLink;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
    setShowUpload(false);
  };

  const PRESET_SKILLS = [
    "SwiftUI", "Node.js", "Firebase", "Figma", "Python", "AWS",
    "React", "TypeScript", "Flutter", "Kotlin", "Go", "Rust",
    "Docker", "GraphQL", "PostgreSQL", "MongoDB", "Unity", "Blender",
    "Illustrator", "Premiere", "TensorFlow", "Next.js", "Vue", "Django",
  ];

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: 14,
    color: "#ffffff",
    fontSize: "1rem",
    padding: "14px 16px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "#888888",
    fontSize: "0.78rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: 8,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        maxWidth: 480,
        margin: "0 auto",
        background: "#111111",
        color: "#ffffff",
        fontFamily: "'Segoe UI', sans-serif",
        paddingBottom: 96,
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 20px 8px",
        }}
      >
        <button
          aria-label="戻る"
          onClick={() => router.back()}
          style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer", padding: 4 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800 }}>プロフィール編集</h1>
      </header>

      {/* Avatar */}
      <section style={{ padding: "24px 20px 0", textAlign: "center" }}>
        <div
          style={{
            width: 100,
            height: 100,
            margin: "0 auto",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #f2d5c8 0%, #c98f87 100%)",
            display: "grid",
            placeItems: "center",
            fontSize: "2rem",
            fontWeight: 800,
            color: "#2b1f1c",
            position: "relative",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          }}
        >
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarPreview} alt="avatar" style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            PROFILE_SUMMARY.avatarInitial
          )}
          <div
            onClick={() => setShowUpload(true)}
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "#8aff1d",
              border: "2px solid #111111",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
        </div>
      </section>

      {/* Upload modal */}
      {showUpload && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 200,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={() => setShowUpload(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              background: "#1a1a1a",
              borderRadius: "24px 24px 0 0",
              padding: "28px 20px 48px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>アイコン変更</h3>
              <button
                onClick={() => setShowUpload(false)}
                style={{ background: "none", border: "none", color: "#888888", fontSize: "1.4rem", cursor: "pointer", padding: 0, lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                border: "1px dashed #444444",
                borderRadius: 16,
                padding: "36px 20px",
                cursor: "pointer",
                color: "#888888",
                fontSize: "0.9rem",
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8aff1d" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              写真をアップロード
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>
      )}

      {/* Form */}
      <section style={{ padding: "32px 20px 0", display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <label style={labelStyle}>ユーザー名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>ユーザーID</label>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>自己紹介</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            style={{
              ...inputStyle,
              resize: "none",
              lineHeight: 1.6,
            }}
          />
        </div>

        <div>
          <label style={labelStyle}>開発リンク</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="GitHub URL"
              style={inputStyle}
            />
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="ポートフォリオ URL"
              style={inputStyle}
            />
          </div>
          {hasInvalidLink ? (
            <p style={{ margin: "8px 0 0", color: "#ff7d7d", fontSize: "0.78rem" }}>
              リンクは http:// または https:// から始めて入力してください。
            </p>
          ) : null}
        </div>

        <div>
          <label style={labelStyle}>スキル</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {skills.map((skill) => (
              <span
                key={skill}
                style={{
                  background: "#152413",
                  border: "1px solid #7dff2b",
                  borderRadius: 99,
                  padding: "8px 10px 8px 16px",
                  fontSize: "0.85rem",
                  color: "#7dff2b",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {skill}
                <button
                  onClick={() => setSkills(skills.filter((s) => s !== skill))}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#7dff2b",
                    cursor: "pointer",
                    padding: 0,
                    lineHeight: 1,
                    fontSize: "0.9rem",
                    opacity: 0.7,
                  }}
                >
                  ×
                </button>
              </span>
            ))}
            <button
              onClick={() => setShowPicker(true)}
              style={{
                background: "transparent",
                border: "1px dashed #555555",
                borderRadius: 99,
                padding: "8px 14px",
                fontSize: "1.1rem",
                color: "#888888",
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              ＋
            </button>
          </div>
        </div>

        {/* Skill picker modal */}
        {showPicker && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              zIndex: 200,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
            onClick={() => setShowPicker(false)}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 480,
                background: "#1a1a1a",
                borderRadius: "24px 24px 0 0",
                padding: "24px 20px 48px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>スキルを選択</h3>
                <button
                  onClick={() => setShowPicker(false)}
                  style={{ background: "none", border: "none", color: "#888888", fontSize: "1.4rem", cursor: "pointer", padding: 0, lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {PRESET_SKILLS.map((skill) => {
                  const selected = skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      style={{
                        background: selected ? "#152413" : "#111111",
                        border: selected ? "1px solid #7dff2b" : "1px solid #333333",
                        borderRadius: 99,
                        padding: "9px 16px",
                        fontSize: "0.85rem",
                        color: selected ? "#7dff2b" : "#aaaaaa",
                        cursor: "pointer",
                        fontWeight: selected ? 700 : 400,
                      }}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setShowPicker(false)}
                style={{
                  marginTop: 24,
                  width: "100%",
                  background: "#8aff1d",
                  border: "none",
                  borderRadius: 14,
                  color: "#111111",
                  fontWeight: 800,
                  fontSize: "1rem",
                  padding: "14px 0",
                  cursor: "pointer",
                }}
              >
                決定
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Save button */}
      <div style={{ padding: "36px 20px 0" }}>
        <button
          onClick={async () => {
            if (!canSave) return;
            try {
              await updateProfile({ name, handle, bio });
              router.back();
            } catch (e) {
              alert("プロフィール更新に失敗しました");
            }
          }}
          style={{
            width: "100%",
            background: "#8aff1d",
            border: "none",
            borderRadius: 16,
            color: "#111111",
            fontSize: "1rem",
            fontWeight: 800,
            padding: "16px 0",
            cursor: canSave ? "pointer" : "default",
            opacity: canSave ? 1 : 0.55,
          }}
        >
          保存する
        </button>
      </div>
    </main>
  );
}
