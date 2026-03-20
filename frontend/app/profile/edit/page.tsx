"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, fetchProfile, fetchSkills, uploadProfileIcon } from "@/lib/profile-api";
import { isMobileUA } from "@/lib/device";
import { BottomNav } from "@/components/BottomNav";
import { SideNav } from "@/components/SideNav";

type Skill = { id: number; name: string };

const NAME_MAX = 30;
const BIO_MAX = 160;

export default function ProfileEditPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [avatarInitial, setAvatarInitial] = useState("?");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [imageWarning, setImageWarning] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const [isPC, setIsPC] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token") ?? localStorage.getItem("access_token");
    if (!token) { router.replace("/auth/login"); return; }

    const update = () => setIsPC(window.innerWidth >= 900 && !isMobileUA());
    update();
    setMounted(true);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [router]);

  useEffect(() => {
    Promise.all([fetchProfile(), fetchSkills()])
      .then(([profile, skills]) => {
        setName(profile.username ?? "");
        setBio(profile.profile_bio ?? "");
        setGithubUrl(profile.github_url ?? "");
        setAvatarInitial((profile.username?.[0] ?? "?").toUpperCase());
        if (profile.icon_image_path) setAvatarPreview(profile.icon_image_path);
        setAllSkills(skills);
        const profileSkillIds = new Set((profile.skills ?? []).map((s: Skill) => s.id));
        setSelectedSkills(skills.filter((s: Skill) => profileSkillIds.has(s.id)));
      })
      .catch(() => {
        fetchSkills().then(setAllSkills).catch(() => {});
      })
      .finally(() => setProfileLoading(false));
  }, []);

  const isValidLink = (value: string) =>
    value.trim() === "" || /^https?:\/\/\S+$/i.test(value.trim());

  const canSave = name.trim() !== "" && isValidLink(githubUrl) && !saving;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
    setShowUpload(false);
  };

  const toggleSkill = useCallback((skill: Skill) => {
    setSelectedSkills((prev) =>
      prev.some((s) => s.id === skill.id)
        ? prev.filter((s) => s.id !== skill.id)
        : [...prev, skill]
    );
  }, []);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setSaveError(null);
    setImageWarning(null);
    try {
      // アイコン画像が選択されていればアップロード（失敗しても他の更新は続行）
      if (avatarFile) {
        try {
          await uploadProfileIcon(avatarFile);
        } catch {
          setImageWarning("画像のアップロードに失敗しました。他の情報は保存されました。");
        }
      }
      await updateProfile({
        username: name,
        profile_bio: bio,
        github_url: githubUrl,
        skill_ids: selectedSkills.map((s) => s.id),
      });
      router.back();
    } catch {
      setSaveError("プロフィールの更新に失敗しました。もう一度お試しください。");
    } finally {
      setSaving(false);
    }
  };

  const NavBar = mounted ? (isPC ? <SideNav active="profile" /> : <BottomNav active="profile" />) : null;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#1a1a1a",
    border: "1px solid #2d2d2d",
    borderRadius: 12,
    color: "#ffffff",
    fontSize: "0.9rem",
    padding: "12px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "#8b8b8b",
    fontSize: "0.8rem",
    marginBottom: 6,
  };

  if (profileLoading) {
    return (
      <>
        {NavBar}
        <div
          style={{
            minHeight: "100vh",
            background: "#111111",
            paddingLeft: isPC ? 100 : 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center", color: "#888888" }}>
            <div
              style={{
                width: 36,
                height: 36,
                border: "3px solid #2a2a2a",
                borderTop: "3px solid #8aff1d",
                borderRadius: "50%",
                margin: "0 auto 14px",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p style={{ margin: 0, fontSize: "0.88rem" }}>読み込み中...</p>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {NavBar}

      <div
        style={{
          minHeight: "100vh",
          background: "#111111",
          color: "#ffffff",
          paddingLeft: isPC ? 100 : 0,
        }}
      >
        <main
          style={{
            width: isPC ? 720 : "100%",
            maxWidth: isPC ? "calc(100% - 120px)" : 480,
            margin: isPC ? "0 0 0 12px" : "0 auto",
            padding: isPC ? "18px 18px 60px" : "0 18px 140px",
            boxSizing: "border-box",
          }}
        >
          {/* Header */}
          <header
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
              ...(isPC
                ? { padding: "18px 0 6px" }
                : {
                    position: "fixed",
                    top: 8,
                    left: 12,
                    zIndex: 220,
                    width: "calc(100% - 24px)",
                    paddingTop: 8,
                    background: "#111111",
                  }),
            }}
          >
            <button
              aria-label="戻る"
              onClick={() => router.back()}
              style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer", padding: 4, flexShrink: 0 }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>プロフィール編集</h1>
          </header>

          {/* モバイル時ヘッダー分のスペース */}
          {!isPC && <div style={{ height: 56 }} />}

          {/* PC: 2カラム / スマホ: 1カラム */}
          <div
            style={{
              display: isPC ? "grid" : "flex",
              gridTemplateColumns: isPC ? "200px 1fr" : undefined,
              flexDirection: isPC ? undefined : "column",
              gap: isPC ? 40 : 0,
              alignItems: "start",
            }}
          >
            {/* 左カラム: アバター (PC) / 上部 (スマホ) */}
            <div style={{ textAlign: "center", marginBottom: isPC ? 0 : 24, paddingTop: isPC ? 4 : 0 }}>
              <div
                style={{
                  width: isPC ? 120 : 100,
                  height: isPC ? 120 : 100,
                  margin: "0 auto",
                  borderRadius: "50%",
                  border: "5px solid #1f4f26",
                  background: "#1a1a1a",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: isPC ? 110 : 90,
                    height: isPC ? 110 : 90,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #f2d5c8 0%, #c98f87 100%)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: isPC ? "2.4rem" : "2rem",
                    fontWeight: 800,
                    color: "#2b1f1c",
                    overflow: "hidden",
                  }}
                >
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    avatarInitial
                  )}
                </div>
                <div
                  onClick={() => setShowUpload(true)}
                  style={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#8aff1d",
                    border: "2px solid #111111",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
              </div>
              <p style={{ margin: "8px 0 0", fontSize: "0.75rem", color: "#555555" }}>タップして変更</p>

              {/* スキル (PC左カラム) */}
              {isPC && (
                <div style={{ marginTop: 28, textAlign: "left" }}>
                  <SkillSection
                    labelStyle={labelStyle}
                    selectedSkills={selectedSkills}
                    setSelectedSkills={setSelectedSkills}
                    setShowPicker={setShowPicker}
                    allSkills={allSkills}
                  />
                </div>
              )}
            </div>

            {/* 右カラム: フォーム */}
            <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* ユーザー名 */}
              <div>
                <label style={labelStyle}>ユーザー名</label>
                <input
                  type="text"
                  value={name}
                  maxLength={NAME_MAX}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="あなたの名前"
                  style={{
                    ...inputStyle,
                    borderColor: name.trim() === "" ? "#ff7d7d" : "#2d2d2d",
                  }}
                />
                <p style={{ margin: "4px 0 0", color: "#747474", fontSize: "0.75rem", textAlign: "right" }}>
                  {name.length}/{NAME_MAX}
                </p>
              </div>

              {/* 自己紹介 */}
              <div>
                <label style={labelStyle}>自己紹介</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={BIO_MAX}
                  rows={4}
                  placeholder="あなた自身について教えてください"
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5, minHeight: 100 }}
                />
                <p style={{ margin: "4px 0 0", color: "#747474", fontSize: "0.75rem", textAlign: "right" }}>
                  {bio.length}/{BIO_MAX}
                </p>
              </div>

              {/* GitHub URL */}
              <div>
                <label style={labelStyle}>GitHub URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  style={{
                    ...inputStyle,
                    borderColor: !isValidLink(githubUrl) ? "#ff7d7d" : "#2d2d2d",
                  }}
                />
                {!isValidLink(githubUrl) && (
                  <p style={{ margin: "4px 0 0", color: "#ff7d7d", fontSize: "0.75rem" }}>
                    https:// または http:// から始めて入力してください
                  </p>
                )}
              </div>

              {/* スキル (スマホ) */}
              {!isPC && (
                <SkillSection
                  labelStyle={labelStyle}
                  selectedSkills={selectedSkills}
                  setSelectedSkills={setSelectedSkills}
                  setShowPicker={setShowPicker}
                  allSkills={allSkills}
                />
              )}

              {/* エラー・警告メッセージ */}
              {saveError && (
                <p style={{ margin: "4px 0 0", color: "#ff7d7d", fontSize: "0.83rem" }}>{saveError}</p>
              )}
              {imageWarning && (
                <p style={{ margin: "4px 0 0", color: "#ffcc44", fontSize: "0.83rem" }}>{imageWarning}</p>
              )}

              {/* 保存ボタン */}
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
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
                    fontSize: "0.9rem",
                    padding: "12px 0",
                    cursor: "pointer",
                  }}
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!canSave}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    border: "none",
                    background: canSave ? "#8aff1d" : "#2a2a2a",
                    color: canSave ? "#111111" : "#555555",
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    padding: "12px 0",
                    cursor: canSave ? "pointer" : "default",
                    opacity: saving ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  {saving ? (
                    <>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          border: "2px solid #333",
                          borderTop: "2px solid #111",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      保存中...
                    </>
                  ) : "保存する"}
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Upload modal */}
      {showUpload && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 200,
            display: "flex", alignItems: "flex-end", justifyContent: "center",
          }}
          onClick={() => setShowUpload(false)}
        >
          <div
            style={{
              width: "100%", maxWidth: isPC ? 520 : 480,
              background: "#1a1a1a", borderRadius: "22px 22px 0 0",
              borderTop: "1px solid #2a2a2a", padding: "18px 16px 32px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 800 }}>アイコン変更</h3>
              <button onClick={() => setShowUpload(false)} style={{ background: "none", border: "none", color: "#8b8b8b", fontSize: "1.4rem", cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
            </div>
            <label
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 10, border: "1px dashed #444444", borderRadius: 12, padding: "32px 20px",
                cursor: "pointer", color: "#8b8b8b", fontSize: "0.88rem",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8aff1d" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              写真をアップロード
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
            </label>
          </div>
        </div>
      )}

      {/* Skill picker modal */}
      {showPicker && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 200,
            display: "flex", alignItems: "flex-end", justifyContent: "center",
          }}
          onClick={() => setShowPicker(false)}
        >
          <div
            style={{
              width: "100%", maxWidth: isPC ? 720 : 480,
              background: "#1a1a1a", borderRadius: "22px 22px 0 0",
              borderTop: "1px solid #2a2a2a", padding: "18px 16px 22px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 800 }}>
                スキルを選択
                <span style={{ marginLeft: 8, fontSize: "0.78rem", color: "#555", fontWeight: 400 }}>
                  {selectedSkills.length}件選択中
                </span>
              </h3>
              <button onClick={() => setShowPicker(false)} style={{ border: "none", background: "none", color: "#8b8b8b", fontSize: "1.4rem", lineHeight: 1, cursor: "pointer", padding: 0 }}>×</button>
            </div>
            <div
              style={{
                maxHeight: "52vh", overflowY: "auto",
                display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 8, paddingRight: 2,
              }}
            >
              {allSkills.map((skill) => {
                const selected = selectedSkills.some((s) => s.id === skill.id);
                return (
                  <button
                    key={skill.id}
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
                    {skill.name}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowPicker(false)}
              style={{
                marginTop: 14, width: "100%", borderRadius: 12, border: "none",
                background: "#8aff1d", color: "#111111", fontWeight: 800,
                fontSize: "0.9rem", padding: "12px 0", cursor: "pointer",
              }}
            >
              選択を完了 ({selectedSkills.length}件)
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function SkillSection({
  labelStyle,
  selectedSkills,
  setSelectedSkills,
  setShowPicker,
  allSkills,
}: {
  labelStyle: React.CSSProperties;
  selectedSkills: Skill[];
  setSelectedSkills: React.Dispatch<React.SetStateAction<Skill[]>>;
  setShowPicker: React.Dispatch<React.SetStateAction<boolean>>;
  allSkills: Skill[];
}) {
  return (
    <div>
      <label style={labelStyle}>スキル</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
        {selectedSkills.length === 0 ? (
          <span
            style={{
              borderRadius: 999, border: "1px solid #3b3b3b", background: "#1f1f1f",
              color: "#8b8b8b", fontSize: "0.8rem", padding: "7px 12px",
            }}
          >
            未選択
          </span>
        ) : (
          selectedSkills.map((skill) => (
            <span
              key={skill.id}
              style={{
                borderRadius: 999, border: "1px solid #7dff2b", background: "#152413",
                color: "#7dff2b", fontSize: "0.82rem", padding: "7px 8px 7px 12px",
                fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4,
              }}
            >
              {skill.name}
              <button
                onClick={() => setSelectedSkills((prev) => prev.filter((s) => s.id !== skill.id))}
                style={{
                  border: "none", background: "none", color: "#7dff2b",
                  cursor: "pointer", padding: "0 2px", lineHeight: 1, fontSize: "0.9rem", opacity: 0.8,
                }}
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>
      <button
        onClick={() => setShowPicker(true)}
        style={{
          width: "100%", background: "#1f1f1f", border: "1px solid #3b3b3b",
          borderRadius: 12, color: "#d6d6d6", fontSize: "0.88rem", fontWeight: 700,
          padding: "11px 0", cursor: "pointer",
        }}
      >
        {allSkills.length === 0 ? "読み込み中..." : "スキルを選択"}
      </button>
    </div>
  );
}
