import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getResultSummary, getResultDetails, listMyResults } from "@/services/resultsService";
import { getPublicQuizDetail } from "@/services/quizPublicService";
import { buildDetailsByQid } from "@/utils/resultsDetails";
import { normalizeType } from "@/models/quizModels";
import ResultHeader from "@/components/User/Results/ResultHeader";
import ResultQuestionCard from "@/components/User/Results/ResultQuestionCard";
import ResultProgressChart from "@/components/User/Results/ResultProgressChart";

export default function ResultDetailsPage() {
  const { resultId } = useParams();
  const nav = useNavigate();

  const [summary, setSummary] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [detailsMap, setDetailsMap] = useState(new Map());
  const [attempts, setAttempts] = useState([]); // za grafikon
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const sum = await getResultSummary(resultId);
        if (!sum) throw new Error("Rezultat nije pronađen.");

        setSummary(sum);

        // pitanja kviza
        const quiz = await getPublicQuizDetail(sum.quizId);
        setQuestions(quiz.questions || []);

        // detalji po pitanju
        const perQ = await getResultDetails(resultId);
        setDetailsMap(buildDetailsByQid({ details: perQ }));

        // napredak — svi moji pokušaji za ovaj kviz
        const all = await listMyResults({ page: 1, pageSize: 100 });
        const mineForQuiz = (all.items || [])
          .filter(x => x.quizId === sum.quizId)
          .sort((a, b) => new Date(a.dateTaken) - new Date(b.dateTaken));
        setAttempts(mineForQuiz);
      } catch (e) {
        setErr(e.message || "Greška pri učitavanju rezultata.");
      } finally {
        setLoading(false);
      }
    })();
  }, [resultId]);

  const rows = useMemo(() => {
    return questions.map((q, idx) => {
      const qid = String(q.id);
      const type = normalizeType(q.type);
      const det = detailsMap.get(qid);

      const correctIds = det?.correctIds?.size
        ? det.correctIds
        : new Set((q.answers || []).filter(a => a.isCorrect).map(a => String(a.id)));

      let correctTexts = det?.correctTexts?.length
        ? det.correctTexts
        : (q.answers || [])
            .filter(a => correctIds.has(String(a.id)))
            .map(a => a.text)
            .filter(Boolean);

      const userIds = det?.userIds ?? new Set();
      const userText = det?.userText ?? "";

      const userSelectedTexts = (() => {
        const ids = Array.from(userIds);
        if (ids.length > 0) {
          return (q.answers || [])
            .filter(a => ids.includes(String(a.id)))
            .map(a => a.text)
            .filter(Boolean);
        }
        if (type === "text") return [userText || ""];
        return [];
      })();

      const correct = det?.correct ?? false;

      return {
        index: idx + 1,
        q,
        type,
        correct,
        correctIds,
        correctTexts,
        userIds,
        userText,
        userSelectedTexts,
      };
    });
  }, [questions, detailsMap]);

  if (loading) return <div className="muted">Učitavanje…</div>;
  if (err) return <div className="error">{err}</div>;
  if (!summary) {
    return (
      <div className="card">
        <div className="muted">Rezultat nije pronađen.</div>
        <Link className="btn btn-blue" to="/my-results">Nazad</Link>
      </div>
    );
  }

  const total = questions.length;
  const correctCount = summary.score ?? summary.correct ?? 0;
  const percentage = summary.percentage ?? (total ? Math.round((correctCount * 100) / total) : 0);

  return (
    <div>
      <ResultHeader
        title={summary.quizTitle || "Rezultat kviza"}
        total={total}
        correctCount={correctCount}
        percentage={percentage}
        onRepeat={() => nav(`/quizzes/${summary.quizId}`)}
        exitHref="/my-results"
      />

      {/* Vreme trajanja */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="muted">Vreme trajanja</div>
        <div style={{ fontWeight: 800 }}>
          {summary.timeTakenSeconds != null ? `${Math.floor(summary.timeTakenSeconds/60)}:${String(summary.timeTakenSeconds%60).padStart(2,"0")}` : "—"}
        </div>
      </div>

      {/* Grafikon napretka (ako ima više pokušaja) */}
      <ResultProgressChart attempts={attempts} />

      {/* Lista pitanja i odgovori */}
      <div style={{ display: "grid", gap: 14 }}>
        {rows.map((row) => (
          <ResultQuestionCard key={row.q.id} row={row} />
        ))}
      </div>
    </div>
  );
}
