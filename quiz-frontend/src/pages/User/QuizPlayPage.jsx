// src/pages/User/QuizPlayPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPublicQuizDetail } from "@/services/quizPublicService";
import { submitQuiz } from "@/services/resultsService";

function fmt(sec) {
  if (!sec || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ⬇️ Normalizacija tipa da pokrije TrueFalse/boolean/bool/…
function normalizeType(t) {
  const s = String(t || "").toLowerCase();
  if (s.includes("truefalse") || s === "tf" || s === "boolean" || s === "bool") return "boolean";
  if (s.includes("single")) return "single";
  if (s.includes("multiple")) return "multiple";
  if (s.includes("fill") || s.includes("text")) return "text";
  return s;
}

export default function QuizPlayPage() {
  const { quizId } = useParams();
  const nav = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // navigacija pitanja
  const [idx, setIdx] = useState(0);

  // odgovori: map qid -> { type, selectedIds: Set<string>, text?: string }
  const [answers, setAnswers] = useState({});

  // tajmer
  const [remaining, setRemaining] = useState(null);
  const elapsedRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const qd = await getPublicQuizDetail(quizId);
        setQuiz(qd);
        const limit = Number.parseInt(qd.timeLimitSeconds, 10) || 0;
        setRemaining(limit > 0 ? limit : null);

        // init answers
        const init = {};
        for (const q of qd.questions) {
          init[q.id] = {
            type: normalizeType(q.type),   // ⬅️ normalizovan tip
            selectedIds: new Set(),
            text: "",
          };
        }
        setAnswers(init);
      } catch (e) {
        setErr(e?.response?.data?.message || e.message || "Neuspješno učitavanje kviza.");
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId]);

  // pokretanje tajmera
  useEffect(() => {
    if (!quiz) return;
    const limit = Number.parseInt(quiz.timeLimitSeconds, 10) || 0;
    if (limit <= 0) return; // bez tajmera
    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // auto-submit
          handleSubmit(true);
          return 0;
        }
        elapsedRef.current += 1;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz?.id]);

  const q = useMemo(() => quiz?.questions?.[idx] ?? null, [quiz, idx]);

  const setRadio = (qid, aid) => {
    setAnswers((prev) => {
      const cur = prev[qid] ?? { type: "single", selectedIds: new Set(), text: "" };
      return { ...prev, [qid]: { ...cur, selectedIds: new Set([aid]), text: "" } };
    });
  };

  const toggleCheckbox = (qid, aid) => {
    setAnswers((prev) => {
      const cur = prev[qid] ?? { type: "multiple", selectedIds: new Set(), text: "" };
      const next = new Set(cur.selectedIds);
      next.has(aid) ? next.delete(aid) : next.add(aid);
      return { ...prev, [qid]: { ...cur, selectedIds: next, text: "" } };
    });
  };

  const setText = (qid, val) => {
    setAnswers((prev) => {
      const cur = prev[qid] ?? { type: "text", selectedIds: new Set(), text: "" };
      return { ...prev, [qid]: { ...cur, text: val, selectedIds: new Set() } };
    });
  };

  // ⬇️ True/False — fallback kada nema ID-eva odgovora
  const setTrueFalseText = (qid, val /* "true" | "false" */) => {
    setAnswers((prev) => {
      const cur = prev[qid] ?? { type: "boolean", selectedIds: new Set(), text: "" };
      return { ...prev, [qid]: { ...cur, text: val, selectedIds: new Set() } };
    });
  };

  const go = (delta) => {
    setIdx((i) => {
      const n = (i + delta + (quiz?.questions?.length ?? 0)) % (quiz?.questions?.length ?? 1);
      return n;
    });
  };

  const handleSubmit = async (auto = false) => {
    if (!quiz) return;
    try {
      const elapsed =
        (quiz.timeLimitSeconds && quiz.timeLimitSeconds > 0)
          ? (Number.parseInt(quiz.timeLimitSeconds, 10) - (remaining ?? 0))
          : elapsedRef.current;

      // složi payload
      const payload = {
        quizId: quiz.id,
        elapsedSeconds: Math.max(0, Number.parseInt(elapsed, 10) || 0),
        answers: quiz.questions.map((qq) => {
          const t = normalizeType(qq.type);
          const a = answers[qq.id] ?? { type: t, selectedIds: new Set(), text: "" };

          if (t === "text") {
            return { questionId: qq.id, text: a.text ?? "" };
          }

          if (t === "boolean") {
            // ako imamo izabrani ID → šaljemo SelectedAnswerIds
            const ids = Array.from(a.selectedIds ?? []);
            if (ids.length > 0) {
              return { questionId: qq.id, selectedAnswerIds: ids };
            }
            // fallback: šaljemo "true"/"false" u Text
            if ((a.text ?? "") !== "") {
              return { questionId: qq.id, text: a.text };
            }
            return { questionId: qq.id, selectedAnswerIds: [] };
          }

          // single/multiple → id-evi
          return {
            questionId: qq.id,
            selectedAnswerIds: Array.from(a.selectedIds ?? []),
          };
        }),
      };

      const res = await submitQuiz(payload);
      // idi na rezultat
      nav(`/quizzes/${quiz.id}/result`, {
        replace: true,
        state: {
          summary: res,
          quizTitle: quiz.title,
          quizQuestions: quiz.questions,        // za highlight
          userAnswers: payload.answers,
        },
      });
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Predaja kviza nije uspjela.";
      if (!auto) alert(msg);
    }
  };

  if (loading) return <div className="muted">Učitavanje kviza…</div>;
  if (err) return <div className="error">{err}</div>;
  if (!quiz) return null;

  const total = quiz.questions.length;
  const progress = total > 0 ? Math.round(((idx + 1) / total) * 100) : 0;

  return (
    <div>
      {/* Header sa naslovom i tajmerom */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        alignItems: "center",
        gap: 12,
        marginBottom: 12
      }}>
        <h2 style={{ fontWeight: 900, fontSize: 26, margin: 0 }}>{quiz.title}</h2>

        {/* tajmer (ako postoji) */}
        <div style={{ justifySelf: "end" }}>
          {quiz.timeLimitSeconds > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="muted">Vrijeme:</div>
              <div style={{
                padding: "6px 10px",
                borderRadius: 10,
                background: remaining <= 10 ? "#ef444433" : "rgba(148,163,184,.2)",
                fontWeight: 800
              }}>
                {fmt(remaining)}
              </div>
            </div>
          ) : (
            <div className="muted">Bez vremenskog ograničenja</div>
          )}
        </div>

        {/* predaja/odustani */}
        <div style={{ display: "flex", gap: 8, justifySelf: "end" }}>
          <button className="btn btn-amber" onClick={() => {
            if (confirm("Odustati od kviza? Nepošlati odgovore.")) {
              nav("/quizzes");
            }
          }}>Odustani</button>
          <button className="btn btn-blue" onClick={() => {
            if (confirm("Završiti kviz i poslati odgovore?")) handleSubmit(false);
          }}>Završi</button>
        </div>
      </div>

      {/* linijski progres */}
      <div style={{ height: 8, background: "rgba(148,163,184,.25)", borderRadius: 999 }}>
        <div style={{
          width: `${progress}%`,
          height: "100%",
          background: "var(--brand, #2563eb)",
          borderRadius: 999,
          transition: "width .25s ease"
        }} />
      </div>

      {/* telo pitanja */}
      {q && (
        <div
          className="card"
          style={{
            marginTop: 16,
            padding: 18,
            border: "1px solid rgba(148,163,184,.25)",
            borderRadius: 14,
            background: "rgba(30,41,59,.30)",
          }}
        >
          <div className="muted" style={{ marginBottom: 4 }}>
            Pitanje {idx + 1} / {total}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{q.text}</div>

          {/* rendere zavisno od tipa */}
          {normalizeType(q.type) === "single" && (
            <div style={{ display: "grid", gap: 8 }}>
              {q.answers.map(a => {
                const checked = answers[q.id]?.selectedIds?.has(a.id);
                return (
                  <label key={a.id} className="option" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={!!checked}
                      onChange={() => setRadio(q.id, a.id)}
                    />
                    <span>{a.text}</span>
                  </label>
                );
              })}
            </div>
          )}

          {normalizeType(q.type) === "multiple" && (
            <div style={{ display: "grid", gap: 8 }}>
              {q.answers.map(a => {
                const checked = answers[q.id]?.selectedIds?.has(a.id);
                return (
                  <label key={a.id} className="option" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={!!checked}
                      onChange={() => toggleCheckbox(q.id, a.id)}
                    />
                    <span>{a.text}</span>
                  </label>
                );
              })}
            </div>
          )}

          {normalizeType(q.type) === "boolean" && (
            <div style={{ display: "grid", gap: 8 }}>
              {(q.answers?.length === 2 ? q.answers : [
                { id: "tf-true",  text: "Tačno",  flag: "true"  },
                { id: "tf-false", text: "Netačno", flag: "false" },
              ]).map(o => {
                const hasIds = q.answers?.length === 2;
                const checked = hasIds
                  ? !!answers[q.id]?.selectedIds?.has(o.id)
                  : (answers[q.id]?.text === o.flag);
                const onChange = () => {
                  if (hasIds) setRadio(q.id, o.id);
                  else setTrueFalseText(q.id, o.flag);
                };
                return (
                  <label key={o.id} className="option" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="radio"
                      name={`q-tf-${q.id}`}
                      checked={checked}
                      onChange={onChange}
                    />
                    <span>{o.text}</span>
                  </label>
                );
              })}
            </div>
          )}

          {normalizeType(q.type) === "text" && (
            <div style={{ display: "grid", gap: 6 }}>
              <input
                placeholder="Unesite odgovor…"
                value={answers[q.id]?.text ?? ""}
                onChange={(e) => setText(q.id, e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {/* navigacija pitanja */}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button className="btn btn-amber" onClick={() => go(-1)}>Prethodno</button>
        <button className="btn btn-blue" onClick={() => go(+1)}>Sljedeće</button>
      </div>

      {/* skok na broj pitanja */}
      <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
        {quiz.questions.map((qq, i) => {
          const a = answers[qq.id] || {};
          const answered =
            ((a.selectedIds?.size ?? 0) > 0) || ((a.text ?? "").trim() !== ""); // ⬅️ sada pokriva i TF tekst
          return (
            <button
              key={qq.id}
              onClick={() => setIdx(i)}
              className="btn btn--outline"
              style={{
                padding: "6px 10px",
                borderColor: i === idx ? "var(--brand, #2563eb)" : answered ? "#22c55e" : "rgba(148,163,184,.35)",
                color: i === idx ? "var(--brand, #2563eb)" : answered ? "#22c55e" : "inherit"
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
