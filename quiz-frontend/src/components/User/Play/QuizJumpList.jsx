import React from "react";

export default function QuizJumpList({
  questions = [],
  currentIndex = 0,
  answersByQid = {},
  onJump,
}) {
  return (
    <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
      {questions.map((qq, i) => {
        const a = answersByQid[qq.id] || {};
        const answered = ((a.selectedIds?.size ?? 0) > 0) || ((a.text ?? "").trim() !== "");
        return (
          <button
            key={qq.id}
            onClick={() => onJump(i)}
            className="btn btn--outline"
            style={{
              padding: "6px 10px",
              borderColor: i === currentIndex ? "var(--brand, #2563eb)" : answered ? "#22c55e" : "rgba(148,163,184,.35)",
              color: i === currentIndex ? "var(--brand, #2563eb)" : answered ? "#22c55e" : "inherit",
            }}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
