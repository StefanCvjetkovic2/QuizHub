import React from "react";
import { fmtSeconds } from "@/utils/time";

function fmtDate(d) {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    return dt.toLocaleString(); // možeš promeniti u toLocaleDateString ako želiš samo datum
  } catch { return String(d); }
}

export default function ResultsTable({ items = [], loading = false, onView }) {
  if (loading) return <div className="card">Učitavanje…</div>;
  if (!items.length) return <div className="card">Nema zabeleženih rezultata.</div>;

  return (
    <div className="card" style={{ padding: 0 }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th style={{ padding: 12 }}>Naziv kviza</th>
              <th style={{ padding: 12 }}>Datum</th>
              <th style={{ padding: 12 }}>Rezultat</th>
              <th style={{ padding: 12 }}>Procenat</th>
              <th style={{ padding: 12 }}>Vreme</th>
              <th style={{ padding: 12 }} />
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} style={{ borderTop: "1px solid rgba(148,163,184,.25)" }}>
                <td style={{ padding: 12, fontWeight: 700 }}>{r.quizTitle || "—"}</td>
                <td style={{ padding: 12 }}>{fmtDate(r.dateTaken)}</td>
                <td style={{ padding: 12 }}>{r.score}/{r.total}</td>
                <td style={{ padding: 12 }}>{r.percentage}%</td>
                <td style={{ padding: 12 }}>{r.timeTakenSeconds != null ? fmtSeconds(r.timeTakenSeconds) : "—"}</td>
                <td style={{ padding: 12, textAlign: "right" }}>
                  <button className="btn btn-blue" onClick={() => onView?.(r)}>
                    Pregled detalja
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
