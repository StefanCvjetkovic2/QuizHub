import React from "react";
import QuizCard from "./QuizCard";

export default function QuizGrid({ items = [], loading = false, onStart }) {
  if (loading) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="card"
            style={{
              padding: 16,
              border: "1px solid rgba(148,163,184,.2)",
              borderRadius: 14,
              background: "rgba(30,41,59,.25)",
            }}
          >
            <div style={{ height: 18, width: "60%", background: "#fff1", borderRadius: 6, marginBottom: 8 }} />
            <div style={{ height: 12, width: "80%", background: "#fff1", borderRadius: 6, marginBottom: 6 }} />
            <div style={{ height: 12, width: "50%", background: "#fff1", borderRadius: 6, marginBottom: 12 }} />
            <button className="btn btn-blue" disabled>
              Pokreni kviz
            </button>
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return <div className="muted">Nema kvizova koji odgovaraju filterima.</div>;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 50,
      }}
    >
      {items.map((q) => (
        <QuizCard key={q.id} quiz={q} onStart={onStart} />
      ))}
    </div>
  );
}
