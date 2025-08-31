import React from "react";

export default function CategoryList({
  items = [],
  loading = false,
  onDelete, // opciono
}) {
  return (
    <div className="card">
      <h3 style={{ fontWeight: 800, marginBottom: 12 }}>Kategorije</h3>

      {loading ? (
        <div>Učitavanje…</div>
      ) : items.length === 0 ? (
        <div>Nema kategorija.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Naziv</th>
              <th style={{ width: 140, textAlign: "right" }}>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td style={{ textAlign: "right" }}>
                  {onDelete && (
                    <button
                      className="btn btn-red"
                      onClick={() => onDelete(c.id)}
                    >
                      Izbriši
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
