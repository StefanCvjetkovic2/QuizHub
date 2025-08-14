import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createAdminQuiz } from "../../services/quizzes";
import { getAdminCategories } from "../../services/categories";

export default function AdminQuizCreate() {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [description, setDescription] = useState("");
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(300);
  const [difficulty, setDifficulty] = useState(0);

  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const list = await getAdminCategories();
        setCategories(list || []);
        if (!categoryId && list?.length) setCategoryId(String(list[0].id));
      } catch (e) {
        // ako nema endpointa još, ostavi ručni unos
        console.warn("Get categories failed:", e?.message);
      }
    })();
  }, []); // run once

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!title.trim()) return setErr("Naslov je obavezan.");
    if (!categoryId) return setErr("Izaberi kategoriju.");

    try {
      setBusy(true);
      const res = await createAdminQuiz({
        title,
        categoryId,
        description,
        timeLimitSeconds,
        difficulty,
      });
      if (!res?.success) throw new Error(res?.message || "Kreiranje nije uspelo.");
      navigate("/admin/quizzes", { replace: true });
    } catch (e) {
      setErr(e.message || "Greška.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="admin-header">
        <h1>Kreiraj kviz</h1>
        <Link to="/admin/quizzes" className="btn btn--outline">← Nazad na listu</Link>
      </div>

      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Naslov</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Kategorija</label>
          {categories.length > 0 ? (
            <select value={categoryId} onChange={e=>setCategoryId(e.target.value)}>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          ) : (
            <input
              value={categoryId}
              onChange={e=>setCategoryId(e.target.value)}
              placeholder="Unesi ID kategorije (privremeno)"
            />
          )}
        </div>

        <div className="form-group">
          <label>Opis (opciono)</label>
          <input value={description} onChange={e=>setDescription(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Vremensko ograničenje (sek.)</label>
          <input type="number" min={30} value={timeLimitSeconds} onChange={e=>setTimeLimitSeconds(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Težina</label>
          <select value={difficulty} onChange={e=>setDifficulty(e.target.value)}>
            <option value={0}>Easy</option>
            <option value={1}>Medium</option>
            <option value={2}>Hard</option>
          </select>
        </div>

        <div className="form-actions">
          <button className="btn btn--primary" disabled={busy}>
            {busy ? "Kreiram..." : "Kreiraj kviz"}
          </button>
        </div>
      </form>

      {err && <div className="error" style={{marginTop:12}}>{err}</div>}
    </>
  );
}
