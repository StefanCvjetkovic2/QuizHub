// src/pages/Admin/QuizEdit.jsx
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getAdminQuiz } from "../../services/quizzes";
import { getAdminCategories } from "../../services/categories";
import { updateAdminQuiz } from "../../services/quizzes";

export default function AdminQuizEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(300);
  const [difficulty, setDifficulty] = useState(0);

  const [categories, setCategories] = useState([]);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr(""); setOk("");
        const q = await getAdminQuiz(id);
        if (q) {
          setTitle(q.title || "");
          setCategoryId(q.categoryId?.toString() || "");
          setDescription(q.description || "");
          setTimeLimitSeconds(q.timeLimitSeconds ?? 300);
          setDifficulty(q.difficulty ?? 0);
        }
        const cats = await getAdminCategories();
        setCategories(cats || []);
      } catch (e) {
        setErr(e.message || "Greška pri učitavanju.");
      }
    })();
  }, [id]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(""); setOk("");

    if (!title.trim()) return setErr("Naslov je obavezan.");
    if (!categoryId) return setErr("Odaberi kategoriju.");
    if (!timeLimitSeconds || Number(timeLimitSeconds) <= 0)
      return setErr("Vrijeme mora biti veće od 0.");

    try {
      setBusy(true);
      const res = await updateAdminQuiz(id, {
        title,
        categoryId,
        description,
        timeLimitSeconds,
        difficulty,
      });

      if (!res?.success) throw new Error(res?.message || "Ažuriranje nije uspjelo.");
      setOk("Sačuvano.");
      // po želji: navigate(-1) ili na listu
      // navigate("/admin/quizzes");
    } catch (e) {
      setErr(e.message || "Ažuriranje nije uspjelo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>
      <div className="admin-header">
        <h1>Izmijeni kviz</h1>
        <Link to="/admin/quizzes" className="btn btn--outline">← Nazad</Link>
      </div>

      {err && <div className="error">{err}</div>}
      {ok && <div className="success">{ok}</div>}

      <form onSubmit={onSubmit} className="grid" style={{ gap: 14 }}>
        <div className="form-group">
          <label>Naslov</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Kategorija</label>
          <select value={categoryId} onChange={e=>setCategoryId(e.target.value)}>
            <option value="">(odaberi)</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Opis</label>
          <input value={description} onChange={e=>setDescription(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Vremensko ograničenje (sek.)</label>
          <input
            type="number"
            min={1}
            value={timeLimitSeconds}
            onChange={e=>setTimeLimitSeconds(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Težina</label>
          <select value={difficulty} onChange={e=>setDifficulty(Number(e.target.value))}>
            <option value={0}>Lako</option>
            <option value={1}>Srednje</option>
            <option value={2}>Teško</option>
          </select>
        </div>

        <div className="form-actions">
          <button className="btn btn--primary" disabled={busy}>
            {busy ? "Snimam..." : "Sačuvaj izmjene"}
          </button>
        </div>
      </form>
    </div>
  );
}
