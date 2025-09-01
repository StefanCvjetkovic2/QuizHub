import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listPublicCategories } from "@/services/publicCategoryService";
import { listPublicQuizzes, getPublicQuizQuestionsCount } from "@/services/quizPublicService";

const diffLabel = (d) => (d === 1 ? "lako" : d === 2 ? "srednje" : d === 3 ? "teško" : "—");

export default function QuizzesBrowsePage() {
  const nav = useNavigate();

  const [categories, setCategories] = useState([]);
  const [state, setState] = useState({ q: "", categoryId: "", difficulty: "" });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // cache za broj pitanja (da ne zovemo detalj kviza više puta)
  const countsCacheRef = useRef(new Map());

  useEffect(() => {
    (async () => {
      try {
        const cats = await listPublicCategories({ onlyUsed: true });
        setCategories(cats);
      } catch {}
      await apply();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apply = async () => {
    setLoading(true);
    try {
      const res = await listPublicQuizzes({
        q: state.q,
        categoryId: state.categoryId || undefined,
        difficulty: state.difficulty || undefined,
        page: 1,
        pageSize: 12,
      });

      // prikaži odmah (ako BE već šalje questionCount, super)
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
    setState({ q: "", categoryId: "", difficulty: "" });
    setItems([]);
    await apply();
  };

  const content = useMemo(() => {
    if (loading) {
      return Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="card"
          style={{
            padding: 16,
            border: "1px solid rgba(148,163,184,.2)",
            borderRadius: 14,
            background: "rgba(30,41,59,.25)",
          }}
        >
          <div style={{ height: 18, width: "60%", background: "#fff1", borderRadius: 6, marginBottom: 8 }} />
          <div style={{ height: 12, width: "80%", background: "#fff1", borderRadius: 6, marginBottom: 6 }} />
          <div style={{ height: 12, width: "50%", background: "#fff1", borderRadius: 6, marginBottom: 12 }} />
          <button className="btn btn-blue" disabled>Pokreni kviz</button>
        </div>
      ));
    }
    if (!items.length) {
      return (
        <div className="muted" style={{ gridColumn: "1 / -1" }}>
          Nema rezultata za date filtere.
        </div>
      );
    }
    return items.map(q => (
      <div
        key={q.id}
        className="card"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: 16,
          border: "1px solid rgba(148,163,184,.25)",
          borderRadius: 14,
          background: "rgba(30,41,59,.30)",
          transition: "box-shadow .2s ease, transform .2s ease",
        }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,.25)")}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
      >
        <div style={{ fontWeight: 800, fontSize: 22 }}>{q.title || "Bez naziva"}</div>
        <div className="muted" style={{ minHeight: 44 }}>
          {q.description ? q.description : "Bez opisa."}
        </div>
        <div className="muted">
          {q.questionCount ?? 0} pitanja &nbsp; tezina: {diffLabel(q.difficulty)}
          {q.timeLimitSeconds ? ` · ${q.timeLimitSeconds}s` : ""}
        </div>
        <div style={{ marginTop: "auto" }}>
          <button
            className="btn btn-blue"
            onClick={() => nav(`/quizzes/${q.id}`)}
            style={{ width: "100%" }}
          >
            Pokreni kviz
          </button>
        </div>
      </div>
    ));
  }, [items, loading, nav]);

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>Istraži kvizove</h1>

      <div
        className="filters"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto auto", gap: 12, marginBottom: 16 }}
      >
        <input
          placeholder="npr. JavaScript"
          value={state.q}
          onChange={(e) => setState(s => ({ ...s, q: e.target.value }))}
        />
        <select
          value={state.categoryId}
          onChange={(e) => setState(s => ({ ...s, categoryId: e.target.value }))}
        >
          <option value="">Sve kategorije</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={state.difficulty}
          onChange={(e) => setState(s => ({ ...s, difficulty: e.target.value }))}
        >
          <option value="">Sve težine</option>
          <option value="1">Lako</option>
          <option value="2">Srednje</option>
          <option value="3">Teško</option>
        </select>
        <button className="btn btn-blue" onClick={apply}>Pretrazi</button>
        <button className="btn btn-amber" onClick={reset}>Reset</button>
      </div>

      <div
        className="grid-cards"
        style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}
      >
        {content}
      </div>
    </div>
  );
}
