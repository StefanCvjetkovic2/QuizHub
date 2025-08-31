import React from "react";

function typeLabel(t) {
  switch ((t || "").toLowerCase()) {
    case "single":
    case "singlechoice":
      return "Jedan tačan";
    case "multiple":
    case "multiplechoice":
      return "Višestruki tačni";
    case "boolean":
    case "truefalse":
      return "Tačno / Netačno";
    case "text":
    case "fillintheblank":
      return "Unos teksta";
    default:
      return t || "-";
  }
}

export default function QuestionsTable({ items = [], loading, onEdit, onDelete }) {
  if (loading) return <div style={{ padding: 16 }}>Učitavanje…</div>;
  if (!items?.length) return <div style={{ padding: 16 }}>Nema zapisa.</div>;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Tekst</th>
            <th>Kviz</th>
            <th>Tip</th>
            <th>Redosled</th>
            <th style={{ width: 170, textAlign: "right" }}>Akcije</th>
          </tr>
        </thead>
        <tbody>
          {items.map((q) => (
            <tr key={q.id}>
              <td>{q.text}</td>
              <td>{q.quizTitle || q.quiz?.title || "-"}</td>
              <td>{typeLabel(q.type)}</td>
              <td>{q.order ?? 0}</td>
              <td style={{ textAlign: "right" }}>
                <button
                  type="button"
                  className="btn btn-sm btn-green"
                  onClick={() => onEdit?.(q.id)}
                >
                  Uredi
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-red"
                  onClick={() => onDelete?.(q.id)}
                  style={{ marginLeft: 8 }}
                >
                  Izbriši
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
