// src/pages/Admin/QuizzesAdminPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { listQuizzes, deleteQuiz } from "../../services/quizService";
import { listCategories } from "../../services/categoryService";
import { getQuestionsCountForQuiz } from "../../services/questionsService"; // ⬅️ NOVO
import QuizzesFilters from "../../components/Admin/Quizzes/QuizzesFilters";
import QuizzesTable from "../../components/Admin/Quizzes/QuizzesTable";

export default function QuizzesAdminPage() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(false);

  // (opciono) mali cache da ne ponavljamo pozive kad se filteri ne menjaju
  const countsCacheRef = useRef(new Map());

  useEffect(() => {
    (async () => {
      try { setCategories(await listCategories()); } catch {}
      await applyFilters();
    })();
  }, []);

  const applyFilters = async () => {
    setLoading(true);
    try {
      const data = await listQuizzes({
        q,
        categoryId: categoryId || undefined,
        difficulty: difficulty || undefined,
      });

      // prikaži tabelu odmah, sa 0 kao privremenim brojem
      setItems(data.map(x => ({ ...x, questionCount: x.questionCount ?? 0 })));

      // povuci brojeve pitanja paralelno
      const counts = await Promise.all(
        data.map(async kviz => {
          const cached = countsCacheRef.current.get(kviz.id);
          if (typeof cached === "number") return cached;
          try {
            const c = await getQuestionsCountForQuiz(kviz.id);
            countsCacheRef.current.set(kviz.id, c);
            return c;
          } catch {
            return 0;
          }
        })
      );

      // upiši u state
      setItems(prev =>
        prev.map((kviz, idx) => ({ ...kviz, questionCount: counts[idx] }))
      );
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = async () => {
    setQ(""); setCategoryId(""); setDifficulty("");
    await applyFilters();
  };

  const onDelete = async (id) => {
    if (!window.confirm("Da li sigurno želiš obrisati kviz?")) return;
    await deleteQuiz(id);
    setItems(prev => prev.filter(x => x.id !== id));
    countsCacheRef.current.delete(id);
  };

  return (
    <div>
      <QuizzesFilters
        q={q} onQChange={(e)=>setQ(e.target.value)}
        categoryId={categoryId} onCategoryChange={(e)=>setCategoryId(e.target.value)}
        difficulty={difficulty} onDifficultyChange={(e)=>setDifficulty(e.target.value)}
        categories={categories}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      <QuizzesTable
        items={items}
        loading={loading}
        onCreateQuestion={(id)=>nav(`/admin/quizzes/${id}/questions/new`)}
        onQuestions={(id)=>nav(`/admin/quizzes/${id}/questions`)}
        onEdit={(id)=>nav(`/admin/quizzes/${id}/edit`)}
        onDelete={onDelete}
      />
    </div>
  );
}
