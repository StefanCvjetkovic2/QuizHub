// src/components/User/Quizzes/QuizGrid.jsx
import React from "react";
import QuizCard from "./QuizCard";

export default function QuizGrid({ items = [], loading = false, onStart }) {
  if (loading) {
    return <div className="card">Učitavanje…</div>;
  }
  if (!items.length) {
    return <div className="card">Nema kvizova koji odgovaraju filterima.</div>;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 16,
      }}
    >
      {items.map(q => (
        <QuizCard
          key={q.id}
          quiz={q}
          onStart={() => onStart(q.id)}
        />
      ))}
    </div>
  );
}
