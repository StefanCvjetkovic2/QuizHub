import React from "react";

export default function QuizzesTable({
  items = [],
  loading = false,
  onCreateQuestion, // (id) => void
  onQuestions,
  onEdit,           // (id) => void
  onDelete,         // (id) => void
}) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Naziv</th>
            <th>Opis</th>
            <th>Broj pitanja</th>
            <th>Težina</th>
            <th>Vremensko ograničenje (s)</th>
            <th>Akcije</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={6} style={{textAlign:"center",padding:"24px"}}>Učitavanje…</td></tr>
          )}
          {!loading && items.length === 0 && (
            <tr><td colSpan={6} style={{textAlign:"center",padding:"24px"}}>Nema podataka.</td></tr>
          )}
          {!loading && items.map(qz => (
            <tr key={qz.id}>
              <td><strong>{qz.naziv}</strong></td>
              <td>{qz.opis}</td>
              <td>{qz.questionCount ?? qz.questions?.length ?? 0}</td>
              <td>{qz.tezina}</td>
              <td>{qz.vremenskoOgranicenje ?? "-"}</td>
              <td>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                  <button className="btn btn-blue"  onClick={() => onCreateQuestion(qz.id)}>Kreiraj pitanje</button>
                   <button className="btn btn-blue"  onClick={() => onQuestions(qz.id)}>Pitanja</button> {/* NOVO */}
                 <button className="btn btn-amber" onClick={() => onEdit(qz.id)}>Uredi</button>
 
                  <button className="btn btn-red"   onClick={() => onDelete(qz.id)}>Izbriši</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
