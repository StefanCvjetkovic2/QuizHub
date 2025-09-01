import React from "react";

export default function QuizProgress({ percent = 0 }) {
  return (
    <div style={{ height: 8, background: "rgba(148,163,184,.25)", borderRadius: 999 }}>
      <div
        style={{
          width: `${Math.max(0, Math.min(100, percent))}%`,
          height: "100%",
          background: "var(--brand, #2563eb)",
          borderRadius: 999,
          transition: "width .25s ease",
        }}
      />
    </div>
  );
}
