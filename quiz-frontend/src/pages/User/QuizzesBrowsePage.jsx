import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listPublicCategories } from "@/services/publicCategoryService";
import { listPublicQuizzes, getPublicQuizQuestionsCount } from "@/services/quizPublicService";

import QuizFilters from "@/components/User/Quizzes/QuizFilters";
import QuizGrid from "@/components/User/Quizzes/QuizGrid";

export default function QuizzesBrowsePage() {
  const nav = useNavigate();

  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ q: "", categoryId: "", difficulty: "" });

  const [items, setItems] = useState([]);       // [{ id, title, description, ... , questionCount }]
  const [loading, setLoading] = useState(false);

  // cache za broj pitanja da ne lupamo detalj kviza više puta
  const countsCacheRef = useRef(new Map());

  useEffect(() => {
    (async () => {
      try {
        const cats = await listPublicCategories({ onlyUsed: true });
        setCategories(cats);
      } catch {}
      await apply(); // inicijalno punjenje
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apply = async () => {
    setLoading(true);
    try {
      const res = await listPublicQuizzes({
        q: filters.q,
        categoryId: filters.categoryId || undefined,
        difficulty: filters.difficulty || undefined,
        page: 1,
        pageSize: 12,
      });

      // prikaži odmah (ako BE pošalje questionCount super)
      setItems(res.items.map(q => ({ ...q, questionCount: q.questionCount ?? 0 })));

      // dopuni precizan broj pitanja paralelno
      const counts = await Promise.all(
        res.items.map(async (q) => {
          const cached = countsCacheRef.current.get(q.id);
          if (typeof cached === "number") return cached;
          try {
            const c = await getPublicQuizQuestionsCount(q.id);
            countsCacheRef.current.set(q.id, c);
            return c;
          } catch {
            return q.questionCount ?? 0;
          }
        })
      );

      setItems(prev => prev.map((q, i) => ({ ...q, questionCount: counts[i] })));
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    setFilters({ q: "", categoryId: "", difficulty: "" });
    setItems([]);
    await apply();
  };

  // Handleri za filtere (prosljeđuju se u komponentu)
  const onQChange          = (e) => setFilters(f => ({ ...f, q: e.target.value }));
  const onCategoryChange   = (e) => setFilters(f => ({ ...f, categoryId: e.target.value }));
  const onDifficultyChange = (e) => setFilters(f => ({ ...f, difficulty: e.target.value }));

  const content = useMemo(() => items, [items]); // samo radi stabilnosti propsa

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>Istraži kvizove</h1>

      <QuizFilters
        q={filters.q}
        onQChange={onQChange}
        categoryId={filters.categoryId}
        onCategoryChange={onCategoryChange}
        difficulty={filters.difficulty}
        onDifficultyChange={onDifficultyChange}
        categories={categories}
        onApply={apply}
        onReset={reset}
      />

      <QuizGrid
        items={content}
        loading={loading}
        onStart={(id) => nav(`/quizzes/${id}`)}
      />
    </div>
  );
}



