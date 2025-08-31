// src/pages/Admin/CategoryNewPage.jsx
import React, { useEffect, useState } from "react";
import {
  listCategories,
  createCategory,
  deleteCategory,
} from "../../services/categoryService";
import CategoryForm from "../../components/Admin/Categories/CategoryForm";
import CategoryList from "../../components/Admin/Categories/CategoryList";

export default function CategoryNewPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const load = async () => {
    setLoading(true);
    setServerError("");
    try {
      const cats = await listCategories();
      setItems(cats);
    } catch (e) {
      setServerError(
        e?.response?.data?.message || e.message || "Neuspjelo učitavanje."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (name) => {
    setServerError("");
    const trimmed = String(name || "").trim();
    if (!trimmed) {
      setServerError("Naziv je obavezan.");
      return false;
    }
    setSaving(true);
    try {
      const created = await createCategory(trimmed);
      setItems((prev) => [...prev, created]);
      return true;
    } catch (e) {
      const data = e?.response?.data;
      setServerError(
        data?.message || data?.title || "Kreiranje nije uspjelo."
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Obrisati kategoriju?")) return;
    try {
      await deleteCategory(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      // backend vraća 409 kad je kategorija u upotrebi
      const msg =
        e?.response?.data?.message ||
        e.message ||
        "Brisanje nije uspjelo.";
      alert(msg);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
        Kreiraj kategoriju
      </h2>

      <CategoryForm
        onCreate={handleCreate}
        submitting={saving}
        serverError={serverError}
      />

      <div style={{ marginTop: 20 }}>
        <CategoryList
          items={items}
          loading={loading}
          onDelete={handleDelete} // želiš li bez brisanja? skini ovu prop
        />
      </div>
    </div>
  );
}
