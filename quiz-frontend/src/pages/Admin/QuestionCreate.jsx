import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminQuizzes } from "../../services/quizzes";
import { createQuestion } from "../../services/questions";

export default function AdminQuestionCreate() {
  const [quizzes, setQuizzes] = useState([]);
  const [quizId, setQuizId] = useState("");
  const [type, setType] = useState("SingleChoice");
  const [text, setText] = useState("");
  const [order, setOrder] = useState(1);
  const [options, setOptions] = useState([{ text:"", correct:false }]);
  const [tfAnswer, setTfAnswer] = useState("true");
  const [fill, setFill] = useState([""]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const nav = useNavigate();

  useEffect(()=>{
    (async ()=>{
      const res = await getAdminQuizzes({ page:1, pageSize:100 });
      setQuizzes(res.items || []);
    })();
  },[]);

  const addOpt=()=>setOptions(o=>[...o,{text:"",correct:false}]);
  const setOpt=(i,p)=>setOptions(o=>o.map((x,idx)=>idx===i?{...x,...p}:x));
  const remOpt=(i)=>setOptions(o=>o.filter((_,idx)=>idx!==i));

  const addFill=()=>setFill(a=>[...a,""]);
  const setFillAt=(i,v)=>setFill(a=>a.map((x,idx)=>idx===i?v:x));
  const remFill=(i)=>setFill(a=>a.filter((_,idx)=>idx!==i));

  async function onSubmit(e){
    e.preventDefault();
    setMsg("");
    if(!quizId) return setMsg("Izaberi kviz.");
    if(!text.trim()) return setMsg("Unesi tekst pitanja.");

    let answers=[];
    if(type==="SingleChoice"||type==="MultipleChoice"){
      const clean=options.map(o=>({text:o.text.trim(), isCorrect:!!o.correct})).filter(o=>o.text);
      if(clean.length<2) return setMsg("Dodaj bar dvije opcije.");
      if(type==="SingleChoice" && clean.filter(o=>o.isCorrect).length!==1) return setMsg("Za 'Jedan tačan' označi tačno jednu opciju.");
      if(type==="MultipleChoice" && clean.filter(o=>o.isCorrect).length<1) return setMsg("Za 'Višestruki' označi bar jednu tačnu.");
      answers=clean;
    }
    if(type==="TrueFalse"){
      const val = tfAnswer==="true";
      answers=[{text:"Tačno", isCorrect:val},{text:"Netačno", isCorrect:!val}];
    }
    if(type==="FillInTheBlank"){
      const clean = fill.map(s=>s.trim()).filter(Boolean);
      if(clean.length<1) return setMsg("Dodaj bar jedan tačan unos.");
      answers = clean.map(t=>({text:t, isCorrect:true}));
    }

    try{
      setBusy(true);
      const res = await createQuestion({ quizId, text, type, order:Number(order)||0, answers });
      if(!res?.success) throw new Error(res?.message || "Nije sačuvano.");
      nav(`/admin/quizzes/${quizId}/questions`);
    }catch(err){
      setMsg(err.message || "Greška.");
    }finally{
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 800 }}>
      <h1>Kreiraj pitanje</h1>
      {msg && <div className={msg.startsWith("Sačuvano")?"success":"error"}>{msg}</div>}

      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Kviz</label>
          <select className="select-like" value={quizId} onChange={e=>setQuizId(e.target.value)}>
            <option value="">— izaberi kviz —</option>
            {quizzes.map(q=> <option key={q.id} value={q.id}>{q.title}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Tekst pitanja</label>
          <input value={text} onChange={e=>setText(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Tip</label>
          <select className="select-like" value={type} onChange={e=>setType(e.target.value)}>
            <option value="SingleChoice">Jedan tačan</option>
            <option value="MultipleChoice">Višestruki tačni</option>
            <option value="TrueFalse">Tačno/Netačno</option>
            <option value="FillInTheBlank">Unos teksta</option>
          </select>
        </div>

        <div className="form-group">
          <label>Pozicija (order)</label>
          <input type="number" min="0" value={order} onChange={e=>setOrder(e.target.value)} />
        </div>

        {(type==="SingleChoice"||type==="MultipleChoice") && (
          <div className="form-group">
            <label>Opcije</label>
            {options.map((op,i)=>(
              <div key={i} style={{display:"flex",gap:8,marginBottom:6}}>
                <input placeholder={`Opcija ${i+1}`} value={op.text}
                       onChange={e=>setOpt(i,{text:e.target.value})} style={{flex:1}} />
                <label style={{display:"flex",alignItems:"center",gap:6}}>
                  <input type="checkbox" checked={op.correct}
                         onChange={e=>setOpt(i,{correct:e.target.checked})}/>
                  tačno
                </label>
                <button type="button" className="btn btn--outline" onClick={()=>remOpt(i)}>Ukloni</button>
              </div>
            ))}
            <button type="button" className="btn btn--outline" onClick={addOpt}>+ Dodaj opciju</button>
          </div>
        )}

        {type==="TrueFalse" && (
          <div className="form-group">
            <label>Tačan odgovor</label>
            <select className="select-like" value={tfAnswer} onChange={e=>setTfAnswer(e.target.value)}>
              <option value="true">Tačno</option>
              <option value="false">Netačno</option>
            </select>
          </div>
        )}

        {type==="FillInTheBlank" && (
          <div className="form-group">
            <label>Prihvaćeni odgovori</label>
            {fill.map((s,i)=>(
              <div key={i} style={{display:"flex",gap:8,marginBottom:6}}>
                <input value={s} onChange={e=>setFillAt(i,e.target.value)} style={{flex:1}} />
                <button type="button" className="btn btn--outline" onClick={()=>remFill(i)}>Ukloni</button>
              </div>
            ))}
            <button type="button" className="btn btn--outline" onClick={addFill}>+ Dodaj odgovor</button>
          </div>
        )}

        <div className="form-actions">
          <button className="btn btn--primary" disabled={busy}>
            {busy ? "Čuvam…" : "Sačuvaj pitanje"}
          </button>
        </div>
      </form>
    </div>
  );
}
