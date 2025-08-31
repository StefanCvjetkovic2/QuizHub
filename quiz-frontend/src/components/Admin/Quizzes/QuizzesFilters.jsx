import React from "react";

const DIFF_OPTIONS = [
  { value: "",  label: "Sve težine" },
  { value: 1,   label: "lako" },
  { value: 2,   label: "srednje" },
  { value: 3,   label: "teško" },
];

export default function QuizzesFilters({
  q, onQChange,
  categoryId, onCategoryChange,
  difficulty, onDifficultyChange,
  categories = [],
  onApply, onReset,
}) {
  return (
    <div className="filters">
      <label className="label">Kategorija:</label>
      <select className="select" value={categoryId} onChange={onCategoryChange}>
        <option value="">Sve kategorije</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <label className="label">Težina:</label>
      <select className="select" value={difficulty} onChange={onDifficultyChange}>
        {DIFF_OPTIONS.map(o => (
          <option key={o.label} value={o.value}>{o.label}</option>
        ))}
      </select>

      <input className="input" value={q} onChange={onQChange} placeholder="Pretraga…" />

      <button className="btn btn-blue" onClick={onApply}>Primijeni</button>
      <button className="btn btn-amber" onClick={onReset}>Reset</button>
    </div>
  );
}
