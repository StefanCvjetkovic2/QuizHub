// src/pages/Admin/Categories.jsx
import { useEffect, useState } from "react";
import {
  getAdminCategories,
  createAdminCategory,
  deleteAdminCategory,
  // updateAdminCategory, // ostavljeno ako poželiš rename kasnije
} from "../../services/categories";

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // forma za dodavanje
  const [name, setName] = useState("");

  async function load() {
    try {
      setBusy(true);
      setErr("");
      const data = await getAdminCategories();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Greška pri učitavanju kategorija.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onAdd(e) {
    e.preventDefault();
    try {
      setBusy(true);
      setErr("");
      await createAdminCategory(name);
      setName("");
      await load();
    } catch (e) {
      setErr(e.message || "Kreiranje nije uspjelo.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id) {
    if (!window.confirm("Obrisati kategoriju?")) return;
    try {
      setBusy(true);
      setErr("");
      await deleteAdminCategory(id);
      await load();
    } catch (e) {
      setErr(
        e.status === 409
          ? "Kategorija je u upotrebi u nekim kvizovima – ne može se obrisati."
          : e.message || "Brisanje nije uspjelo."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="admin-header">
        <h1>Kategorije</h1>
      </div>

      {err && <div className="error">{err}</div>}

      {/* Dodavanje nove kategorije */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h2>Dodaj kategoriju</h2>
        <form onSubmit={onAdd} className="admin-filters" style={{ marginTop: 8 }}>
          <input
            placeholder="Naziv kategorije"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="btn btn--primary" disabled={busy}>
            {busy ? "Dodajem..." : "Dodaj"}
          </button>
        </form>
      </div>

      {/* Lista kategorija */}
      <div className="table">
        <div className="table-row table-head" style={{ gridTemplateColumns: "120px 1fr 180px" }}>
          <div>ID</div>
          <div>Naziv</div>
          <div style={{ textAlign: "right" }}>Akcije</div>
        </div>

        {busy && items.length === 0 ? (
          <div className="muted" style={{ padding: 12 }}>Učitavanje…</div>
        ) : items.length === 0 ? (
          <div className="muted" style={{ padding: 12 }}>Nema kategorija.</div>
        ) : (
          items.map((c) => (
            <div
              key={c.id}
              className="table-row"
              style={{ gridTemplateColumns: "120px 1fr 180px" }}
            >
              <div className="col--nowrap">{c.id}</div>
              <div className="col--clamp">{c.name}</div>
              <div className="row-actions">
                {/* ostavi samo brisanje, rename može kasnije */}
                <button
                  className="btn btn--outline btn--sm"
                  onClick={() => onDelete(c.id)}
                  disabled={busy}
                >
                  Obriši
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
