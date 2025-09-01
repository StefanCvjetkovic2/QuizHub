import React, { useEffect, useMemo, useState } from "react";
import { listPublicQuizzes } from "@/services/quizPublicService";
import { listAdminResults } from "@/services/adminResultsService";

export default function AdminResultsPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [filter, setFilter] = useState({ quizId: "" });
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  // Učitaj kvizove za filter (bez 400 – manji pageSize + fallback)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // manji pageSize da ne udara 400
        const res = await listPublicQuizzes({ page: 1, pageSize: 50 });
        if (mounted) setQuizzes(res.items || []);
      } catch {
        // fallback na praznu listu (filter će i dalje imati „Svi kvizovi“)
        if (mounted) setQuizzes([]);
      }
    })();
    return () => (mounted = false);
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { items, total } = await listAdminResults({
        page: 1,
        pageSize: 50,
        quizId: filter.quizId || undefined,
      });
      setRows(items || []);
      setTotal(total ?? items?.length ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onApply = async () => load();
  const onReset = async () => {
    setFilter({ quizId: "" });
    await load();
  };

  const QuizSelect = useMemo(
    () => (
      <select
        value={filter.quizId}
        onChange={(e) => setFilter((f) => ({ ...f, quizId: e.target.value }))}
        style={{ padding: 10, borderRadius: 10 }}
      >
        <option value="">Svi kvizovi</option>
        {quizzes.map((q) => (
          <option key={q.id} value={q.id}>
            {q.title}
          </option>
        ))}
      </select>
    ),
    [filter.quizId, quizzes]
  );

  return (
    <div className="card" style={{ background: "#0f2345", color: "#fff" }}>
      <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 18 }}>
        Pregled rezultata
      </h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
        <div>
          <div className="muted" style={{ marginBottom: 4 }}>Kviz</div>
          {QuizSelect}
        </div>

        <button className="btn btn-blue" onClick={onApply} disabled={loading}>
          Primijeni
        </button>
        <button className="btn btn-amber" onClick={onReset} disabled={loading}>
          Reset
        </button>

        <div style={{ marginLeft: "auto", fontSize: 18 }}>
          Ukupno: <b>{total}</b>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", opacity: 0.9 }}>
              <th style={{ padding: "10px 12px" }}>Korisnik</th>
              <th style={{ padding: "10px 12px" }}>Kviz</th>
              <th style={{ padding: "10px 12px" }}>Bodovi</th>
              <th style={{ padding: "10px 12px" }}>Procenat</th>
              <th style={{ padding: "10px 12px" }}>Vreme (trajanje)</th>
              <th style={{ padding: "10px 12px" }}>Postignuto</th>
              {/* ⬇️ NEMA više kolone "Akcije" */}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: 16, opacity: 0.8 }}>
                  Učitavanje…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 16, opacity: 0.8 }}>
                  Nema rezultata za ovaj filter.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} style={{ borderTop: "1px solid #ffffff22" }}>
                  <td style={{ padding: "12px" }}>{r.username || r.userName || r.user || "-"}</td>
                  <td style={{ padding: "12px" }}>{r.quizTitle || r.quizName || "-"}</td>
                  <td style={{ padding: "12px" }}>
                    
                    {r.score}{r.total ? ` / ${r.total}` : ""}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {Math.round(r.percentage ?? ((r.total ? (r.score * 100) / r.total : 0)))}%
                  </td>
                  <td style={{ padding: "12px" }}>
                    {formatDuration(r.timeTakenSeconds ?? r.elapsedSeconds ?? r.durationSeconds)}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {formatDateTime(r.dateTaken ?? r.takenAt ?? r.createdAt ?? r.created)}
                  </td>
                 
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDuration(sec) {
  const s = Math.max(0, parseInt(sec || 0, 10));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m)}:${String(r).padStart(2, "0")}`;
}

function formatDateTime(dt) {
  if (!dt) return "-";
  try {
    const d = new Date(dt);
    if (isNaN(d.getTime())) return String(dt);
    return d.toLocaleString();
  } catch {
    return String(dt);
  }
}
