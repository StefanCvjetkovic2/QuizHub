import React, { useState } from "react";

export default function CategoryForm({
  onCreate = async () => {},
  submitting = false,
  serverError = "",
}) {
  const [name, setName] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const ok = await onCreate(name);
    if (ok) setName("");
  };

  return (
    <form onSubmit={submit} className="card" style={{ maxWidth: 520 }}>
      {serverError && (
        <div className="error" style={{ marginBottom: 12 }}>{serverError}</div>
      )}

      <div className="form-group">
        <label>Naziv kategorije</label>
        <input
          placeholder="npr. Engleski"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-actions">
        <button className="btn btn-blue" disabled={submitting || !name.trim()}>
          {submitting ? "Kreiram…" : "Kreiraj"}
        </button>
      </div>
    </form>
  );
}
