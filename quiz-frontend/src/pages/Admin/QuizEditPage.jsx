import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getQuizDetail, updateQuiz } from "@/services/quizService.js";
import { listCategories } from "@/services/categoryService.js";

export default function QuizEditPage() {
  const { quizId } = useParams();
  const nav = useNavigate();

  const [form, setForm] = useState({
    naziv: "",
    opis: "",
    categoryId: "",          // obavezno
    difficulty: "",          // obavezno
    timeLimitSeconds: "",    // obavezno (>0)
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        const cats = await listCategories();
        setCategories(cats);

        const q = await getQuizDetail(quizId);

        setForm({
          naziv: q.title ?? q.naziv ?? "",
          opis: q.description ?? q.opis ?? "",
          categoryId: String(q.categoryId ?? q.kategorijaId ?? ""),
          difficulty:
            q.difficulty != null
              ? String(q.difficulty)
              : q.tezina != null
              ? String(q.tezina)
              : "",
          timeLimitSeconds:
            String(
              q.timeLimitSeconds ??
                q.vremenskoOgranicenje ??
                q.vremenskoOgranicenjeSeconds ??
                ""
            ),
        });
      } catch (e) {
        setError(
          e?.response?.data?.message ||
            e?.message ||
            "Neuspjelo učitavanje detalja kviza."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // front validacija prema backend pravilima:
  const valid =
    form.naziv.trim().length > 0 &&
    Number.parseInt(form.categoryId, 10) > 0 &&
    Number.parseInt(form.difficulty, 10) >= 0 &&
    Number.parseInt(form.timeLimitSeconds, 10) > 0;

  const canSave = useMemo(() => valid && !saving, [valid, saving]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;

    setSaving(true);
    setError("");

    try {
      await updateQuiz(quizId, form);
      nav("/admin"); // nazad na listu kvizova
    }  catch (e) {
  const errors = e?.response?.data?.errors;
  if (errors && typeof errors === "object") {
    const firstKey = Object.keys(errors)[0];
    const firstMsg = Array.isArray(errors[firstKey]) ? errors[firstKey][0] : String(errors[firstKey]);
    setError(`${firstKey}: ${firstMsg}`);
  } else {
    setError(e?.response?.data?.message || e?.message || "Greška pri čuvanju kviza.");
  }

} finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Učitavanje…</div>;

  return (
    <div className="card" style={{ maxWidth: 900 }}>
      <h2 style={{ marginBottom: 16 }}>Uredi kviz</h2>

      {error && (
        <div className="error" style={{ marginBottom: 12 }}>
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="form">
        <div className="form-group">
          <label>
            Naziv <span style={{ color: "#ffb703" }}>*</span>
          </label>
          <input
            name="naziv"
            value={form.naziv}
            onChange={onChange}
            placeholder="Naziv kviza"
          />
        </div>

        <div className="form-group">
          <label>Opis</label>
          <textarea
            rows={5}
            name="opis"
            value={form.opis}
            onChange={onChange}
            placeholder="Kratak opis kviza"
          />
        </div>

        <div
          className="form-row"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            alignItems: "end",
          }}
        >
          <div className="form-group">
            <label>
              Kategorija <span style={{ color: "#ffb703" }}>*</span>
            </label>
            <select
              name="categoryId"
              className="select-like"
              value={form.categoryId}
              onChange={onChange}
            >
              <option value="">— odaberi kategoriju —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Težina <span style={{ color: "#ffb703" }}>*</span>
            </label>
            <select
              name="difficulty"
              className="select-like"
              value={form.difficulty}
              onChange={onChange}
            >
              <option value="">Odaberi težinu</option>
              <option value="1">lako</option>
              <option value="2">srednje</option>
              <option value="3">teško</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ maxWidth: 320 }}>
          <label>
            Vremensko ograničenje (sekunde){" "}
            <span style={{ color: "#ffb703" }}>*</span>
          </label>
          <input
            type="number"
            name="timeLimitSeconds"
            min="1"
            value={form.timeLimitSeconds}
            onChange={onChange}
            placeholder="npr. 300"
          />
          <small style={{ opacity: 0.8 }}>
            Backend zahtijeva vrijednost &gt; 0.
          </small>
        </div>

        <div className="form-actions" style={{ marginTop: 16 }}>
          <button className="btn btn-blue" disabled={!canSave}>
            {saving ? "Čuvam…" : "Sačuvaj"}
          </button>
          <button
            type="button"
            className="btn btn-amber"
            onClick={() => nav("/admin")}
            style={{ marginLeft: 8 }}
          >
            Otkaži
          </button>
        </div>
      </form>
    </div>
  );
}
