import React from "react";
import { Link } from "react-router-dom";

export default function ResultHeader({
  title,
  total,
  correctCount,
  percentage,
  onRepeat,
  exitHref = "/quizzes",
}) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
        <h2 style={{ fontWeight: 900, fontSize: 26, margin: 0 }}>{title}</h2>
        <div className="muted">— rezultat</div>
      </div>

      <div className="card" style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>
          Tačno: <span style={{ color: "#22c55e" }}>{correctCount}</span> / {total}
        </div>
        <div className="muted">|</div>
        <div style={{ fontSize: 18, fontWeight: 800 }}>
          Procenat:{" "}
          <span style={{ color: percentage >= 50 ? "#22c55e" : "#ef4444" }}>
            {Math.round(percentage)}%
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <Link className="btn btn-red" to={exitHref}>Izađi</Link>
        <button className="btn btn-blue" onClick={onRepeat}>Ponovi kviz</button>
      </div>
    </>
  );
}
