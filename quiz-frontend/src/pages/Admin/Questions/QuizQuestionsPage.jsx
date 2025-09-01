import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getQuizDetail } from "../../../services/quizService";
import { deleteQuestion } from "../../../services/questionsService";
import QuestionsTable from "../../../components/Admin/Questions/QuestionsTable";

export default function QuizQuestionsPage() {
  const { quizId } = useParams();
  const nav = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true); setErr("");
    try {
      const data = await getQuizDetail(quizId);
      setQuiz(data);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Neuspjelo učitavanje.");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [quizId]);

  const onDelete = async (qid) => {
    if (!window.confirm("Obrisati pitanje?")) return;
    try {
      await deleteQuestion(qid);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Brisanje nije uspjelo.");
    }
  };

  // sortiraj za prikaz
  const itemsSorted = useMemo(() => {
    const arr = Array.isArray(quiz?.questions) ? [...quiz.questions] : [];
    return arr.sort((a,b) => (a.order ?? 0) - (b.order ?? 0));
  }, [quiz]);

  // izračunaj nextOrder iz već učitanih pitanja
  const nextOrder = useMemo(() => {
    const max = itemsSorted.reduce((m,q) => Math.max(m, Number.isFinite(q.order) ? q.order : 0), 0);
    return (max || itemsSorted.length) + 1;
  }, [itemsSorted]);

  return (
    <div>
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12}}>
        <h2 style={{fontSize:22, fontWeight:800}}>Pitanja za kviz</h2>
        <div style={{display:"flex", gap:8}}>
          <Link
            className="btn btn-blue"
            to={`/admin/quizzes/${quizId}/questions/new`}
            state={{ nextOrder }}                 // <— PROSLEĐUJEMO
          >
            + Dodaj pitanje
          </Link>
          <Link className="btn btn-amber" to="/admin">Nazad na kvizove</Link>
        </div>
      </div>

      {quiz && (
        <div style={{marginBottom:10}}>
          <strong>{quiz.title ?? quiz.naziv ?? quiz.name}</strong>
          {quiz.description || quiz.opis ? <div style={{opacity:.8}}>{quiz.description ?? quiz.opis}</div> : null}
        </div>
      )}

      {err && <div className="error">{err}</div>}

      <QuestionsTable
        loading={loading}
        items={itemsSorted}
        onEdit={(questionId) => nav(`/admin/quizzes/${quizId}/questions/${questionId}/edit`)}
        onDelete={onDelete}
      />
    </div>
  );
}
