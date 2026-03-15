"use client";

import { useRouter } from "next/navigation";
import {
  PROFILE_PROJECTS as PROJECTS,
  PROFILE_SKILLS as SKILLS,
  PROFILE_STATS as STATS,
  PROFILE_SUMMARY,
} from "@/lib/mock-data";

export default function ProfilePage() {
  const router = useRouter();

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
          padding: "16px 20px 8px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800 }}>Profile</h1>
        <button
          aria-label="Settings"
          style={{ background: "none", border: "none", color: "#888888", cursor: "pointer", padding: 4 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </header>

      <section style={{ padding: "8px 20px 0", textAlign: "center" }}>
        <div
          style={{
            width: 156,
            height: 156,
            margin: "0 auto",
            borderRadius: "50%",
            border: "6px solid #1f4f26",
            background: "#1a1a1a",
            position: "relative",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 10px 28px rgba(0, 0, 0, 0.28)",
          }}
        >
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f2d5c8 0%, #c98f87 100%)",
              display: "grid",
              placeItems: "center",
              fontSize: "2.4rem",
              fontWeight: 800,
              color: "#2b1f1c",
            }}
          >
            {PROFILE_SUMMARY.avatarInitial}
          </div>
          <button
            aria-label="Edit profile"
            style={{
              position: "absolute",
              right: 2,
              bottom: 12,
              width: 42,
              height: 42,
              borderRadius: "50%",
              border: "2px solid #111111",
              background: "#8aff1d",
              color: "#111111",
              display: "grid",
              placeItems: "center",
              fontSize: "1rem",
              fontWeight: 800,
              boxShadow: "0 8px 18px rgba(0, 0, 0, 0.25)",
              cursor: "pointer",
            }}
          >
            &lt;&gt;
          </button>
        </div>

        <h2 style={{ margin: "22px 0 0", fontSize: "1.8rem", fontWeight: 800 }}>{PROFILE_SUMMARY.name}</h2>
        <p style={{ margin: "8px 0 0", color: "#7dff2b", fontSize: "0.95rem", fontWeight: 700 }}>{PROFILE_SUMMARY.handle}</p>
        <p style={{ margin: "16px auto 0", maxWidth: 320, color: "#aaaaaa", fontSize: "0.85rem", lineHeight: 1.6 }}>
          {PROFILE_SUMMARY.bio}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 26 }}>
          {STATS.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: 18,
                padding: "14px 8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>{stat.value}</div>
              <div style={{ marginTop: 5, color: "#888888", fontSize: "0.78rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "28px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>Skills</h3>
          <button style={{ background: "none", border: "none", color: "#7dff2b", fontSize: "0.95rem", cursor: "pointer" }}>
            Edit
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {SKILLS.map((skill) => {
            const isAdd = skill === "+";
            const isEmphasis = ["SwiftUI", "Node.js", "Firebase"].includes(skill);
            return (
              <button
                key={skill}
                style={{
                  background: isAdd ? "transparent" : isEmphasis ? "#152413" : "#1a1a1a",
                  border: isAdd ? "1px dashed #666666" : `1px solid ${isEmphasis ? "#295b22" : "#333333"}`,
                  color: isAdd ? "#888888" : isEmphasis ? "#7dff2b" : "#d0d0d0",
                  borderRadius: 999,
                  padding: isAdd ? "9px 15px" : "9px 16px",
                  fontSize: "0.84rem",
                  cursor: "pointer",
                }}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </section>

      <section style={{ padding: "34px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>Current Projects</h3>
          <button style={{ background: "none", border: "none", color: "#888888", fontSize: "0.95rem", cursor: "pointer" }}>
            See All
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {PROJECTS.map((project) => (
            <article
              key={project.name}
              style={{
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: 20,
                padding: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 14,
                      background: project.accent,
                      display: "grid",
                      placeItems: "center",
                      fontSize: "1.5rem",
                      fontWeight: 800,
                    }}
                  >
                    {project.initial}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>{project.name}</h4>
                    <p style={{ margin: "6px 0 0", color: "#999999", fontSize: "0.84rem" }}>{project.meta}</p>
                  </div>
                </div>
                <span
                  style={{
                    flexShrink: 0,
                    borderRadius: 999,
                    border: `1px solid ${project.badge === "LEAD DEV" ? "#295b22" : "#2d3f7a"}`,
                    background: project.badge === "LEAD DEV" ? "#152413" : "#141b31",
                    color: project.badge === "LEAD DEV" ? "#7dff2b" : "#7aa4ff",
                    padding: "5px 10px",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                  }}
                >
                  {project.badge}
                </span>
              </div>

              <p style={{ margin: "16px 0 0", color: "#d4d4d4", fontSize: "0.92rem", lineHeight: 1.5 }}>
                {project.description}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, color: "#888888", fontSize: "0.84rem" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#f3d4c7", border: "2px solid #1a1a1a" }} />
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#3a3224", border: "2px solid #1a1a1a", marginLeft: -6 }} />
                </div>
                <span>{project.members}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <button
        aria-label="Add profile item"
        style={{
          position: "fixed",
          right: "max(22px, calc(50vw - 218px))",
          bottom: 84,
          width: 72,
          height: 72,
          borderRadius: "50%",
          border: "none",
          color: "#111111",
          background: "#ffffff",
          boxShadow: "0 12px 26px rgba(0, 0, 0, 0.35)",
          fontSize: "2.4rem",
          lineHeight: 1,
          cursor: "pointer",
          zIndex: 120,
        }}
      >
        +
      </button>

      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 480,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          background: "#1a1a1a",
          borderTop: "1px solid #2a2a2a",
          padding: "10px 0 14px",
          zIndex: 100,
        }}
      >
        <button
          style={{
            background: "none",
            border: "none",
            color: "#666666",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            fontSize: "0.72rem",
            padding: "0 20px",
          }}
          onClick={() => router.push("/home")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
          </svg>
          <span>Home</span>
        </button>
        <button
          style={{
            background: "none",
            border: "none",
            color: "#666666",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            fontSize: "0.72rem",
            padding: "0 20px",
          }}
          onClick={() => router.push("/chat")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Chat</span>
        </button>
        <button
          style={{
            background: "none",
            border: "none",
            color: "#ffffff",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            fontSize: "0.72rem",
            padding: "0 20px",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Profile</span>
        </button>
      </nav>
    </main>
  );
}
