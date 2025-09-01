// src/pages/User/QuizResultPage.jsx
import React, { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function QuizResultPage() {
  const { quizId } = useParams();
  const nav = useNavigate();
  const { state } = useLocation() || {};

  const summary = state?.summary; // { correct, total, percentage }
  const quizTitle = state?.quizTitle ?? "Kviz";
  const questions = state?.quizQuestions ?? [];
  const userAnswers = state?.userAnswers ?? [];

  const uaMap = useMemo(() => {
    const m = new Map();
    for (const a of userAnswers) m.set(a.questionId, a);
    return m;
  }, [userAnswers]);

  if (!summary) {
    return (
      <div className="card">
        <div className="error">Nema podataka o rezultatu.</div>
        <button className="btn btn-blue" onClick={() => nav("/quizzes")}>Nazad na kvizove</button>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontWeight: 900, fontSize: 26, marginBottom: 12 }}>{quizTitle} – rezultat</h2>

      <div className="card" style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        <div>
          <div className="muted">Ukupno pitanja</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{summary.total}</div>
        </div>
        <div>
          <div className="muted">Tačnih</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{summary.correct}</div>
        </div>
        <div>
          <div className="muted">Procenat</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{Math.round(summary.percentage)}%</div>
        </div>
      </div>

      <h3 style={{ marginTop: 16, fontWeight: 800 }}>Pregled odgovora</h3>
      <div style={{ display: "grid", gap: 12 }}>
        {questions.map((q, i) => {
          const ua = uaMap.get(q.id) || {};
          const selected = new Set(ua.selectedAnswerIds ?? []);
          const text = (ua.text ?? "").trim();

          // Ako BE vrati IsCorrect za svaku opciju — možemo highlight-ovati
          const hasCorrectInfo = q.answers?.some(a => typeof a.isCorrect === "boolean");

          return (
            <div key={q.id}
                 className="card"
                 style={{ padding: 14, border: "1px solid rgba(148,163,184,.25)", borderRadius: 14, background: "rgba(30,41,59,.30)" }}>
              <div className="muted">Pitanje {i + 1}</div>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>{q.text}</div>

              {q.type === "text" ? (
                <div>
                  <div><strong>Vaš odgovor:</strong> {text || <em>(prazno)</em>}</div>
                  {hasCorrectInfo && (
                    <div className="muted">
                      <strong>Tačni odgovori:</strong>{" "}
                      {q.answers.filter(a => a.isCorrect).map(a => a.text).join(", ")}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "grid", gap: 6 }}>
                  {q.answers.map(a => {
                    const chosen = selected.has(a.id);
                    const correct = hasCorrectInfo ? !!a.isCorrect : undefined;
                    const bg =
                      correct === true && chosen ? "#22c55e33" // pogođeno
                      : correct === true && !chosen ? "#22c55e14" // tačno ali nije izabrano
                      : correct === false && chosen ? "#ef444433" // greška
                      : "transparent";
                    return (
                      <div key={a.id}
                           style={{ padding: "6px 10px", borderRadius: 10, background: bg, display: "flex", alignItems: "center", gap: 8 }}>
                        <input type={q.type === "multiple" ? "checkbox" : "radio"} readOnly checked={chosen} />
                        <span>{a.text}</span>
                        {hasCorrectInfo && correct === true && <span className="muted" style={{ marginLeft: 6 }}>— tačno</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <button className="btn btn-blue" onClick={() => nav("/quizzes")}>Nazad na kvizove</button>
      </div>
    </div>
  );
}
