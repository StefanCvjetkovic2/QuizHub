// src/services/public.js
import http from "./http";

/** GET /api/Quizzes?page=&pageSize=&q=&categoryId=&difficulty= */
export async function getPublicQuizzes(params = {}) {
  const qp = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    q: params.q || undefined,
    categoryId: params.categoryId || undefined,
    difficulty: params.difficulty ?? undefined, // 0|1|2
  };
  const { data } = await http.get("/api/Quizzes", { params: qp });
  return data; // { page, pageSize, totalCount, items: [...] }
}

/** GET /api/Categories  (javna ruta — ako je nema, dropdown ostaje prazan) */
export async function getPublicCategories() {
  try {
    const { data } = await http.get("/api/Categories");
    return Array.isArray(data) ? data : [];
  } catch {
    return []; // ako još nema public endpoint, samo vrati prazno
  }
}
