"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

import { PROFILE_SKILLS, PROFILE_SUMMARY } from "@/lib/mock-data";
import { createApplicationChatThread } from "@/lib/chat-storage";
import { buildProjectImage } from "@/lib/project-image";
import { fetchProjectDetail, submitProjectApplication } from "@/lib/project-api";

const STATUS_LABELS: Record<string, string> = {
  ONGOING: "進行中",
  FEATURED: "注目",
  "IN REVIEW": "レビュー中",
  COMPLETED: "完了",
  DRAFT: "下書き",
};

function translateStatus(status: string) {
  return STATUS_LABELS[status] ?? status;
}

function toDisplayName(author: string) {
  return author
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0] + word.slice(1).toLowerCase())
    .join(" ");
}

const ROLE_OPTIONS: Record<string, string[]> = {
  技術: ["フロントエンド", "バックエンド", "モバイル", "AI/データ"],
  デザイン: ["UIデザイン", "UX設計", "ブランディング", "イラスト"],
  アート: ["ビジュアル制作", "アートディレクション", "3D/映像", "企画"],
  音楽: ["作曲", "サウンドデザイン", "レコーディング", "PR"],
  映像: ["映像編集", "撮影", "モーショングラフィック", "ディレクション"],
};

const AVAILABILITY_OPTIONS = ["平日夜", "土日中心", "毎日少しずつ"];

