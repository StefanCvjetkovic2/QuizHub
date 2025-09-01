import React from "react";

export default function ResultQuestionCard({ row }) {
  const { q, type, correct, correctIds, userIds } = row;

  return (
    <div
      className="card"
      style={{
        border: `1px solid ${correct ? "rgba(34,197,94,.35)" : "rgba(239,68,68,.35)"}`,
        background: "rgba(30,41,59,.30)",
        borderRadius: 16,
        padding: 16,
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
        {/* Lijevo: pitanje + opcije ili tekst */}
        <div>
          <div className="muted" style={{ marginBottom: 4 }}>Pitanje {row.index}</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>{q.text}</div>

          {type !== "text" ? (
            <div style={{ display: "grid", gap: 8 }}>
              {(q.answers || []).map(a => {
                const checked = userIds?.has(String(a.id)) ?? false;
                const isCorrect = correctIds.has(String(a.id));

                const borderColor = isCorrect
                  ? "#22c55e"
                  : checked && !isCorrect
                  ? "#ef4444"
                  : "rgba(148,163,184,.35)";
                const bg = isCorrect
                  ? "rgba(34,197,94,.10)"
                  : checked && !isCorrect
                  ? "rgba(239,68,68,.10)"
                  : "transparent";
                const color = isCorrect
                  ? "#22c55e"
                  : checked && !isCorrect
                  ? "#ef4444"
                  : "inherit";

                return (
                  <label
                    key={a.id}
                    className="option"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 12,
                      border: `1px solid ${borderColor}`,
                      background: bg,
                      color,
                    }}
                  >
                    <input
                      type={type === "multiple" ? "checkbox" : "radio"}
                      disabled
                      checked={!!checked}
                      readOnly
                    />
                    <span>{a.text}</span>
                  </label>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                marginTop: 8,
                padding: "10px 12px",
                border: "1px solid rgba(148,163,184,.35)",
                borderRadius: 12,
                background: "rgba(148,163,184,.1)",
              }}
            >
              <div className="muted" style={{ marginBottom: 4 }}>Vaš odgovor</div>
              <div style={{ fontWeight: 700 }}>{row.userText || "(nema odgovora)"}</div>
            </div>
          )}
        </div>

        {/* Desno: rezime za pitanje */}
        <div
          style={{
            border: "1px solid rgba(148,163,184,.35)",
            borderRadius: 16,
            padding: 14,
            background: "rgba(2,6,23,.3)",
            display: "grid",
            gap: 8,
            alignContent: "start",
          }}
        >
          <div className="muted" style={{ fontWeight: 700 }}>Vaš odgovor</div>
          <div style={{ fontWeight: 800 }}>
            {type === "text"
              ? (row.userText?.trim() || "(nema odgovora)")
              : row.userSelectedTexts.length
                ? row.userSelectedTexts.join(", ")
                : "(nema odgovora)"}
          </div>

          <div style={{ marginTop: 6, fontWeight: 900, color: correct ? "#22c55e" : "#ef4444" }}>
            {correct ? "TAČNO" : "NETAČNO"}
          </div>

          {!correct && (
            <>
              <div className="muted" style={{ marginTop: 8 }}>Tačan odgovor</div>
              <div style={{ fontWeight: 800 }}>
                {row.correctTexts.length ? row.correctTexts.join(", ") : "(nije definisan u bazi)"}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
