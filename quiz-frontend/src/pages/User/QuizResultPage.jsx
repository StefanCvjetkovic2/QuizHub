import React, { useMemo } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";

function normalizeType(t) {
  const s = String(t || "").toLowerCase();
  if (s.includes("truefalse") || s === "tf" || s === "boolean" || s === "bool") return "boolean";
  if (s.includes("single")) return "single";
  if (s.includes("multiple")) return "multiple";
  if (s.includes("fill") || s.includes("text") || s.includes("unos")) return "text";
  return s;
}

export default function QuizResultPage() {
  const { quizId } = useParams();
  const nav = useNavigate();
  const { state } = useLocation() || {};

  const summary   = state?.summary;
  const quizTitle = state?.quizTitle || "Rezultat kviza";
  const questions = state?.quizQuestions || [];

  const detailsByQid = useMemo(() => {
    const list =
      summary?.details ??
      summary?.questionResults ??
      summary?.perQuestion ??
      summary?.items ??
      summary?.questions ??
      summary?.results ??
      [];
    const map = new Map();
    for (const d of list) {
      const qid = String(d?.questionId ?? d?.qid ?? d?.id ?? "");
      if (!qid) continue;
      map.set(qid, {
        correct: !!(d?.isCorrect ?? d?.correct ?? d?.tacan ?? d?.tacno),
        correctIds: new Set((d?.correctAnswerIds ?? d?.correctIds ?? []).map(String)),
        correctTexts: Array.isArray(d?.correctAnswerTexts ?? d?.correctTexts)
          ? (d?.correctAnswerTexts ?? d?.correctTexts).filter(Boolean)
          : (d?.correctText ? [d.correctText] : []),
        userIds: new Set((d?.userSelectedAnswerIds ?? d?.userIds ?? []).map(String)),
        userText: d?.userText ?? "",
      });
    }
    return map;
  }, [summary]);

  const rows = useMemo(() => {
    return questions.map((q, idx) => {
      const qid = String(q.id);
      const type = normalizeType(q.type);

      const det = detailsByQid.get(qid);
      const correctIds = det?.correctIds?.size
        ? det.correctIds
        : new Set((q.answers || []).filter(a => a.isCorrect).map(a => String(a.id)));
      let correctTexts = det?.correctTexts?.length
        ? det.correctTexts
        : (q.answers || []).filter(a => correctIds.has(String(a.id))).map(a => a.text).filter(Boolean);

      const userIds = det?.userIds ?? new Set();
      const userText = det?.userText ?? "";

      const userSelectedTexts = (() => {
        const ids = Array.from(userIds);
        if (ids.length > 0) {
          return (q.answers || []).filter(a => ids.includes(String(a.id))).map(a => a.text).filter(Boolean);
        }
        if (type === "text") return [userText || ""];
        return [];
      })();

      const correct = det?.correct ?? false;

      return {
        index: idx + 1,
        q,
        type,
        correct,
        correctIds,
        correctTexts,
        userIds,
        userText,
        userSelectedTexts,
      };
    });
  }, [questions, detailsByQid]);

  if (!summary || !questions?.length) {
    return (
      <div className="card" style={{ maxWidth: 1000 }}>
        <h2 style={{ fontWeight: 900, marginBottom: 6 }}>Pregled rezultata</h2>
        <div className="muted" style={{ marginBottom: 12 }}>
          Nedostaju podaci o rezultatu. Vrati se na listu kvizova i pokreni kviz ponovo.
        </div>
        <Link className="btn btn-blue" to="/quizzes">Nazad na kvizove</Link>
      </div>
    );
  }

  const total = questions.length;
  const correctCount = summary?.correct ?? rows.filter(r => r.correct).length;
  const percentage = summary?.percentage != null
    ? summary.percentage
    : (total === 0 ? 0 : Math.round((correctCount * 100) / total));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
        <h2 style={{ fontWeight: 900, fontSize: 26, margin: 0 }}>{quizTitle}</h2>
        <div className="muted">— rezultat</div>
      </div>

      <div className="card" style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>
          Tačno: <span style={{ color: "#22c55e" }}>{correctCount}</span> / {total}
        </div>
        <div className="muted">|</div>
        <div style={{ fontSize: 18, fontWeight: 800 }}>
          Procenat: <span style={{ color: percentage >= 50 ? "#22c55e" : "#ef4444" }}>{Math.round(percentage)}%</span>
        </div>
        <div style={{ flex: 1 }} />
       
        <Link className="btn btn-red" to="/quizzes">Izađi</Link>
        <button className="btn btn-blue" onClick={() => nav(`/quizzes/${quizId}`)}>Ponovi kviz</button>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {rows.map((row) => {
          const { q, type, correct, correctIds, userIds } = row;
          return (
            <div
              key={q.id}
              className="card"
              style={{
                border: `1px solid ${correct ? "rgba(34,197,94,.35)" : "rgba(239,68,68,.35)"}`,
                background: "rgba(30,41,59,.30)",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
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
                          : checked && !isCorrect ? "#ef4444" : "rgba(148,163,184,.35)";
                        const bg = isCorrect
                          ? "rgba(34,197,94,.10)"
                          : checked && !isCorrect ? "rgba(239,68,68,.10)" : "transparent";
                        const color = isCorrect
                          ? "#22c55e"
                          : checked && !isCorrect ? "#ef4444" : "inherit";

                        return (
                          <label key={a.id} className="option"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "8px 10px",
                              borderRadius: 12,
                              border: `1px solid ${borderColor}`,
                              background: bg,
                              color,
                            }}>
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
        })}
      </div>
    </div>
  );
}
