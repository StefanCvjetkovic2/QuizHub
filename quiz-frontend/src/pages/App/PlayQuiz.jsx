import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getQuizPublic } from "../../services/userQuizzes";
import { submitResult, getResultById } from "../../services/results";

const toId = (v) => String(v ?? "");

export default function QuizPlay() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");

  const [idx, setIdx] = useState(0);
  const [answersByQid, setAnswersByQid] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  const [ended, setEnded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState(null);

  const timerRef = useRef(null);

  const current = useMemo(() => (quiz?.questions || [])[idx], [quiz, idx]);
  const total = quiz?.questions?.length || 0;
  const elapsedSeconds = quiz?.timeLimitSeconds
    ? Math.max(0, Number(quiz.timeLimitSeconds) - Number(timeLeft))
    : 0;

  // Load kviza
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setLoadErr("");
        const q = await getQuizPublic(id);
        const sorted = {
          ...q,
          questions: (q?.questions || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        };
        setQuiz(sorted);
        setIdx(0);
        setAnswersByQid({});
        setSummary(null);
        setEnded(false);
        setTimeLeft(Number(sorted?.timeLimitSeconds || 0));
      } catch (e) {
        setLoadErr(e.message || "Greška pri učitavanju kviza.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Tajmer
  useEffect(() => {
    if (!quiz || ended || submitting) return;
    if (Number(timeLeft) <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [quiz, ended, submitting, timeLeft]);

  // Auto-finish kad istekne
  useEffect(() => {
    if (!quiz) return;
    if (Number(timeLeft) <= 0 && !ended && !submitting && !summary) {
      onFinish(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // Navigacija
  const goPrev = () => setIdx((i) => Math.max(0, i - 1));
  const goNext = () => setIdx((i) => Math.min(total - 1, i + 1));

  // Upis odgovora
  function setAnswerSingle(questionId, answerId) {
    setAnswersByQid((m) => ({ ...m, [toId(questionId)]: toId(answerId) }));
  }
  function toggleAnswerMulti(questionId, answerId) {
    setAnswersByQid((m) => {
      const key = toId(questionId);
      const prev = Array.isArray(m[key]) ? m[key] : [];
      const val = toId(answerId);
      const next = prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val];
      return { ...m, [key]: next };
    });
  }
  function setAnswerText(questionId, text) {
    setAnswersByQid((m) => ({ ...m, [toId(questionId)]: text }));
  }

  // === KLJUČNO: u payload šaljemo SAMO odgovore koji postoje ===
  // - SingleChoice/TrueFalse: šalji selectedAnswerIds sa ID-em izabrane opcije
  // - MultipleChoice: šalji listu ID-jeva ako nije prazna
  // - FillIn: šalji text samo ako nije prazan
  function buildSubmitPayload() {
    const answers = [];
    for (const q of quiz?.questions || []) {
      const v = answersByQid[q.id];

      if (q.type === "SingleChoice" || q.type === "TrueFalse") {
        if (typeof v === "string" && v) {
          answers.push({ questionId: q.id, selectedAnswerIds: [v] });
        }
        continue; // ne šalji ništa ako nije odgovoreno
      }

      if (q.type === "MultipleChoice") {
        if (Array.isArray(v) && v.length > 0) {
          answers.push({ questionId: q.id, selectedAnswerIds: v.map(String) });
        }
        continue;
      }

      if (q.type === "FillInTheBlank") {
        const t = String(v ?? "").trim();
        if (t) {
          answers.push({ questionId: q.id, text: t });
        }
        continue;
      }
    }

    return {
      quizId: quiz.id,
      elapsedSeconds: Number(elapsedSeconds) || 0,
      answers,
    };
  }

  // Završi — prikaži server-ov score
  async function onFinish(auto = false) {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (ended) return;
    setEnded(true);

    try {
      setSubmitting(true);
      const payload = buildSubmitPayload();
      const res = await submitResult(payload);

      const summaryShape = {
        correct: res?.correct ?? res?.data?.correct ?? 0,
        total: res?.total ?? res?.data?.total ?? (quiz?.questions?.length || 0),
        percentage: res?.percentage ?? res?.data?.percentage ?? 0,
        timeTakenSeconds: res?.timeTakenSeconds ?? res?.data?.timeTakenSeconds ?? elapsedSeconds,
      };

      if ((summaryShape.correct === 0 && !("correct" in res)) && res?.resultId) {
        const full = await getResultById(res.resultId);
        summaryShape.correct = full?.correct ?? summaryShape.correct;
        summaryShape.total = full?.total ?? summaryShape.total;
        summaryShape.percentage = full?.percentage ?? summaryShape.percentage;
        summaryShape.timeTakenSeconds = full?.timeTakenSeconds ?? summaryShape.timeTakenSeconds;
      }

      setSummary(summaryShape);
    } catch (e) {
      setSummary({
        correct: 0,
        total: quiz?.questions?.length || 0,
        percentage: 0,
        timeTakenSeconds: elapsedSeconds,
      });
      alert(e.message || "Slanje rezultata nije uspjelo.");
    } finally {
      setSubmitting(false);
    }
  }

  function isAnswered(q) {
    const u = answersByQid[toId(q.id)];
    if (q.type === "MultipleChoice") return Array.isArray(u) && u.length > 0;
    if (q.type === "FillInTheBlank") return typeof u === "string" && u.trim() !== "";
    return !!u;
  }

  const timerLabel = useMemo(() => {
    const s = Math.max(0, Number(timeLeft) || 0);
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [timeLeft]);

  if (loading) return <div className="muted" style={{ padding: 16 }}>Učitavanje…</div>;
  if (loadErr) return <div className="error" style={{ margin: 16 }}>{loadErr}</div>;
  if (!quiz) return null;

  return (
    <div className="play-shell">
      {/* Sidebar indeks */}
      <aside className="play-sidebar">
        <div className="play-sidebar__title">Pitanja</div>
        <div className="index-grid">
          {(quiz.questions || []).map((q, i) => (
            <button
              key={q.id}
              className={`index-btn ${i === idx ? "active" : ""} ${isAnswered(q) ? "done" : ""}`}
              onClick={() => setIdx(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="play-main">
        <div className="admin-header" style={{ marginBottom: 12 }}>
          <h1 style={{ margin: 0 }}>{quiz.title}</h1>
          <div className="row-actions" style={{ alignItems: "center" }}>
            <span className="badge">{timerLabel}</span>
            <Link to="/app/quizzes" className="btn btn--outline">← Nazad na kvizove</Link>
          </div>
        </div>

        {!summary ? (
          <div className="card" style={{ background: "transparent", border: "none", padding: 0 }}>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>
              Pitanje {idx + 1} / {total}
            </h2>

            <div className="qtitle" style={{ marginBottom: 10 }}>{current?.text}</div>

            {current && (current.type === "SingleChoice" || current.type === "TrueFalse") && (
              <div className="grid" style={{ gap: 8 }}>
                {current.answers?.map((a) => {
                  const checked = toId(answersByQid[toId(current.id)]) === toId(a.id);
                  return (
                    <label key={a.id} className={`answer ${checked ? "answer--selected" : ""}`}>
                      <input
                        type="radio"
                        name={`q_${current.id}`}
                        checked={checked}
                        onChange={() => setAnswerSingle(current.id, a.id)}
                      />
                      <span>{a.text}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {current && current.type === "MultipleChoice" && (
              <div className="grid" style={{ gap: 8 }}>
                {current.answers?.map((a) => {
                  const arr = Array.isArray(answersByQid[toId(current.id)]) ? answersByQid[toId(current.id)] : [];
                  const checked = arr.includes(toId(a.id));
                  return (
                    <label key={a.id} className={`answer ${checked ? "answer--selected" : ""}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAnswerMulti(current.id, a.id)}
                      />
                      <span>{a.text}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {current && current.type === "FillInTheBlank" && (
              <div className="form-group">
                <label>Odgovor</label>
                <input
                  placeholder="Upišite tačan odgovor"
                  value={typeof answersByQid[toId(current.id)] === "string" ? answersByQid[toId(current.id)] : ""}
                  onChange={(e) => setAnswerText(current.id, e.target.value)}
                />
              </div>
            )}

            <div className="play-footer">
              <div className="actions">
                <button className="btn btn--outline" onClick={goPrev} disabled={idx === 0}>← Prethodno</button>
                <button className="btn btn--outline" onClick={goNext} disabled={idx >= total - 1}>Sljedeće →</button>
              </div>
              <div className="actions">
                <button className="btn btn--primary" onClick={() => onFinish(false)} disabled={submitting}>
                  {submitting ? "Šaljem…" : "Završi kviz"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="table" style={{ padding: 16 }}>
            <h2>Rezultat</h2>
            <p className="lead">
              Tačnih: <b>{summary.correct}</b> / {summary.total} &nbsp;
              ({Math.round(summary.percentage)}%)
            </p>
            <p className="muted">Vrijeme: {summary.timeTakenSeconds ?? elapsedSeconds}s</p>
            <div className="row-actions" style={{ marginTop: 12 }}>
              <Link to="/app/quizzes" className="btn btn--primary">Nazad na kvizove</Link>
              <button className="btn btn--outline" onClick={() => navigate(0)}>Ponovi kviz</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
