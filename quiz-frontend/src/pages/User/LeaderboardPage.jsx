import React, { useEffect, useMemo, useState } from "react";
import { listPublicQuizzes } from "@/services/quizPublicService";
import { getLeaderboard } from "@/services/leaderboardService";

const PERIODS = [
  { value: "all",   label: "Svi rezultati" },
  { value: "week",  label: "Nedeljni (7 dana)" },
  { value: "month", label: "Mesečni (30 dana)" },
];

function fmtDur(s) {
  if (s == null) return "—";
  s = Number(s) || 0;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2,"0")}`;
}
function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleString();
}

export default function LeaderboardPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [filters, setFilters] = useState({ quizId: "", period: "all" });
  const [data, setData] = useState({ items: [], total: 0, page: 1, pageSize: 50, yourRank: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await listPublicQuizzes({ page: 1, pageSize: 100 });
        setQuizzes(res.items);
        if (res.items.length && !filters.quizId) {
          setFilters(f => ({ ...f, quizId: res.items[0].id }));
        }
      } catch {}
    })();
  }, []);

  const load = async (page = 1) => {
    if (!filters.quizId) return;
    setLoading(true);
    try {
      const res = await getLeaderboard({ quizId: filters.quizId, period: filters.period, page, pageSize: 50 });
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); /* on filter change */ }, [filters.quizId, filters.period]);

  const header = useMemo(() => {
    const q = quizzes.find(x => x.id === filters.quizId);
    return q ? q.title : "Rang lista";
  }, [quizzes, filters.quizId]);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>Rang lista</h1>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 220px 120px", gap: 10, alignItems: "end" }}>
          <div className="form-group">
            <label>Kviz</label>
            <select
              value={filters.quizId}
              onChange={(e) => setFilters(f => ({ ...f, quizId: e.target.value }))}
            >
              {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Period</label>
            <select
              value={filters.period}
              onChange={(e) => setFilters(f => ({ ...f, period: e.target.value }))}
            >
              {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          <button className="btn btn-blue" onClick={() => load(1)}>Primeni</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 8 }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>{header}</div>
        {data.yourRank != null && (
          <div className="muted" style={{ marginTop: 4 }}>
            Vaša pozicija: <b>#{data.yourRank}</b>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th style={{ padding: 12 }}>#</th>
              <th style={{ padding: 12 }}>Korisnik</th>
              <th style={{ padding: 12 }}>Bodovi</th>
              <th style={{ padding: 12 }}>Procenat</th>
              <th style={{ padding: 12 }}>Vreme (trajanje)</th>
              <th style={{ padding: 12 }}>Postignuto</th>
            </tr>
          </thead>
          <tbody>
            {!loading && data.items.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 16 }} className="muted">Nema rezultata za ovaj filter.</td></tr>
            )}
            {loading && (
              <tr><td colSpan={6} style={{ padding: 16 }} className="muted">Učitavanje…</td></tr>
            )}
            {!loading && data.items.map(row => (
              <tr key={row.rank} style={{ background: row.isYou ? "rgba(37,99,235,.10)" : "transparent" }}>
                <td style={{ padding: 10, fontWeight: 800 }}>#{row.rank}</td>
                <td style={{ padding: 10 }}>{row.userName || row.userId}</td>
                <td style={{ padding: 10 }}>{row.score}{row.total ? ` / ${row.total}` : ""}</td>
                <td style={{ padding: 10 }}>{row.percentage}%</td>
                <td style={{ padding: 10 }}>{fmtDur(row.timeTakenSeconds)}</td>
                <td style={{ padding: 10 }}>{fmtDate(row.dateTaken)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* jednostavna paginacija */}
      {data.total > data.pageSize && (
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button className="btn btn--outline" disabled={data.page <= 1} onClick={() => load(data.page - 1)}>Prethodna</button>
          <button className="btn btn--outline" disabled={data.page * data.pageSize >= data.total} onClick={() => load(data.page + 1)}>Sledeća</button>
          <div className="muted" style={{ alignSelf: "center" }}>
            Strana {data.page} / {Math.ceil(data.total / data.pageSize)}
          </div>
        </div>
      )}
    </div>
  );
}
