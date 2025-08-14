import http from "./http";

/** Kreiranje pitanja (admin) */
export async function createQuestion (payload) {
  try {
    const { data } = await http.post("/api/admin/Questions", payload);
    return data; // { success, message, ... }
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.title ||
      err?.message ||
      "Greška pri kreiranju pitanja.";
    throw new Error(msg);
  }
}

/** Brisanje pitanja (admin) */
export async function deleteAdminQuestion(id) {
  const { data } = await http.delete(`/api/admin/Questions/${id}`);
  return data;
}

/* >>> Ako želiš da stari import ostane ispravan, eksportujemo i alias: */
export { createQuestion as createAdminQuestion };
