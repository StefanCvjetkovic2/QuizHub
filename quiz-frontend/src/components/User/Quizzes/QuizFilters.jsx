// src/components/User/Quizzes/QuizFilters.jsx
import React from "react";

export default function QuizFilters({
  q,
  onQChange,
  categoryId,
  onCategoryChange,
  difficulty,
  onDifficultyChange,
  categories = [],
  onApply,
  onReset,
}) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 200px 200px 140px 120px",
        gap: 12,
        alignItems: "end"
      }}>
        <div className="form-group">
          <label>Pretraga</label>
          <input
            placeholder="npr. JavaScript"
            value={q}
            onChange={onQChange}
          />
        </div>

        <div className="form-group">
          <label>Kategorija</label>
          <select value={categoryId} onChange={onCategoryChange}>
            <option value="">Sve kategorije</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Težina</label>
          <select value={difficulty} onChange={onDifficultyChange}>
            <option value="">Sve težine</option>
            <option value="1">lako</option>
            <option value="2">srednje</option>
            <option value="3">teško</option>
          </select>
        </div>

        <button className="btn btn-blue" onClick={onApply}>Primijeni</button>
        <button className="btn btn-amber" onClick={onReset}>Reset</button>
      </div>
    </div>
  );
}
