// src/components/User/Quizzes/QuizCard.jsx
import React from "react";

function diffLabel(d) {
  if (d === 1) return "lako";
  if (d === 2) return "srednje";
  if (d === 3) return "teško";
  return "—";
}

export default function QuizCard({ quiz, onStart }) {
  const {
    title,
    description,
    categoryName,
    difficulty,
    timeLimitSeconds,
    questionCount,
  } = quiz;

  return (
    <div className="card" style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
          {title}
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

      
<button
  className="btn btn-blue"
  onClick={() => nav(`/quizzes/${item.id}`)}   // <— IDE NA PLAY, NE NA /result
>
  Pokreni kviz
</button>

    </div>
  );
}
