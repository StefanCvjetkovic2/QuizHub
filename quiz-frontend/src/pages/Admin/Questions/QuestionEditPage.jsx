// src/pages/Admin/Questions/QuestionEditPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getQuizzesAdmin } from "@/services/quizService.js";
import { getQuestion, updateQuestion } from "@/services/questionsService.js";
import QuestionForm from "@/components/Admin/Questions/QuestionForm.jsx";

export default function QuestionEditPage() {
  const { questionId } = useParams();
  const nav = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [initial, setInitial] = useState(null);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    (async () => {
      const [qres, kres] = await Promise.all([
        getQuestion(questionId),
        getQuizzesAdmin({ page: 1, pageSize: 100 }),
      ]);
      setInitial(qres);
      setQuizzes(kres.items ?? kres);
    })();
  }, [questionId]);

  const handleSubmit = async (form) => {
    setSaving(true); setServerError("");
    try {
      const res = await updateQuestion(questionId, form); // servis normalizuje i šalje answers
      if (!res?.success) throw new Error(res?.message || "Ažuriranje nije uspjelo.");
      nav("/admin/questions");
    } catch (e) {
      setServerError(e?.message || "Greška pri snimanju.");
    } finally {
      setSaving(false);
    }
  };

  if (!initial) return <div>Učitavanje…</div>;

  return (
    <>
      <h2 style={{ marginBottom: 12 }}>Uredi pitanje</h2>
      <QuestionForm
        quizzes={quizzes}
        initialValues={initial}
        submitting={saving}
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => nav("/admin/questions")}
      />
    </>
  );
}
