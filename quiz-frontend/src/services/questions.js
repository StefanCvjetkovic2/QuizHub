import http from "./http";

// POST /api/admin/Questions
export async function createQuestion(payload) {
  try {
    const { data } = await http.post("/api/admin/Questions", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return data; // očekujemo { success, message, ... }
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.title ||
      err?.message ||
      "Greška pri kreiranju pitanja.";
    throw new Error(msg);
  }
}

// PUT /api/admin/Questions/{id}
// Ako payload.answers === null ili undefined -> backend NE mijenja odgovore (samo meta)
export async function updateAdminQuestion(id, payload) {
  const body = {
    text: payload.text?.trim() ?? "",
    type: payload.type,
    order: Number(payload.order) || 0,
    ...(payload.answers ? { answers: payload.answers } : {}),
  };

  try {
    const { data } = await http.put(`/api/admin/Questions/${id}`, body, {
      headers: { "Content-Type": "application/json" },
    });
    return data; // { success, message }
  } catch (err) {
    // uhvati ModelState i izbaci prvu poruku
    const errors = err?.response?.data?.errors;
    if (errors && typeof errors === "object") {
      const firstKey = Object.keys(errors)[0];
      const firstMsg = Array.isArray(errors[firstKey]) ? errors[firstKey][0] : String(errors[firstKey]);
      throw new Error(`${firstKey}: ${firstMsg}`);
    }
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.title ||
      err?.message ||
      "Greška pri ažuriranju pitanja.";
    throw new Error(msg);
  }
}


// DELETE /api/admin/Questions/{id}
export async function deleteAdminQuestion(id) {
  const { data } = await http.delete(`/api/admin/Questions/${id}`);
  return data;
}
