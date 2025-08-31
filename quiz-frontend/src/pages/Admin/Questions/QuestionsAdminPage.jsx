// src/pages/Admin/Questions/QuestionsAdminPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getQuizzesAdmin } from "@/services/quizService.js";
import { getQuestions, deleteQuestion } from "@/services/questionsService.js";
import { TYPE_LABELS } from "@/services/questionsService.js";

export default function QuestionsAdminPage() {
  const nav = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ quizId: "", type: "", q: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true); setErr("");
    try {
      const [qs, list] = await Promise.all([
        getQuizzesAdmin({ page: 1, pageSize: 100 }),
        getQuestions({ page: 1, pageSize: 50, ...filters }),
      ]);
      setQuizzes(qs.items ?? qs);
      setItems(list.items ?? []);
    } catch (e) {
      setErr(e?.message || "Neuspjelo učitavanje.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filters.quizId, filters.type]);

  const onDelete = async (id) => {
    if (!window.confirm("Obrisati pitanje?")) return;
    await deleteQuestion(id);
    await load();
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h2>Pitanja</h2>
        <div style={{display:"flex",gap:8}}>
          <Link className="btn btn-blue" to="/admin/questions/new">+ Dodaj novo pitanje</Link>
          <Link className="btn btn-amber" to="/admin">Nazad na kvizove</Link>
        </div>
      </div>

      {/* Filteri */}
      <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:12}}>
        <div>
          <div style={{fontWeight:700,marginBottom:4}}>Kviz</div>
          <select
            className="select-like"
            value={filters.quizId}
            onChange={(e) => setFilters(f => ({ ...f, quizId: e.target.value }))}
          >
            <option value="">Sve</option>
            {quizzes.map(q => <option key={q.id} value={q.id}>{q.title || q.name || q.naziv}</option>)}
          </select>
        </div>

        <div>
          <div style={{fontWeight:700,marginBottom:4}}>Tip</div>
          <select
            className="select-like"
            value={filters.type}
            onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
          >
            <option value="">Svi</option>
            <option value="single">Jedan tačan</option>
            <option value="multiple">Višestruki tačni</option>
            <option value="boolean">Tačno / Netačno</option>
            <option value="text">Unos teksta</option>
          </select>
        </div>

        <div>
          <div style={{fontWeight:700,marginBottom:4}}>Pretraga</div>
          <input
            placeholder="Tekst pitanja…"
            onChange={(e) => setFilters(f => ({ ...f, q: e.target.value }))}
            onKeyDown={(e) => { if (e.key === "Enter") load(); }}
          />
        </div>

        <button className="btn btn-blue" onClick={load}>Primijeni</button>
       </div>

      {err && <div className="error" style={{marginBottom:12}}>{err}</div>}
      {loading ? <div>Učitavanje…</div> : null}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Tekst</th>
              <th>Kviz</th>
              <th>Tip</th>
              <th>Redosled</th>
              <th style={{width:180}}>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan="5">Nema zapisa.</td></tr>
            )}
            {items.map(row => (
              <tr key={row.id}>
                <td>{row.text}</td>
                <td>{row.quizTitle || "-"}</td>
                <td>{TYPE_LABELS[(row.type?.[0] === row.type?.[0]?.toUpperCase()) ? row.type : // može stići front
                    (row.type === "single" ? "SingleChoice" :
                     row.type === "multiple" ? "MultipleChoice" :
                     row.type === "boolean" ? "TrueFalse" : "FillInTheBlank")]}</td>
                <td>{row.order ?? "-"}</td>
                <td>
                  <button className="btn btn-sm btn-amber"  onClick={() => nav(`/admin/questions/${row.id}/edit`)}>Uredi</button>
                  &nbsp;
                  <button className="btn btn-sm btn-red"  onClick={() => onDelete(row.id)}>Izbriši</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
