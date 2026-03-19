"use client";
import React from "react";

export const CommonSearchBar = ({ value, onChange, onClear, placeholder, onSubmit }: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  placeholder?: string;
  onSubmit?: () => void;
}) => (
  <section style={{ marginBottom: 12 }}>
    <div
      style={{
        margin: "0 20px",
        height: 48,
        borderRadius: 24,
        background: "#1e1e1e",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 14px",
        color: "#888888",
      }}
    >
      <svg onClick={() => onSubmit?.()} style={{ cursor: onSubmit ? "pointer" : "default" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        value={value}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit?.();
        }}
        placeholder={placeholder || "検索"}
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          color: "#ffffff",
          outline: "none",
          fontSize: "0.9rem",
        }}
      />
      {value && onClear ? (
        <button
          type="button"
          onClick={onClear}
          style={{
            border: "none",
            background: "#2a2a2a",
            color: "#d0d0d0",
            width: 24,
            height: 24,
            borderRadius: "50%",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      ) : null}
    </div>
  </section>
);
