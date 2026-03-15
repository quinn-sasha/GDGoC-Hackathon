"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { HOME_FEATURED, HOME_UPDATES } from "@/lib/mock-data";
import { buildProjectImage } from "@/lib/project-image";

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

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = Number(params.id);

  const updateProject = HOME_UPDATES.find((item) => item.id === projectId);
  const featuredProject = HOME_FEATURED.id === projectId
    ? {
        id: HOME_FEATURED.id,
        title: HOME_FEATURED.title,
        status: HOME_FEATURED.badge,
        statusColor: HOME_FEATURED.statusColor,
        statusBg: HOME_FEATURED.statusBg,
        time: HOME_FEATURED.time,
        description: HOME_FEATURED.description,
        author: HOME_FEATURED.hostName,
        category: HOME_FEATURED.category,
        avatarInitial: HOME_FEATURED.hostInitial,
      }
    : null;

  const project = updateProject ?? featuredProject;

  if (!project) {
    return (
      <main
        style={{
          minHeight: "100vh",
          maxWidth: 480,
          margin: "0 auto",
          background: "#111111",
          color: "#ffffff",
          fontFamily: "'Segoe UI', sans-serif",
          padding: "24px 20px 96px",
        }}
      >
        <h1 style={{ margin: "0 0 12px", fontSize: "1.5rem" }}>プロジェクトが見つかりません</h1>
        <p style={{ margin: 0, color: "#aaaaaa", lineHeight: 1.6 }}>
          指定されたプロジェクトは存在しないか、読み込みできませんでした。
        </p>
        <button
          type="button"
          onClick={() => router.push("/home")}
          style={{
            marginTop: 20,
            borderRadius: 10,
            border: "1px solid #333333",
            background: "#1a1a1a",
            color: "#ffffff",
            padding: "10px 14px",
            cursor: "pointer",
          }}
        >
          ホームに戻る
        </button>
      </main>
    );
  }

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
      </section>
    </main>
  );
}
