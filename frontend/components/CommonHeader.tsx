"use client";
import React from "react";

export const CommonHeader = ({ title, right, left, isPC }: {
  title: string;
  right?: React.ReactNode;
  left?: React.ReactNode;
  isPC?: boolean;
}) => (
  <header
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 20px 8px",
      marginBottom: 10,
    }}
  >
    {left || <div />}
    {title ? <h1 style={{ margin: 0, fontSize: isPC ? "2rem" : "1.75rem", fontWeight: 800 }}>{title}</h1> : <div />}
    {right || <div />}
  </header>
);
