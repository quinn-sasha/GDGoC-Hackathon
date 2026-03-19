"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { buildProjectImage } from "@/lib/project-image";
import { fetchProjectDetail, submitProjectApplication, fetchProjectApplications, type ProjectApplication } from "@/lib/project-api";
import { fetchProfile } from "@/lib/profile-api";
import { BottomNav } from "@/components/BottomNav";
import { SideNav } from "@/components/SideNav";
import { isMobileUA } from "@/lib/device";

const STATUS_LABELS: Record<string, string> = {
  opening: "開始前",
  ongoing: "進行中",
  completed: "完了",
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  opening: { bg: "#1a1a2e", color: "#6699ff" },
  ongoing: { bg: "#0d2e22", color: "#4fc3a1" },
  completed: { bg: "#2a1a1a", color: "#cc9944" },
};

function translateStatus(status: string) {
  return STATUS_LABELS[status] ?? status;
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "今";
  if (min < 60) return `${min}分前`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}時間前`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}日前`;
  return new Date(isoString).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
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
  const projectId = params.id;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [roleOptions, setRoleOptions] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [availability, setAvailability] = useState(AVAILABILITY_OPTIONS[0]);
  const [message, setMessage] = useState("はじめまして。プロジェクト内容に興味があり、まずは話を聞いてみたいです。");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [applications, setApplications] = useState<ProjectApplication[]>([]);
  const [isPC, setIsPC] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const update = () => setIsPC(window.innerWidth >= 900 && !isMobileUA());
    update();
    setMounted(true);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // プロジェクト詳細取得
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setFetchError("");
    fetchProjectDetail(projectId)
      .then((data) => {
        if (!isMounted) return;
        setProject(data);
        const cat = data.categories?.[0]?.name ?? "";
        setRoleOptions(getRoleOptions(cat));
        setSelectedRole(getRoleOptions(cat)[0] ?? "");
        if (data.is_applied) {
          setIsAlreadyApplied(true);
          setIsSubmitted(true);
          if (data.chatroom_id) {
            setChatId(data.chatroom_id);
          }
        }
        if (data.is_owner) {
          fetchProjectApplications(projectId)
            .then((apps) => setApplications(apps))
            .catch(() => {});
        }
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

  // 自分のプロフィール取得
  useEffect(() => {
    fetchProfile()
      .then((data) => {
        setUserProfile(data);
        setMessage(`はじめまして。${data.username}です。プロジェクト内容に興味があり、まずは話を聞いてみたいです。`);
      })
      .catch(() => { /* ignore */ });
  }, []);

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

  if (fetchError || !project) {
    return (
      <>
        {NavBarElement}
        <div style={{ minHeight: "100vh", background: "#111111", color: "#ffffff", paddingLeft: isPC ? 100 : 0 }}>
          <main style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px" }}>
            <h1 style={{ margin: "0 0 12px", fontSize: "1.5rem" }}>プロジェクトが見つかりません</h1>
            <p style={{ margin: 0, color: "#aaaaaa", lineHeight: 1.6 }}>{fetchError || "指定されたプロジェクトは存在しないか、読み込みできませんでした。"}</p>
            <button type="button" onClick={() => router.push("/home")}
              style={{ marginTop: 20, borderRadius: 10, border: "1px solid #333333", background: "#1a1a1a", color: "#ffffff", padding: "10px 14px", cursor: "pointer" }}>
              ホームに戻る
            </button>
          </main>
        </div>
      </>
    );
  }

  const authorName = project.owner_name ?? "不明";
  const avatarInitial = authorName[0]?.toUpperCase() ?? "?";
  const category = project.categories?.[0]?.name ?? "";
  const statusStyle = STATUS_STYLE[project.progress_status] ?? { bg: "#1a1a1a", color: "#888888" };
  const timeStr = formatRelativeTime(project.updated_at);

  const isOwner = project.is_owner === true;

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
      const result = await submitProjectApplication({
        projectId: project.id,
        role: selectedRole,
        availability,
        message: message.trim(),
        portfolioUrl: portfolioUrl.trim(),
      });
      setIsSubmitted(true);
      if (result.chatroom_id) {
        setChatId(result.chatroom_id);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "応募の送信に失敗しました。";
      if (msg.includes("申請済み")) {
        setIsAlreadyApplied(true);
        setIsSubmitted(true);
        if (project.chatroom_id) {
          setChatId(project.chatroom_id);
        }
      } else {
        setSubmitError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 応募フォーム（PC・モバイル共通）
  const applicationForm = (
    <section
      style={{
        background: "#181818",
        border: "1px solid #262626",
        borderRadius: 22,
        padding: "18px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <p style={{ margin: 0, color: "#8d8d8d", fontSize: "0.75rem", letterSpacing: "0.08em" }}>APPLICATION</p>
          <h2 style={{ margin: "6px 0 0", fontSize: "1.05rem" }}>
            {isOwner ? "あなたのプロジェクト" : "このプロジェクトに応募する"}
          </h2>
        </div>
        <span style={{ borderRadius: 999, background: "#222222", color: "#d0d0d0", padding: "8px 12px", fontSize: "0.76rem", whiteSpace: "nowrap" }}>
          募集中
        </span>
      </div>

      {isOwner && (
        <div style={{ marginTop: 16 }}>
          {applications.length === 0 ? (
            <div
              style={{
                borderRadius: 16,
                background: "rgba(100, 120, 255, 0.08)",
                border: "1px solid rgba(100, 120, 255, 0.25)",
                padding: "14px",
              }}
            >
              <p style={{ margin: 0, color: "#a0b0ff", fontWeight: 700 }}>まだ応募はありません</p>
              <p style={{ margin: "8px 0 0", color: "#c7c7c7", fontSize: "0.86rem", lineHeight: 1.6 }}>
                応募が届いたらここに表示されます。
              </p>
            </div>
          ) : (
            <div>
              <p style={{ margin: "0 0 12px", color: "#8d8d8d", fontSize: "0.8rem" }}>
                応募者 {applications.length}名
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {applications.map((app) => (
                  <div
                    key={app.id}
                    style={{
                      borderRadius: 16,
                      border: "1px solid #2a2a2a",
                      background: "#111111",
                      padding: "14px",
                    }}
                  >
                    {/* 応募者ヘッダー */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                          background: "linear-gradient(135deg, #f2d5c8 0%, #c98f87 100%)",
                          display: "grid", placeItems: "center",
                          color: "#2b1f1c", fontWeight: 800, fontSize: "0.9rem",
                          overflow: "hidden",
                        }}
                      >
                        {app.applicant_icon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={app.applicant_icon} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          app.applicant_name?.[0]?.toUpperCase() ?? "?"
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>{app.applicant_name}</div>
                        <div style={{ color: "#8d8d8d", fontSize: "0.76rem" }}>
                          {new Date(app.created_at).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <span
                        style={{
                          marginLeft: "auto", flexShrink: 0,
                          borderRadius: 999, padding: "4px 10px", fontSize: "0.73rem", fontWeight: 700,
                          background: app.status === "accepted" ? "rgba(138,255,29,0.12)" : app.status === "rejected" ? "rgba(255,80,80,0.1)" : "rgba(255,200,50,0.1)",
                          color: app.status === "accepted" ? "#8aff1d" : app.status === "rejected" ? "#ff8080" : "#ffc832",
                          border: `1px solid ${app.status === "accepted" ? "rgba(138,255,29,0.3)" : app.status === "rejected" ? "rgba(255,80,80,0.3)" : "rgba(255,200,50,0.3)"}`,
                        }}
                      >
                        {app.status === "accepted" ? "承認" : app.status === "rejected" ? "却下" : "申請中"}
                      </span>
                    </div>
                    {/* 応募内容 */}
                    <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                      <span style={{ borderRadius: 999, background: "#1a1a2e", border: "1px solid #334", color: "#a0b0ff", padding: "4px 10px", fontSize: "0.76rem" }}>
                        役割: {app.role}
                      </span>
                      <span style={{ borderRadius: 999, background: "#1a2a1a", border: "1px solid #343", color: "#80c080", padding: "4px 10px", fontSize: "0.76rem" }}>
                        ペース: {app.availability}
                      </span>
                    </div>
                    <p style={{ margin: "10px 0 0", color: "#cccccc", fontSize: "0.86rem", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                      {app.message}
                    </p>
                    {app.portfolio_url && (
                      <a
                        href={app.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "inline-block", marginTop: 8, color: "#6699ff", fontSize: "0.8rem", wordBreak: "break-all" }}
                      >
                        {app.portfolio_url}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {userProfile && (
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
              width: 44, height: 44, borderRadius: "50%",
              background: "linear-gradient(135deg, #f2d5c8 0%, #c98f87 100%)",
              display: "grid", placeItems: "center",
              color: "#2b1f1c", fontWeight: 800, fontSize: "1.1rem",
              overflow: "hidden",
            }}
          >
            {userProfile.icon_image_path ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userProfile.icon_image_path} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              userProfile.username?.[0]?.toUpperCase() ?? "?"
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.94rem", fontWeight: 700 }}>{userProfile.username}</div>
            <div style={{ color: "#8d8d8d", fontSize: "0.8rem", marginTop: 4 }}>@{userProfile.username}</div>
            {userProfile.skills && userProfile.skills.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                {userProfile.skills.slice(0, 4).map((skill: { id: number; name: string }) => (
                  <span key={skill.id} style={{ borderRadius: 999, padding: "5px 9px", background: "#1f1f1f", border: "1px solid #2d2d2d", color: "#d8d8d8", fontSize: "0.74rem" }}>
                    {skill.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!isOwner && !isSubmitted && (
        <>
          <div style={{ marginTop: 18 }}>
            <label style={{ display: "block", color: "#8d8d8d", fontSize: "0.8rem", marginBottom: 10 }}>応募したい役割</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {roleOptions.map((role) => {
                const isActive = selectedRole === role;
                return (
                  <button key={role} type="button" onClick={() => setSelectedRole(role)}
                    style={{
                      borderRadius: 999,
                      border: isActive ? "1px solid #8aff1d" : "1px solid #343434",
                      background: isActive ? "rgba(138, 255, 29, 0.12)" : "#1a1a1a",
                      color: isActive ? "#dfffbd" : "#d0d0d0",
                      padding: "9px 12px", fontSize: "0.82rem", cursor: "pointer",
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
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {AVAILABILITY_OPTIONS.map((option) => {
                const isActive = availability === option;
                return (
                  <button key={option} type="button" onClick={() => setAvailability(option)}
                    style={{
                      borderRadius: 12,
                      border: isActive ? "1px solid #ffffff" : "1px solid #343434",
                      background: isActive ? "#ffffff" : "#1a1a1a",
                      color: isActive ? "#111111" : "#d0d0d0",
                      padding: "10px 12px", fontSize: "0.8rem", fontWeight: 700,
                      whiteSpace: "nowrap", cursor: "pointer",
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
                width: "100%", minHeight: 138, resize: "vertical", boxSizing: "border-box",
                borderRadius: 16, border: "1px solid #303030", background: "#101010",
                color: "#ffffff", padding: "14px", fontSize: "0.92rem", lineHeight: 1.6, outline: "none",
              }}
            />
            <div style={{ marginTop: 8, textAlign: "right", color: messageLength >= 20 ? "#7f7f7f" : "#ff8f8f", fontSize: "0.76rem" }}>
              {messageLength}/20文字以上
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <label style={{ display: "block", color: "#8d8d8d", fontSize: "0.8rem", marginBottom: 10 }}>ポートフォリオURL 任意</label>
            <input
              type="url" value={portfolioUrl}
              onChange={(event) => setPortfolioUrl(event.target.value)}
              placeholder="https://..."
              style={{
                width: "100%", boxSizing: "border-box", borderRadius: 14,
                border: "1px solid #303030", background: "#101010", color: "#ffffff",
                padding: "12px 14px", fontSize: "0.9rem", outline: "none",
              }}
            />
          </div>
        </>
      )}

      {submitError && (
        <p style={{ margin: "14px 0 0", color: "#ff8f8f", fontSize: "0.82rem", lineHeight: 1.6 }}>{submitError}</p>
      )}

      {isSubmitted && (
        <div
          style={{
            marginTop: 16, borderRadius: 16,
            background: "rgba(138, 255, 29, 0.08)",
            border: "1px solid rgba(138, 255, 29, 0.25)",
            padding: "14px",
          }}
        >
          <p style={{ margin: 0, color: "#dfffbd", fontWeight: 700 }}>
            {isAlreadyApplied ? "このプロジェクトにはすでに申請済みです" : "応募内容を送信しました"}
          </p>
          <p style={{ margin: "8px 0 0", color: "#c7c7c7", fontSize: "0.86rem", lineHeight: 1.6 }}>
            ホストからの返信をお待ちください。
          </p>
        </div>
      )}

      {/* PCレイアウト用ボタン（インライン表示） */}
      {isPC && !isOwner && (
        <div style={{ marginTop: 20 }}>
          {isSubmitted ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button type="button" onClick={() => router.push(chatId ? `/chat/${chatId}` : "/chat")}
                style={{ borderRadius: 14, border: "1px solid #353535", background: "#1a1a1a", color: "#ffffff", padding: "14px 12px", fontWeight: 700, cursor: "pointer" }}>
                チャットを開く
              </button>
              <button type="button" onClick={() => router.push("/home")}
                style={{ borderRadius: 14, border: "none", background: "#8aff1d", color: "#111111", padding: "14px 12px", fontWeight: 800, cursor: "pointer" }}>
                ホームへ戻る
              </button>
            </div>
          ) : (
            <button type="button" onClick={handleSubmitApplication} disabled={!canSubmit}
              style={{
                width: "100%", borderRadius: 16, border: "none", background: "#8aff1d",
                color: "#111111", padding: "16px 14px", fontSize: "0.98rem", fontWeight: 800,
                cursor: canSubmit ? "pointer" : "default", opacity: canSubmit ? 1 : 0.55,
              }}
            >
              {isSubmitting ? "応募を送信中..." : "この内容で応募する"}
            </button>
          )}
        </div>
      )}
    </section>
  );

  return (
    <>
      {NavBarElement}
      <div
        style={{
          minHeight: "100vh",
          background: "#111111",
          color: "#ffffff",
          fontFamily: "'Segoe UI', sans-serif",
          paddingLeft: isPC ? 100 : 0,
        }}
      >
        {/* ヘッダー */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: isPC ? "18px 32px 10px" : "18px 20px 10px",
            borderBottom: "1px solid #222222",
            maxWidth: isPC ? 1200 : undefined,
          }}
        >
          <button type="button" onClick={() => router.back()}
            style={{ border: "none", background: "none", color: "#ffffff", fontSize: "0.92rem", cursor: "pointer" }}>
            戻る
          </button>
          <span style={{ color: "#888888", fontSize: "0.8rem" }}>プロジェクト詳細</span>
          <Link href="/home" style={{ color: "#888888", fontSize: "0.8rem", textDecoration: "none" }}>
            ホーム
          </Link>
        </header>

        {isPC ? (
          /* PC: 2カラムレイアウト */
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "32px 32px 60px",
              display: "grid",
              gridTemplateColumns: "1fr 400px",
              gap: 40,
              alignItems: "start",
            }}
          >
            {/* 左: プロジェクト情報 */}
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "52px minmax(0, 1fr) auto", alignItems: "center", gap: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #f9a8a8 0%, #d47fa6 100%)", display: "grid", placeItems: "center", color: "#ffffff", fontSize: "1rem", fontWeight: 800, overflow: "hidden" }}>
                  {project.owner_icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={project.owner_icon} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    avatarInitial
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h1 style={{ margin: 0, fontSize: "1.5rem", lineHeight: 1.35 }}>{project.title}</h1>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8, color: "#9f9f9f", fontSize: "0.85rem" }}>
                    <span>ホスト: {authorName}</span>
                    {category && <span>カテゴリ: {category}</span>}
                  </div>
                </div>
                <span style={{ borderRadius: 999, background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.bg}`, padding: "6px 12px", fontSize: "0.76rem", fontWeight: 700, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                  {translateStatus(project.progress_status)}
                </span>
              </div>

              <div style={{ marginTop: 24 }}>
                {project.project_image_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.project_image_path}
                    alt={`${project.title} のイメージ`}
                    style={{ display: "block", width: "100%", height: 320, objectFit: "cover", borderRadius: 20, border: "1px solid #2a2a2a", background: "#1a1a1a" }}
                  />
                ) : (
                  <Image
                    src={buildProjectImage(project.title, category)}
                    alt={`${project.title} のイメージ`}
                    width={1200} height={720}
                    style={{ display: "block", width: "100%", height: 320, objectFit: "cover", borderRadius: 20, border: "1px solid #2a2a2a", background: "#1a1a1a" }}
                  />
                )}
              </div>

              {project.description && (
                <p style={{ margin: "24px 0 0", color: "#cccccc", lineHeight: 1.9, fontSize: "1rem" }}>
                  {project.description}
                </p>
              )}

              {project.technologies && project.technologies.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
                  {project.technologies.map((tech: { id: number; name: string }) => (
                    <span key={tech.id} style={{ background: "#152413", border: "1px solid #7dff2b", borderRadius: 99, padding: "5px 12px", fontSize: "0.82rem", color: "#7dff2b", fontWeight: 700 }}>
                      {tech.name}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20, color: "#888888", fontSize: "0.84rem" }}>
                <span>{authorName}</span>
                {category && <><span>・</span><span>{category}</span></>}
                <span>・</span>
                <span>{timeStr}</span>
              </div>
            </div>

            {/* 右: 応募フォーム（sticky） */}
            <div style={{ position: "sticky", top: 24 }}>
              {applicationForm}
            </div>
          </div>
        ) : (
          /* モバイル: シングルカラム */
          <main style={{ paddingBottom: 96 }}>
            <section style={{ padding: "22px 20px 0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "52px minmax(0, 1fr) auto", alignItems: "center", gap: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #f9a8a8 0%, #d47fa6 100%)", display: "grid", placeItems: "center", color: "#ffffff", fontSize: "1rem", fontWeight: 800, overflow: "hidden" }}>
                  {project.owner_icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={project.owner_icon} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    avatarInitial
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h1 style={{ margin: 0, fontSize: "1.25rem", lineHeight: 1.35 }}>{project.title}</h1>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8, color: "#9f9f9f", fontSize: "0.8rem" }}>
                    <span>ホスト: {authorName}</span>
                    {category && <span>カテゴリ: {category}</span>}
                  </div>
                </div>
                <span style={{ borderRadius: 999, background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.bg}`, padding: "5px 10px", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                  {translateStatus(project.progress_status)}
                </span>
              </div>

              <div style={{ marginTop: 18 }}>
                {project.project_image_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.project_image_path}
                    alt={`${project.title} のイメージ`}
                    style={{ display: "block", width: "100%", height: 220, objectFit: "cover", borderRadius: 20, border: "1px solid #2a2a2a", background: "#1a1a1a" }}
                  />
                ) : (
                  <Image
                    src={buildProjectImage(project.title, category)}
                    alt={`${project.title} のイメージ`}
                    width={1200} height={720}
                    style={{ display: "block", width: "100%", height: 220, objectFit: "cover", borderRadius: 20, border: "1px solid #2a2a2a", background: "#1a1a1a" }}
                  />
                )}
              </div>

              {project.description && (
                <p style={{ margin: "18px 0 0", color: "#cccccc", lineHeight: 1.8, fontSize: "0.96rem" }}>
                  {project.description}
                </p>
              )}

              {project.technologies && project.technologies.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                  {project.technologies.map((tech: { id: number; name: string }) => (
                    <span key={tech.id} style={{ background: "#152413", border: "1px solid #7dff2b", borderRadius: 99, padding: "4px 10px", fontSize: "0.78rem", color: "#7dff2b", fontWeight: 700 }}>
                      {tech.name}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18, color: "#888888", fontSize: "0.82rem" }}>
                <span>{authorName}</span>
                {category && <><span>・</span><span>{category}</span></>}
                <span>・</span>
                <span>{timeStr}</span>
              </div>

              <div style={{ marginTop: 28, marginBottom: 0 }}>
                {applicationForm}
              </div>
            </section>
          </main>
        )}
      </div>

      {/* モバイル用固定ボタン */}
      {!isPC && mounted && !isOwner && (
        <div
          style={{
            position: "fixed", left: "50%", bottom: 0,
            transform: "translateX(-50%)",
            width: "100%", maxWidth: 480, boxSizing: "border-box",
            padding: "14px 20px 18px",
            background: "linear-gradient(180deg, rgba(17,17,17,0) 0%, rgba(17,17,17,0.92) 24%, #111111 100%)",
            backdropFilter: "blur(10px)",
            zIndex: 100,
          }}
        >
          {isSubmitted ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button type="button" onClick={() => router.push(chatId ? `/chat/${chatId}` : "/chat")}
                style={{ borderRadius: 14, border: "1px solid #353535", background: "#1a1a1a", color: "#ffffff", padding: "14px 12px", fontWeight: 700, cursor: "pointer" }}>
                チャットを開く
              </button>
              <button type="button" onClick={() => router.push("/home")}
                style={{ borderRadius: 14, border: "none", background: "#8aff1d", color: "#111111", padding: "14px 12px", fontWeight: 800, cursor: "pointer" }}>
                ホームへ戻る
              </button>
            </div>
          ) : (
            <button type="button" onClick={handleSubmitApplication} disabled={!canSubmit}
              style={{
                width: "100%", borderRadius: 16, border: "none", background: "#8aff1d",
                color: "#111111", padding: "16px 14px", fontSize: "0.98rem", fontWeight: 800,
                cursor: canSubmit ? "pointer" : "default", opacity: canSubmit ? 1 : 0.55,
                boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
              }}
            >
              {isSubmitting ? "応募を送信中..." : "この内容で応募する"}
            </button>
          )}
        </div>
      )}
    </>
  );
}
