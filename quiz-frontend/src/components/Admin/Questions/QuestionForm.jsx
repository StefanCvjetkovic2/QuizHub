// src/components/Admin/Questions/QuestionForm.jsx
import React, { useEffect, useState } from "react";
import { TYPE_LABELS, toDbType } from "@/services/questionsService.js";

const DEFAULT_OPTS = [
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
];

export default function QuestionForm({
  quizzes = [],
  initialValues = {},
  submitting = false,
  serverError = "",
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState({
    quizId: "",
    text: "",
    type: "SingleChoice", // DB naziv u stanju (lakše za validaciju)
    order: 0,
    answers: DEFAULT_OPTS, // za single/multiple
    trueIsCorrect: true,   // za boolean
  });

  // kada dođu initialValues (edit), prebaci u state
  useEffect(() => {
    if (!initialValues) return;

    // initialValues.type može doći kao 'single|multiple|boolean|text' (front)
    // prebacimo u DB naziv da forma interno koristi DB
    const typeDb = toDbType(initialValues.type || "SingleChoice");

    const next = {
      quizId: initialValues.quizId || "",
      text: initialValues.text || "",
      type: typeDb,
      order: Number(initialValues.order) || 0,
      answers: DEFAULT_OPTS,
      trueIsCorrect: true,
    };

    const arr = Array.isArray(initialValues.answers) ? initialValues.answers : [];

    if (typeDb === "SingleChoice" || typeDb === "MultipleChoice") {
      // mapiraj prva 4 odgovora u inputs
      const m = [...DEFAULT_OPTS];
      arr.slice(0, 4).forEach((a, i) => {
        m[i] = { text: a.text || "", isCorrect: !!a.isCorrect };
      });
      next.answers = m;
    } else if (typeDb === "TrueFalse") {
      next.trueIsCorrect = !!arr.find(a => a.isCorrect);
    } else if (typeDb === "FillInTheBlank") {
      next.answers = arr.map(a => ({ text: a.text || "", isCorrect: true }));
      if (next.answers.length === 0) next.answers = [{ text: "", isCorrect: true }];
    }

    setForm(next);
  }, [initialValues]);

  /* --------- UI helperi --------- */
  const setField = (patch) => setForm(f => ({ ...f, ...patch }));

  // SINGLE
  const setSingleCorrect = (i) =>
    setForm(f => ({
      ...f,
      answers: f.answers.map((x, idx) => ({ ...x, isCorrect: idx === i })),
    }));

  // MULTIPLE
  const toggleMultipleCorrect = (i) =>
    setForm(f => {
      const a = [...f.answers];
      a[i] = { ...a[i], isCorrect: !a[i].isCorrect };
      return { ...f, answers: a };
    });

  const setAnswerText = (i, val) =>
    setForm(f => {
      const a = [...f.answers];
      a[i] = { ...a[i], text: val };
      return { ...f, answers: a };
    });

  const addFill = () =>
    setForm(f => ({ ...f, answers: [...f.answers, { text: "", isCorrect: true }] }));

  const removeFill = (i) =>
    setForm(f => ({ ...f, answers: f.answers.filter((_, idx) => idx !== i) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // onSubmit očekuje payload u form obliku; servis će ga normalizovati
    onSubmit?.(form);
  };

  const type = form.type; // DB naziv

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 1000 }}>
      {serverError && <div className="error" style={{ marginBottom: 12 }}>{serverError}</div>}

      <div className="form-group">
        <label>Kviz</label>
        <select
          className="select-like"
          value={form.quizId}
          onChange={(e) => setField({ quizId: e.target.value })}
        >
          <option value="">— izaberi kviz —</option>
          {quizzes.map(q => (
            <option key={q.id} value={q.id}>{q.title || q.name || q.naziv}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Tekst pitanja</label>
        <textarea
          rows={4}
          value={form.text}
          onChange={(e) => setField({ text: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Tip</label>
        <select
          className="select-like"
          value={type}
          onChange={(e) => setField({ type: e.target.value })}
        >
          <option value="SingleChoice">{TYPE_LABELS.SingleChoice}</option>
          <option value="MultipleChoice">{TYPE_LABELS.MultipleChoice}</option>
          <option value="TrueFalse">{TYPE_LABELS.TrueFalse}</option>
          <option value="FillInTheBlank">{TYPE_LABELS.FillInTheBlank}</option>
        </select>
      </div>

      {/* Order je skriven – možemo ga prikazati ako želiš ručno mijenjanje */}
      {/* <div className="form-group">
        <label>Redosled</label>
        <input type="number" value={form.order} onChange={(e)=>setField({order: Number(e.target.value)||0})}/>
      </div> */}

      {(type === "SingleChoice" || type === "MultipleChoice") && (
        <div className="form-group">
          <label>Opcije</label>
          <div className="box">
            {form.answers.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                <input
                  placeholder={`Opcija ${i + 1}`}
                  value={a.text}
                  onChange={(e) => setAnswerText(i, e.target.value)}
                  style={{ flex: 1 }}
                />
                {type === "SingleChoice" ? (
                  <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input
                      type="radio"
                      checked={!!a.isCorrect}
                      onChange={() => setSingleCorrect(i)}
                    />
                    tačno
                  </label>
                ) : (
                  <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input
                      type="checkbox"
                      checked={!!a.isCorrect}
                      onChange={() => toggleMultipleCorrect(i)}
                    />
                    tačno
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {type === "TrueFalse" && (
        <div className="form-group">
          <label>Tačan odgovor</label>
          <div style={{ display: "flex", gap: 18 }}>
            <label><input type="radio" checked={!!form.trueIsCorrect} onChange={() => setField({ trueIsCorrect: true })}/> Tačno</label>
            <label><input type="radio" checked={!form.trueIsCorrect} onChange={() => setField({ trueIsCorrect: false })}/> Netačno</label>
          </div>
        </div>
      )}

      {type === "FillInTheBlank" && (
        <div className="form-group">
          <label>Prihvaćeni odgovori</label>
          <div className="box">
            {form.answers.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <input
                  value={a.text}
                  onChange={(e) => setAnswerText(i, e.target.value)}
                  placeholder={`Odgovor ${i + 1}`}
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn btn-blue" onClick={() => removeFill(i)}>Ukloni</button>
              </div>
            ))}
            <button type="button" className="btn btn--outline" onClick={addFill}>+ Dodaj odgovor</button>
          </div>
        </div>
      )}

      <div className="form-actions">
        <button className="btn btn--primary" disabled={submitting}>
          {submitting ? "Čuvam…" : "Sačuvaj"}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={submitting}>
          Otkaži
        </button>
      </div>
    </form>
  );
}
