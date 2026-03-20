"use client";
import React from "react";

export const CommonCategoryTabs = ({
  categories,
  active,
  onSelect,
  style,
}: {
  categories: string[];
  active: string;
  onSelect: (cat: string) => void;
  style?: React.CSSProperties;
}) => (
  <section style={{ display: "flex", gap: 8, padding: "0 20px 12px", overflowX: "auto", ...style }}>
    {categories.map((cat) => {
      const isActive = active === cat;
      return (
        <button
          key={cat}
          type="button"
          onClick={() => onSelect(cat)}
          style={{
            borderRadius: 999,
            border: isActive ? "1px solid #ffffff" : "1px solid #343434",
            background: isActive ? "#ffffff" : "#1a1a1a",
            color: isActive ? "#111111" : "#d0d0d0",
            fontSize: "0.8rem",
            fontWeight: 700,
            padding: "8px 12px",
            whiteSpace: "nowrap",
            cursor: "pointer",
          }}
        >
          {cat}
        </button>
      );
    })}
  </section>
);
