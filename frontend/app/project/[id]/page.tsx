"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { HOME_UPDATES } from "@/lib/mock-data";

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

  const project = HOME_UPDATES.find((item) => item.id === projectId);

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span
            style={{
              borderRadius: 999,
              background: project.statusBg,
              color: project.statusColor,
              border: `1px solid ${project.statusBg}`,
              padding: "4px 10px",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
            }}
          >
            {translateStatus(project.status)}
          </span>
          <span style={{ color: "#777777", fontSize: "0.78rem" }}>{project.time}</span>
        </div>

        <h1 style={{ margin: "14px 0 0", fontSize: "1.4rem", lineHeight: 1.35 }}>{project.title}</h1>

        <p style={{ margin: "16px 0 0", color: "#cccccc", lineHeight: 1.7, fontSize: "0.94rem" }}>
          {project.description}
        </p>

        <div
          style={{
            marginTop: 22,
            border: "1px solid #2a2a2a",
            borderRadius: 16,
            background: "#1a1a1a",
            padding: "14px 16px",
          }}
        >
          <p style={{ margin: 0, color: "#888888", fontSize: "0.74rem", letterSpacing: "0.04em" }}>担当</p>
          <p style={{ margin: "8px 0 0", fontSize: "0.95rem", fontWeight: 700 }}>{toDisplayName(project.author)}</p>

          <p style={{ margin: "14px 0 0", color: "#888888", fontSize: "0.74rem", letterSpacing: "0.04em" }}>カテゴリ</p>
          <p style={{ margin: "8px 0 0", fontSize: "0.95rem", fontWeight: 700 }}>{project.category}</p>
        </div>
      </section>
    </main>
  );
}
