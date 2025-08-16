// src/services/categories.js
import http from "./http";

/** GET /api/admin/Categories */
export async function getAdminCategories() {
  const { data } = await http.get("/api/admin/Categories");
  return data; // [{ id, name }, ...]
}

/** POST /api/admin/Categories  body: { name } */
export async function createAdminCategory(name) {
  const body = { name: (name || "").trim() };
  if (!body.name) throw new Error("Naziv je obavezan.");
  try {
    const { data } = await http.post("/api/admin/Categories", body, {
      headers: { "Content-Type": "application/json" },
    });
    return data; // vraća kreirani objekat (ili {success,...} zavisno od backa)
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.title ||
      err?.message ||
      "Kreiranje nije uspjelo.";
    throw new Error(msg);
  }
}

/** PUT /api/admin/Categories/{id}  body: { id, name }  (opciono, ako poželiš rename) */
export async function updateAdminCategory(id, name) {
  const body = { id: Number(id), name: (name || "").trim() };
  if (!body.name) throw new Error("Naziv je obavezan.");
  try {
    const { data } = await http.put(`/api/admin/Categories/${id}`, body, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.title ||
      err?.message ||
      "Ažuriranje nije uspjelo.";
    throw new Error(msg);
  }
}

/** DELETE /api/admin/Categories/{id} */
export async function deleteAdminCategory(id) {
  try {
    const { data } = await http.delete(`/api/admin/Categories/${id}`);
    return data;
  } catch (err) {
    // ako backend vraća 409 kad je kategorija u upotrebi
    const status = err?.response?.status;
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.title ||
      (status === 409
        ? "Kategorija je u upotrebi u nekim kvizovima."
        : "Brisanje nije uspjelo.");
    const error = new Error(msg);
    error.status = status;
    throw error;
  }
}
export async function getCategories() {
  try {
    const { data } = await http.get("/api/Categories");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}