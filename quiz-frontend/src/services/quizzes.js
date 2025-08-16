import http from "./http";

// GET /api/admin/Quizzes?page=&pageSize=&q=&categoryId=&difficulty=
export async function getAdminQuizzes(params = {}) {
  const qp = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    q: params.q || undefined,
    categoryId: params.categoryId || undefined,
    difficulty: params.difficulty ?? undefined, // 0|1|2
  };
  const { data } = await http.get("/api/admin/Quizzes", { params: qp });
  return data; // { page, pageSize, totalCount, items: [...] }
}

// POST /api/admin/Quizzes  (CreatedByUserId postavlja backend iz JWT-a)
export async function createAdminQuiz(payload) {
  const body = {
    title: payload.title,
    categoryId: Number(payload.categoryId),
    description: payload.description ?? "",
    timeLimitSeconds: Number(payload.timeLimitSeconds),
    difficulty: Number(payload.difficulty),
  };
  const { data } = await http.post("/api/admin/Quizzes", body, {
    headers: { "Content-Type": "application/json" },
  });
  return data; // { success, quizId, message }
}

// GET detail /api/admin/Quizzes/{id}
export async function getAdminQuiz(id) {
  const { data } = await http.get(`/api/admin/Quizzes/${id}`);
  return data;
}

// PUT /api/admin/Quizzes/{id}
export async function updateAdminQuiz(id, payload) {
  const body = {
    id,
    title: payload.title?.trim() ?? "",
    categoryId: Number(payload.categoryId),
    description: payload.description ?? null,
    timeLimitSeconds: Number(payload.timeLimitSeconds),
    difficulty: Number(payload.difficulty),
  };

  try {
    const { data } = await http.put(`/api/admin/Quizzes/${id}`, body);
    return data; // { success, message }
  } catch (err) {
    const errors = err?.response?.data?.errors;
    if (errors) {
      const first = Object.values(errors).flat()[0];
      throw new Error(first || "Neuspješno ažuriranje.");
    }
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.title ||
      err?.message ||
      "Neuspješno ažuriranje.";
    throw new Error(msg);
  }
}

// DELETE /api/admin/Quizzes/{id}
export async function deleteAdminQuiz(id) {
  const { data } = await http.delete(`/api/admin/Quizzes/${id}`);
  return data;
}
export async function getQuizzes(params = {}) {
  const qp = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 12,
    q: params.q || undefined,
    categoryId: params.categoryId || undefined,
    difficulty: params.difficulty ?? undefined, // 0|1|2
  };
  const { data } = await http.get("/api/Quizzes", { params: qp });
  return data; // { page, pageSize, totalCount, items: [...] }
}