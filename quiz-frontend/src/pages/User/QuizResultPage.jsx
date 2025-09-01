import React, { useMemo } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { normalizeType } from "@/models/quizModels";
import { buildDetailsByQid } from "@/utils/resultsDetails";

import ResultHeader from "@/components/User/Results/ResultHeader";
import ResultQuestionCard from "@/components/User/Results/ResultQuestionCard";

export default function QuizResultPage() {
  const { quizId } = useParams();
  const nav = useNavigate();
  const { state } = useLocation() || {};

  const summary   = state?.summary;
  const quizTitle = state?.quizTitle || "Rezultat kviza";
  const questions = state?.quizQuestions || [];

  const detailsByQid = useMemo(() => buildDetailsByQid(summary), [summary]);

  const rows = useMemo(() => {
    return questions.map((q, idx) => {
      const qid = String(q.id);
      const type = normalizeType(q.type);

      const det = detailsByQid.get(qid);

      // tačni id-evi (iz BE ili fallback iz pitanja)
      const correctIds = det?.correctIds?.size
        ? det.correctIds
        : new Set((q.answers || []).filter(a => a.isCorrect).map(a => String(a.id)));

      // tačni tekstovi (iz BE ili izvedeni iz id-eva)
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
  }, [questions, detailsByQid]);

  if (!summary || !questions?.length) {
    return (
      <div className="card" style={{ maxWidth: 1000 }}>
        <h2 style={{ fontWeight: 900, marginBottom: 6 }}>Pregled rezultata</h2>
        <div className="muted" style={{ marginBottom: 12 }}>
          Nedostaju podaci o rezultatu. Vrati se na listu kvizova i pokreni kviz ponovo.
        </div>
        <Link className="btn btn-blue" to="/quizzes">Nazad na kvizove</Link>
      </div>
    );
  }

  const total = questions.length;
  const correctCount = summary?.correct ?? rows.filter(r => r.correct).length;
  const percentage = summary?.percentage != null
    ? summary.percentage
    : (total === 0 ? 0 : Math.round((correctCount * 100) / total));

  return (
    <div>
      <ResultHeader
        title={quizTitle}
        total={total}
        correctCount={correctCount}
        percentage={percentage}
        onRepeat={() => nav(`/quizzes/${quizId}`)}
        exitHref="/quizzes"
      />

      <div style={{ display: "grid", gap: 14 }}>
        {rows.map((row) => (
          <ResultQuestionCard key={row.q.id} row={row} />
        ))}
      </div>
    </div>
  );
}
