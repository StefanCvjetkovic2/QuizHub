import { useEffect, useMemo, useState } from "react";
import { getQuizzes } from "../../services/quizzes";
import { getCategories } from "../../services/categories";
import { Link } from "react-router-dom";

export default function UserQuizzesList() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  const [q, setQ] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const pages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  // pokuša public kategorije; ako nema API-ja, dropdown ćemo dopuniti iz prve stranice kvizova
  useEffect(() => {
    (async () => {
      try {
        const cats = await getCategories();
        if (cats && cats.length) setCategories(cats);
      } catch {/* ignore */}
    })();
  }, []);

  function deriveCategoriesFromItems(list) {
    const map = new Map();
    for (const x of list || []) {
      if (x.categoryId != null && x.categoryName) {
        map.set(x.categoryId, x.categoryName);
      }
    }
    const arr = Array.from(map, ([id, name]) => ({ id, name }));
    // ako već imamo public kategorije, ne pregazi — samo dopuni nove
    if (arr.length) {
      setCategories(prev => {
        const byId = new Map(prev.map(c => [c.id, c.name]));
        for (const c of arr) if (!byId.has(c.id)) byId.set(c.id, c.name);
        return Array.from(byId, ([id, name]) => ({ id, name }));
      });
    }
  }

  async function load() {
    try {
      setBusy(true); setErr("");
      const res = await getQuizzes({
        page,
        pageSize,
        q: q || undefined,
        difficulty: difficulty === "" ? undefined : Number(difficulty),
        categoryId: categoryId || undefined,
      });
      const list = res.items || [];
      setItems(list);
      setTotal(res.totalCount || 0);

      // ako nemamo public kategorije, izvedi ih iz liste
      if (!categories.length) deriveCategoriesFromItems(list);
    } catch (e) {
      setErr(e.message || "Greška pri učitavanju.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, pageSize, difficulty, categoryId]);

  function onSearch(e) {
    e.preventDefault();
    setPage(1);
    load();
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      <div className="admin-header">
        <h1>Dostupni kvizovi</h1>
      </div>

      <form onSubmit={onSearch} className="admin-filters">
        <input
          placeholder="Pretraga po nazivu/opisu"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
          <option value="">Sve kategorije</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
          <option value="">Sve težine</option>
          <option value="0">Lako</option>
          <option value="1">Srednje</option>
          <option value="2">Teško</option>
        </select>
        <button className="btn btn--outline">Pretraži</button>
      </form>

      {err && <div className="error">{err}</div>}

      <div className="table">
        <div className="table-row table-head cols-quiz">
          <div>Naslov</div>
          <div>Opis</div>
          <div>Kategorija</div>
          <div>Težina</div>
          <div>Vrijeme</div>
          <div>Pitanja</div>
          <div style={{ textAlign: "right" }}>Akcije</div>
        </div>

        {busy ? (
          <div className="muted" style={{ padding: 12 }}>Učitavanje…</div>
        ) : items.length === 0 ? (
          <div className="muted" style={{ padding: 12 }}>Nema rezultata.</div>
        ) : (
          items.map(qz => (
            <div key={qz.id} className="table-row cols-quiz">
              <div className="col--clamp">{qz.title || "-"}</div>
              <div className="col--clamp2">{qz.description || "-"}</div>
              <div className="col--nowrap">{qz.categoryName || "-"}</div>
              <div className="col--nowrap">
                <span className={`badge ${["b-easy","b-med","b-hard"][qz.difficulty] || ""}`}>
                  {["Lako","Srednje","Teško"][qz.difficulty] ?? qz.difficulty}
                </span>
              </div>
              <div className="col--nowrap">
                <span className="badge">{qz.timeLimitSeconds}s</span>
              </div>
              <div className="col--nowrap">
                <span className="badge">{qz.numberOfQuestions}</span>
              </div>
              <div className="row-actions">
               <Link className="btn btn--sm btn--primary" to={`/app/quiz/${qz.id}/start`}>Započni</Link>

              </div>
            </div>
          ))
        )}
      </div>

      <div className="pagination">
        <button className="btn btn--outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>←</button>
        <span>Strana {page} / {pages}</span>
        <button className="btn btn--outline" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>→</button>
      </div>
    </div>
  );
}
