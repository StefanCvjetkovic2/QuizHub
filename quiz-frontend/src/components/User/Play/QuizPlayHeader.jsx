import React from "react";
import { fmtSeconds } from "@/utils/time";

export default function QuizPlayHeader({
  title,
  timeLimitSeconds = 0,
  remaining = null,
  onCancel,
  onFinish,
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
      }}
    >
      <h2 style={{ fontWeight: 900, fontSize: 26, margin: 0 }}>{title}</h2>

      <div style={{ justifySelf: "end" }}>
        {timeLimitSeconds > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="muted">Vrijeme:</div>
            <div
              style={{
                padding: "6px 10px",
                borderRadius: 10,
                background: remaining <= 10 ? "#ef444433" : "rgba(148,163,184,.2)",
                fontWeight: 800,
              }}
            >
              {fmtSeconds(remaining)}
            </div>
          </div>
        ) : (
          <div className="muted">Bez vremenskog ograničenja</div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, justifySelf: "end" }}>
        <button
          className="btn btn-amber"
          onClick={() => {
            if (confirm("Odustati od kviza? Nepošlati odgovore.")) onCancel?.();
          }}
        >
          Odustani
        </button>
        <button
          className="btn btn-blue"
          onClick={() => {
            if (confirm("Završiti kviz i poslati odgovore?")) onFinish?.();
          }}
        >
          Završi
        </button>
      </div>
    </div>
  );
}
