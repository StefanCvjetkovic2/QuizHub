import React from "react";

function diffLabel(d) {
  if (d === 1) return "lako";
  if (d === 2) return "srednje";
  if (d === 3) return "teško";
  return "—";
}

export default function QuizCard({ quiz, onStart }) {
  const {
    id,
    title,
    description,
    categoryName,
    difficulty,
    timeLimitSeconds,
    questionCount,
  } = quiz;

  return (
    <div
      className="card"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 16,
        border: "1px solid rgba(148,163,184,.25)",
        borderRadius: 14,
        background: "rgba(30,41,59,.30)",
        transition: "box-shadow .2s ease, transform .2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,.25)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
          {title || "Bez naziva"}
        </div>

        {categoryName && (
          <div style={{ opacity: 0.8, marginBottom: 6 }}>
            🏷️ {categoryName}
          </div>
        )}

        <div style={{ opacity: 0.9, marginBottom: 12, lineHeight: 1.35, maxHeight: 60, overflow: "hidden" }}>
          {description || "Bez opisa."}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <span className="pill">{questionCount ?? 0} pitanja</span>
          <span className="pill">težina: {diffLabel(difficulty)}</span>
          {timeLimitSeconds ? <span className="pill">{timeLimitSeconds}s</span> : null}
        </div>
      </div>

      <button className="btn btn-blue" onClick={() => onStart?.(id)} style={{ width: "100%" }}>
        Pokreni kviz
      </button>
    </div>
  );
}
