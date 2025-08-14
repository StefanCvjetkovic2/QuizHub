import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAdminQuiz } from "../../services/quizzes";
import { createAdminQuestion, deleteAdminQuestion } from "../../services/questions";

export default function AdminQuizQuestions() {
  const { id } = useParams(); // quizId
  const [quiz, setQuiz] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // forma
  const [text, setText] = useState("");
  const [type, setType] = useState("SingleChoice");
  const [order, setOrder] = useState(1);
  const [options, setOptions] = useState([{ text: "", correct: false }]);
  const [tfAnswer, setTfAnswer] = useState("true");
  const [fillAnswers, setFillAnswers] = useState([""]);

  const sortedQuestions = useMemo(
    () => (quiz?.questions || []).slice().sort((a,b)=>a.order-b.order),
    [quiz]
  );

  async function load() {
    try {
      setBusy(true); setErr("");
      const q = await getAdminQuiz(id);
      setQuiz(q || null);
      setOrder((q?.questions?.length || 0) + 1);
    } catch (e) {
      setErr(e.message || "Greška pri učitavanju.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, [id]);

  function addOption() { setOptions(o => [...o, { text: "", correct: false }]); }
  function removeOption(i) { setOptions(o => o.filter((_,idx)=>idx!==i)); }
  function setOption(i, patch) { setOptions(o => o.map((op,idx)=>idx===i ? {...op, ...patch} : op)); }

  function addFill() { setFillAnswers(a => [...a, ""]); }
  function removeFill(i) { setFillAnswers(a => a.filter((_,idx)=>idx!==i)); }
  function setFill(i, val) { setFillAnswers(a => a.map((x,idx)=>idx===i?val:x)); }

  async function onAddQuestion(e) {
    e.preventDefault();
    setErr("");
    if (!text.trim()) return setErr("Tekst pitanja je obavezan.");

    let answers = [];
    if (type === "SingleChoice" || type === "MultipleChoice") {
      const clean = options.map(o => ({ text: o.text.trim(), isCorrect: !!o.correct }))
                           .filter(o => o.text.length > 0);
      if (clean.length < 2) return setErr("Dodaj bar dvije opcije.");
      if (type === "SingleChoice" && clean.filter(o=>o.isCorrect).length !== 1)
        return setErr("Za 'Jedan tačan' označi tačno jednu opciju.");
      if (type === "MultipleChoice" && clean.filter(o=>o.isCorrect).length < 1)
        return setErr("Za 'Višestruki' označi bar jednu tačnu opciju.");
      answers = clean;
    }
    if (type === "TrueFalse") {
      const isTrue = tfAnswer === "true";
      answers = [
        { text: "Tačno", isCorrect: isTrue },
        { text: "Netačno", isCorrect: !isTrue },
      ];
    }
    if (type === "FillInTheBlank") {
      const clean = fillAnswers.map(s => s.trim()).filter(Boolean);
      if (clean.length < 1) return setErr("Dodaj bar jedan tačan unos.");
      answers = clean.map(t => ({ text: t, isCorrect: true }));
    }

    const payload = { quizId: id, text, type, order: Number(order)||0, answers };
    try {
      setBusy(true);
      const res = await createAdminQuestion(payload);
      if (!res?.success) throw new Error(res?.message || "Dodavanje nije uspjelo.");
      setText(""); setOptions([{ text:"", correct:false }]); setTfAnswer("true"); setFillAnswers([""]);
      setOrder((quiz?.questions?.length || 0) + 2);
      await load();
    } catch (e) {
      setErr(e.message || "Greška.");
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteQuestion(qid) {
    if (!window.confirm("Obrisati pitanje?")) return;
    try {
      await deleteAdminQuestion(qid);
      await load();
    } catch (e) {
      alert(e.message || "Brisanje nije uspjelo.");
    }
  }

  return (
    <>
      <div className="admin-header">
        <h1>Pitanja za: {quiz?.title || "..."}</h1>
        <Link to="/admin/quizzes" className="btn btn--outline">← Nazad</Link>
      </div>

      {err && <div className="error">{err}</div>}

      {/* Lista postojećih */}
      <div className="table" style={{marginBottom:16}}>
        <div className="table-row table-head">
          <div>#</div>
          <div>Tip</div>
          <div>Tekst</div>
          <div style={{textAlign:"right"}}>Akcije</div>
        </div>
        {(sortedQuestions || []).map(q => (
          <div key={q.id} className="table-row">
            <div>{q.order}</div>
            <div>{q.type}</div>
            <div>{q.text}</div>
            <div className="row-actions">
              <button className="btn btn--outline" onClick={()=>onDeleteQuestion(q.id)}>Obriši</button>
            </div>
          </div>
        ))}
        {(!quiz?.questions || quiz.questions.length===0) && (
          <div className="muted" style={{padding:12}}>Još nema pitanja.</div>
        )}
      </div>

      {/* Dodavanje novog */}
      <div className="card">
        <h2>Dodaj pitanje</h2>
        <form onSubmit={onAddQuestion}>
          <div className="form-group">
            <label>Tekst pitanja</label>
            <input value={text} onChange={e=>setText(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Tip</label>
            <select value={type} onChange={e=>setType(e.target.value)}>
              <option value="SingleChoice">Jedan tačan odgovor</option>
              <option value="MultipleChoice">Višestruki tačni odgovori</option>
              <option value="TrueFalse">Tačno / Netačno</option>
              <option value="FillInTheBlank">Unos teksta (fill in)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Pozicija (order)</label>
            <input type="number" min={0} value={order} onChange={e=>setOrder(e.target.value)} />
          </div>

          {(type === "SingleChoice" || type === "MultipleChoice") && (
            <div className="form-group">
              <label>Opcije</label>
              {options.map((op, i) => (
                <div key={i} style={{display:"flex", gap:8, marginBottom:6}}>
                  <input
                    placeholder={`Opcija ${i+1}`}
                    value={op.text}
                    onChange={e=>setOption(i,{text:e.target.value})}
                    style={{flex:1}}
                  />
                  <label style={{display:"flex", alignItems:"center", gap:6}}>
                    <input
                      type="checkbox"
                      checked={op.correct}
                      onChange={e=>setOption(i,{correct:e.target.checked})}
                    />
                    tačno
                  </label>
                  <button type="button" className="btn btn--outline" onClick={()=>removeOption(i)}>Ukloni</button>
                </div>
              ))}
              <button type="button" className="btn btn--outline" onClick={addOption}>+ Dodaj opciju</button>
            </div>
          )}

          {type === "TrueFalse" && (
            <div className="form-group">
              <label>Tačan odgovor</label>
              <select value={tfAnswer} onChange={e=>setTfAnswer(e.target.value)}>
                <option value="true">Tačno</option>
                <option value="false">Netačno</option>
              </select>
            </div>
          )}

          {type === "FillInTheBlank" && (
            <div className="form-group">
              <label>Prihvaćeni odgovori</label>
              {fillAnswers.map((s, i) => (
                <div key={i} style={{display:"flex", gap:8, marginBottom:6}}>
                  <input
                    placeholder={`Odgovor ${i+1}`}
                    value={s}
                    onChange={e=>setFill(i, e.target.value)}
                    style={{flex:1}}
                  />
                  <button type="button" className="btn btn--outline" onClick={()=>removeFill(i)}>Ukloni</button>
                </div>
              ))}
              <button type="button" className="btn btn--outline" onClick={addFill}>+ Dodaj odgovor</button>
            </div>
          )}

          <div className="form-actions">
            <button className="btn btn--primary" disabled={busy}>
              {busy ? "Dodajem..." : "Dodaj pitanje"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