function getRoleOptions(category: string) {
  return ROLE_OPTIONS[category] ?? ["企画", "開発", "デザイン", "リサーチ"];
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = Number(params.id);

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [roleOptions, setRoleOptions] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [availability, setAvailability] = useState(AVAILABILITY_OPTIONS[0]);
  const [message, setMessage] = useState(`はじめまして。${PROFILE_SUMMARY.name}です。プロジェクト内容に興味があり、まずは話を聞いてみたいです。`);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdChatId, setCreatedChatId] = useState<number | null>(null);

  // プロジェクト詳細取得
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setFetchError("");
    fetchProjectDetail(projectId)
      .then((data) => {
        if (!isMounted) return;
        setProject(data);
        setRoleOptions(getRoleOptions(data.category ?? ""));
        setSelectedRole(getRoleOptions(data.category ?? "")[0] ?? "");
      })
      .catch(() => {
        if (!isMounted) return;
        setFetchError("プロジェクト詳細の取得に失敗しました");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => { isMounted = false; };
  }, [projectId]);

  if (loading) {
    return <main style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", background: "#111111", color: "#ffffff", fontFamily: "'Segoe UI', sans-serif", padding: "24px 20px 96px" }}>読み込み中...</main>;
  }
  if (fetchError || !project) {
    return (
      <main style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", background: "#111111", color: "#ffffff", fontFamily: "'Segoe UI', sans-serif", padding: "24px 20px 96px" }}>
        <h1 style={{ margin: "0 0 12px", fontSize: "1.5rem" }}>プロジェクトが見つかりません</h1>
        <p style={{ margin: 0, color: "#aaaaaa", lineHeight: 1.6 }}>{fetchError || "指定されたプロジェクトは存在しないか、読み込みできませんでした。"}</p>
        <button type="button" onClick={() => router.push("/home")}
          style={{ marginTop: 20, borderRadius: 10, border: "1px solid #333333", background: "#1a1a1a", color: "#ffffff", padding: "10px 14px", cursor: "pointer" }}>
          ホームに戻る
        </button>
      </main>
    );
  }

  const messageLength = message.trim().length;
  const canSubmit = selectedRole !== "" && availability !== "" && messageLength >= 20 && !isSubmitting;

  const handleSubmitApplication = async () => {
    setSubmitError("");
    if (!canSubmit) {
      setSubmitError("応募する役割と参加ペースを選び、20文字以上のメッセージを入力してください。");
      return;
    }
    setIsSubmitting(true);
    try {
      await submitProjectApplication({
        projectId: project.id,
        role: selectedRole,
        availability,
        message: message.trim(),
        portfolioUrl: portfolioUrl.trim(),
      });
      const createdChatThread = createApplicationChatThread({
        projectId: project.id,
        projectTitle: project.title,
        hostName: toDisplayName(project.author),
        hostInitial: project.avatarInitial,
        role: selectedRole,
        openingMessage: message.trim(),
      });
      setCreatedChatId(createdChatThread.id);
      setIsSubmitted(true);
    } catch {
      setSubmitError("応募内容の送信に失敗しました。時間をおいて再度お試しください。");
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
        paddingBottom: 96,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 20px 10px",
          borderBottom: "1px solid #222222",
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            border: "none",
            background: "none",
            color: "#ffffff",
            fontSize: "0.92rem",
            cursor: "pointer",
          }}
        >
          戻る
        </button>
        <span style={{ color: "#888888", fontSize: "0.8rem" }}>プロジェクト詳細</span>
        <Link href="/home" style={{ color: "#888888", fontSize: "0.8rem", textDecoration: "none" }}>
          ホーム
        </Link>
      </header>

      <section style={{ padding: "22px 20px 0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "52px minmax(0, 1fr) auto",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f9a8a8 0%, #d47fa6 100%)",
              display: "grid",
              placeItems: "center",
              color: "#ffffff",
              fontSize: "1rem",
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {project.avatarInitial}
          </div>

          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: "1.25rem", lineHeight: 1.35 }}>{project.title}</h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8, color: "#9f9f9f", fontSize: "0.8rem" }}>
              <span>ホスト: {toDisplayName(project.author)}</span>
              <span>カテゴリ: {project.category}</span>
            </div>
          </div>

          <span
            style={{
              borderRadius: 999,
              background: project.statusBg,
              color: project.statusColor,
              border: `1px solid ${project.statusBg}`,
              padding: "5px 10px",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              whiteSpace: "nowrap",
            }}
          >
            {translateStatus(project.status)}
          </span>
        </div>

        <div style={{ marginTop: 18 }}>
          <Image
            src={buildProjectImage(project.title, project.category)}
            alt={`${project.title} のイメージ`}
            width={1200}
            height={720}
            style={{
              display: "block",
              width: "100%",
              height: 220,
              objectFit: "cover",
              borderRadius: 20,
              border: "1px solid #2a2a2a",
              background: "#1a1a1a",
            }}
          />
        </div>

        <p style={{ margin: "18px 0 0", color: "#cccccc", lineHeight: 1.8, fontSize: "0.96rem" }}>
          {project.description}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18, color: "#888888", fontSize: "0.82rem" }}>
          <span>{toDisplayName(project.author)}</span>
          <span>・</span>
          <span>{project.category}</span>
          <span>・</span>
          <span>{project.time}</span>
        </div>

        <section
          style={{
            marginTop: 28,
            background: "#181818",
            border: "1px solid #262626",
            borderRadius: 22,
            padding: "18px 16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <p style={{ margin: 0, color: "#8d8d8d", fontSize: "0.75rem", letterSpacing: "0.08em" }}>APPLICATION</p>
              <h2 style={{ margin: "6px 0 0", fontSize: "1.05rem" }}>このプロジェクトに応募する</h2>
            </div>
            <span
              style={{
                borderRadius: 999,
                background: "#222222",
                color: "#d0d0d0",
                padding: "8px 12px",
                fontSize: "0.76rem",
                whiteSpace: "nowrap",
              }}
            >
              募集中
            </span>
          </div>

          <div
            style={{
              marginTop: 16,
              display: "grid",
              gridTemplateColumns: "44px minmax(0, 1fr)",
              gap: 12,
              alignItems: "center",
              padding: "12px",
              background: "#111111",
              borderRadius: 16,
              border: "1px solid #242424",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f9a8a8 0%, #d47fa6 100%)",
                display: "grid",
                placeItems: "center",
                color: "#ffffff",
                fontWeight: 800,
              }}
            >
              {PROFILE_SUMMARY.avatarInitial}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "0.94rem", fontWeight: 700 }}>{PROFILE_SUMMARY.name}</div>
              <div style={{ color: "#8d8d8d", fontSize: "0.8rem", marginTop: 4 }}>{PROFILE_SUMMARY.handle}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                {PROFILE_SKILLS.filter((skill) => skill !== "+").slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    style={{
                      borderRadius: 999,
                      padding: "5px 9px",
                      background: "#1f1f1f",
                      border: "1px solid #2d2d2d",
                      color: "#d8d8d8",
                      fontSize: "0.74rem",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <label style={{ display: "block", color: "#8d8d8d", fontSize: "0.8rem", marginBottom: 10 }}>応募したい役割</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {roleOptions.map((role) => {
                const isActive = selectedRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    style={{
                      borderRadius: 999,
                      border: isActive ? "1px solid #8aff1d" : "1px solid #343434",
                      background: isActive ? "rgba(138, 255, 29, 0.12)" : "#1a1a1a",
                      color: isActive ? "#dfffbd" : "#d0d0d0",
                      padding: "9px 12px",
                      fontSize: "0.82rem",
                      cursor: "pointer",
                    }}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <label style={{ display: "block", color: "#8d8d8d", fontSize: "0.8rem", marginBottom: 10 }}>参加できるペース</label>
            <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
              {AVAILABILITY_OPTIONS.map((option) => {
                const isActive = availability === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAvailability(option)}
                    style={{
                      borderRadius: 12,
                      border: isActive ? "1px solid #ffffff" : "1px solid #343434",
                      background: isActive ? "#ffffff" : "#1a1a1a",
                      color: isActive ? "#111111" : "#d0d0d0",
                      padding: "10px 12px",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <label style={{ display: "block", color: "#8d8d8d", fontSize: "0.8rem", marginBottom: 10 }}>メッセージ</label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="どの役割でどう関わりたいかを書いてください"
              style={{
                width: "100%",
                minHeight: 138,
                resize: "vertical",
                boxSizing: "border-box",
                borderRadius: 16,
                border: "1px solid #303030",
                background: "#101010",
                color: "#ffffff",
                padding: "14px 14px",
                fontSize: "0.92rem",
                lineHeight: 1.6,
                outline: "none",
              }}
            />
            <div style={{ marginTop: 8, textAlign: "right", color: messageLength >= 20 ? "#7f7f7f" : "#ff8f8f", fontSize: "0.76rem" }}>
              {messageLength}/20文字以上
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <label style={{ display: "block", color: "#8d8d8d", fontSize: "0.8rem", marginBottom: 10 }}>ポートフォリオURL 任意</label>
            <input
              type="url"
              value={portfolioUrl}
              onChange={(event) => setPortfolioUrl(event.target.value)}
              placeholder="https://..."
              style={{
                width: "100%",
                boxSizing: "border-box",
                borderRadius: 14,
                border: "1px solid #303030",
                background: "#101010",
                color: "#ffffff",
                padding: "12px 14px",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
          </div>

          {submitError ? (
            <p style={{ margin: "14px 0 0", color: "#ff8f8f", fontSize: "0.82rem", lineHeight: 1.6 }}>{submitError}</p>
          ) : null}

          {isSubmitted ? (
            <div
              style={{
                marginTop: 16,
                borderRadius: 16,
                background: "rgba(138, 255, 29, 0.08)",
                border: "1px solid rgba(138, 255, 29, 0.25)",
                padding: "14px 14px",
              }}
            >
              <p style={{ margin: 0, color: "#dfffbd", fontWeight: 700 }}>応募内容を送信しました</p>
              <p style={{ margin: "8px 0 0", color: "#c7c7c7", fontSize: "0.86rem", lineHeight: 1.6 }}>
                応募内容に対応するチャットを自動生成しました。このままホストとのやり取りを始められます。
              </p>
            </div>
          ) : null}
        </section>
      </section>

      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: 0,
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 480,
          boxSizing: "border-box",
          padding: "14px 20px 18px",
          background: "linear-gradient(180deg, rgba(17, 17, 17, 0) 0%, rgba(17, 17, 17, 0.92) 24%, #111111 100%)",
          backdropFilter: "blur(10px)",
        }}
      >
        {isSubmitted ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button
              type="button"
              onClick={() => router.push(createdChatId ? `/chat/${createdChatId}` : "/chat")}
              style={{
                borderRadius: 14,
                border: "1px solid #353535",
                background: "#1a1a1a",
                color: "#ffffff",
                padding: "14px 12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              チャットを開く
            </button>
            <button
              type="button"
              onClick={() => router.push("/home")}
              style={{
                borderRadius: 14,
                border: "none",
                background: "#8aff1d",
                color: "#111111",
                padding: "14px 12px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              ホームへ戻る
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSubmitApplication}
            disabled={!canSubmit}
            style={{
              width: "100%",
              borderRadius: 16,
              border: "none",
              background: "#8aff1d",
              color: "#111111",
              padding: "16px 14px",
              fontSize: "0.98rem",
              fontWeight: 800,
              cursor: canSubmit ? "pointer" : "default",
              opacity: canSubmit ? 1 : 0.55,
              boxShadow: "0 12px 24px rgba(0, 0, 0, 0.35)",
            }}
          >
            {isSubmitting ? "応募を送信中..." : `この内容で応募する`}
          </button>
        )}
      </div>
    </main>
  );
}
