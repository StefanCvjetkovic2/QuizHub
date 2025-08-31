// src/pages/Admin/Questions/QuestionNewPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { getQuizzesAdmin } from "@/services/quizService.js";
import { createQuestion, getNextOrderForQuiz } from "@/services/questionsService.js";
import QuestionForm from "@/components/Admin/Questions/QuestionForm.jsx";

export default function QuestionNewPage() {
  const nav = useNavigate();
  const { quizId: routeQuizId } = useParams();        // ako dolaziš sa /admin/quizzes/:quizId/questions/new
  const [sp] = useSearchParams();                     // ili ?quizId=
  const prefillQuizId = routeQuizId || sp.get("quizId") || "";

  const [quizzes, setQuizzes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    (async () => {
      const data = await getQuizzesAdmin({ page: 1, pageSize: 100 });
      setQuizzes(data.items ?? data);
    })();
  }, []);

  const handleSubmit = async (form) => {
    setSaving(true); setServerError("");
    try {
      const quizId = form.quizId || prefillQuizId;
      if (!quizId) throw new Error("Izaberi kviz.");

      // auto-order: uzmi total+1
      const nextOrder = await getNextOrderForQuiz(quizId);

      const dto = { ...form, quizId, order: nextOrder };
      const res = await createQuestion(dto);
      if (!res?.success) throw new Error(res?.message || "Kreiranje nije uspjelo.");

      nav("/admin/questions");
    } catch (e) {
      setServerError(e?.message || "Greška pri snimanju.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h2 style={{ marginBottom: 12 }}>Dodaj pitanje</h2>
      <QuestionForm
        quizzes={quizzes}
        initialValues={{ quizId: prefillQuizId, type: "SingleChoice", order: 0, answers: [] }}
        submitting={saving}
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => nav("/admin/questions")}
      />
    </>
  );
}
