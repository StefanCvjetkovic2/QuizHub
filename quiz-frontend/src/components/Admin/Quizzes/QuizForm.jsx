// src/components/Admin/Quizzes/QuizForm.jsx
import React, { useState } from "react";

export default function QuizForm({
  categories = [],
  initialValues = {},         // za "edit" prosledi postojeće
  submitting = false,
  serverError = "",
  fieldErrors = {},
  onSubmit = () => {},
  onCancel = () => {},
}) {
  const [form, setForm] = useState({
    naziv: initialValues.title ?? initialValues.naziv ?? "",
    opis: initialValues.description ?? initialValues.opis ?? "",
    categoryId: initialValues.categoryId ?? "",
    difficulty: initialValues.difficulty ?? "",
    timeLimitSeconds: initialValues.timeLimitSeconds ?? "",
  });

  const setField = (name, value) =>
    setForm((f) => ({ ...f, [name]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      naziv: (form.naziv ?? "").trim(),
      opis: form.opis ?? "",
      categoryId: form.categoryId ? Number(form.categoryId) : 0,
      difficulty: form.difficulty ? Number(form.difficulty) : 0,
      timeLimitSeconds: form.timeLimitSeconds ? Number(form.timeLimitSeconds) : 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 900 }}>
      {serverError && <div className="error" style={{ marginBottom: 12 }}>{serverError}</div>}

      <div className="form-group">
        <label>Naziv *</label>
        <input
          value={form.naziv}
          onChange={(e) => setField("naziv", e.target.value)}
        />
        {fieldErrors.naziv && <div className="field-error">{fieldErrors.naziv}</div>}
      </div>

      <div className="form-group">
        <label>Opis</label>
        <textarea
          rows={4}
          value={form.opis}
          onChange={(e) => setField("opis", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Kategorija *</label>
        <select
          value={form.categoryId}
          onChange={(e) => setField("categoryId", e.target.value)}
        >
          <option value="">— izaberi —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {fieldErrors.categoryId && <div className="field-error">{fieldErrors.categoryId}</div>}
      </div>

      <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="form-group">
          <label>Težina</label>
          <select
            value={form.difficulty}
            onChange={(e) => setField("difficulty", e.target.value)}
          >
            <option value="">Odaberi težinu</option>
            <option value="1">lako</option>
            <option value="2">srednje</option>
            <option value="3">teško</option>
          </select>
        </div>

        <div className="form-group">
          <label>Vremensko ograničenje (sekunde)</label>
          <input
            type="number"
            min="0"
            value={form.timeLimitSeconds}
            onChange={(e) => setField("timeLimitSeconds", e.target.value)}
          />
        </div>
      </div>

      <div className="form-actions" style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-blue" disabled={submitting}>
          {submitting ? "Čuvam…" : "Sačuvaj"}
        </button>
        <button type="button" className="btn btn-red" onClick={onCancel}>
          Otkaži
        </button>
      </div>
    </form>
  );
}
