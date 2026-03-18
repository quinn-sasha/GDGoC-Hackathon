"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { HOME_CATEGORIES } from "@/lib/mock-data";
import { createProject } from "@/lib/project-api";

function isAllCategory(category: string) {
  return category === "All" || category === "すべて";
}

const STATUS_OPTIONS = [
  { value: "ONGOING", label: "進行中" },
  { value: "FEATURED", label: "注目" },
  { value: "IN REVIEW", label: "レビュー中" },
  { value: "DRAFT", label: "下書き" },
];

const PRESET_SKILLS = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "Django",
  "Figma",
  "Flutter",
  "Firebase",
  "AWS",
  "UI/UX",
  "動画編集",
  "データ分析",
];

const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 400;

export default function ProjectRecruitPage() {
  const router = useRouter();
  const categoryOptions = useMemo(() => {
    const options = HOME_CATEGORIES.filter((category) => !isAllCategory(category));
    return options.length ? options : ["技術"];
  }, []);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [showSkillPicker, setShowSkillPicker] = useState(false);
  const [category, setCategory] = useState(categoryOptions[0] ?? "技術");
  const [status, setStatus] = useState(STATUS_OPTIONS[0]?.value ?? "ONGOING");
  const [projectImage, setProjectImage] = useState<string | null>(null);
  const [projectImageName, setProjectImageName] = useState("");
  const [imageError, setImageError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const canSubmit =
    trimmedTitle.length >= 3 &&
    trimmedDescription.length >= 10 &&
    skills.length > 0 &&
    !imageError &&
    !isSubmitting;

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setImageError("画像ファイルを選択してください。");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageError(`画像サイズは${MAX_IMAGE_SIZE_MB}MB以下にしてください。`);
      return;
    }

    setImageError("");

    const reader = new FileReader();
    reader.onload = () => {
      setProjectImage(typeof reader.result === "string" ? reader.result : null);
      setProjectImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setProjectImage(null);
    setProjectImageName("");
    setImageError("");
  };

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((item) => item !== skill) : [...prev, skill],
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!canSubmit) {
      setFormError("必須項目を入力し、スキルを1つ以上選択してください。");
      return;
    }

    setIsSubmitting(true);

    try {
      await createProject({
        title: trimmedTitle,
        description: trimmedDescription,
        technologies: skills.map((s) => s.toLowerCase()),
        progress_status: status.toLowerCase(),
      });
      router.push("/home");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "作成に失敗しました。もう一度お試しください。",
      );
    } finally {
      setIsSubmitting(false);
    }
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
        padding: "18px 18px 26px",
      }}
    >
      <header style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
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
        <label style={{ fontSize: "0.8rem", color: "#8b8b8b" }}>プロジェクト画像</label>
        <div
          style={{
            width: "100%",
            height: 170,
            borderRadius: 14,
            border: "1px dashed #3a3a3a",
            background: "#151515",
            overflow: "hidden",
            display: "grid",
            placeItems: "center",
            color: "#7d7d7d",
            fontSize: "0.85rem",
          }}
        >
          {projectImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={projectImage} alt="プロジェクト画像プレビュー" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span>画像を選択するとここに表示されます</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 10,
              border: "1px solid #3b3b3b",
              background: "#1f1f1f",
              color: "#e5e5e5",
              fontSize: "0.85rem",
              fontWeight: 700,
              padding: "10px 14px",
              cursor: "pointer",
            }}
          >
            画像を選択
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
          </label>
          {projectImage ? (
            <button
              type="button"
              onClick={clearImage}
              style={{
                border: "none",
                background: "none",
                color: "#9ca3af",
                fontSize: "0.8rem",
                cursor: "pointer",
                padding: "0 2px",
              }}
            >
              画像を削除
            </button>
          ) : null}
        </div>
        {projectImageName ? (
          <p style={{ margin: "-4px 0 2px", color: "#7d7d7d", fontSize: "0.76rem" }}>
            {projectImageName}
          </p>
        ) : null}
        {imageError ? (
          <p style={{ margin: "-4px 0 2px", color: "#ff7d7d", fontSize: "0.78rem" }}>{imageError}</p>
        ) : null}

        <label style={{ fontSize: "0.8rem", color: "#8b8b8b" }}>タイトル</label>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={TITLE_MAX}
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
                  padding: "7px 12px",
                  fontWeight: 700,
                }}
              >
                {skill}
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#8b8b8b", marginBottom: 8 }}>カテゴリ</label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
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
              {categoryOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
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
        </div>
      </section>

      {formError ? (
        <p style={{ margin: "12px 0 0", color: "#ff7d7d", fontSize: "0.83rem" }}>{formError}</p>
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
          disabled={!canSubmit}
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
          onClick={() => setShowSkillPicker(false)}
        >
          <section
            style={{
              width: "100%",
              maxWidth: 480,
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
                onClick={() => setShowSkillPicker(false)}
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
                maxHeight: "52vh",
                overflowY: "auto",
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 8,
                paddingRight: 2,
              }}
            >
              {PRESET_SKILLS.map((skill) => {
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
              onClick={() => setShowSkillPicker(false)}
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
  );
}
