import http from "./http";
import { mapQuiz } from "../models/quizModels";

const BASE = "/admin/quizzes";

// LIST
export async function listQuizzes({ page = 1, pageSize = 20, q = "", categoryId, difficulty } = {}) {
  const params = { page, pageSize };
  if (q && q.trim()) params.q = q.trim();
  if (categoryId) params.categoryId = categoryId;
  if (difficulty) params.difficulty = difficulty;

  const res = await http.get(BASE, { params });
  const items = Array.isArray(res.data) ? res.data : (res.data.items ?? res.data.data ?? []);
  return items.map(mapQuiz);
}

// DELETE
export async function deleteQuiz(id) {
  return (await http.delete(`${BASE}/${id}`)).data;
}

// CREATE
export function buildCreateQuizDto(model = {}) {
  const difficulty = model.difficulty != null && model.difficulty !== "" ? parseInt(model.difficulty, 10) : null;
  const timeRaw =
    model.timeLimitSeconds ??
    model.timeLimit ??
    model.vremenskoOgranicenje ??
    "";
  const timeLimitSeconds = timeRaw !== "" && timeRaw != null ? parseInt(timeRaw, 10) : null;
  const categoryId = model.categoryId != null && model.categoryId !== "" ? parseInt(model.categoryId, 10) : null;

  return {
    title: (model.naziv ?? "").trim(),
    description: model.opis ?? "",
    categoryId,
    difficulty,
    timeLimitSeconds,
    questions: [],
  };
}

export async function createQuiz(model) {
  const dto = buildCreateQuizDto(model);
  const res = await http.post(BASE, dto);
  return res.data;
}

// DETAIL
export async function getQuizDetail(id) {
  const res = await http.get(`${BASE}/${id}`);
  return res.data;
}

// UPDATE — svi obavezni kako backend traži
function buildUpdateQuizDto(model = {}) {
  const title = (model.naziv ?? "").trim();

  // categoryId mora biti > 0 (int)
  const categoryId = Number.parseInt(model.categoryId, 10) || 0;

  // difficulty može stići kao "1" ili "srednje"
  const difMap = { lako: 1, srednje: 2, teško: 3, tesko: 3 };
  let diffRaw = model.difficulty;
  let difficulty;

  if (typeof diffRaw === "string" && diffRaw.trim() !== "") {
    const n = Number.parseInt(diffRaw, 10);
    difficulty = Number.isNaN(n) ? (difMap[diffRaw.toLowerCase()] ?? 0) : n;
  } else {
    difficulty = Number.parseInt(diffRaw, 10) || 0;
  }

  // timeLimitSeconds mora biti > 0 (int)
  const timeLimitSeconds = Number.parseInt(model.timeLimitSeconds, 10) || 0;

  return {
    title,
    description: model.opis ?? "",
    categoryId,
    difficulty,
    timeLimitSeconds,
  };
}


export async function updateQuiz(id, model) {
  const dto = buildUpdateQuizDto(model);
  const res = await http.put(`${BASE}/${id}`, dto);
  return res.data;
}

// admin lista (ako ti treba drugdje)
export async function getQuizzesAdmin(params) {
  const { data } = await http.get(BASE, { params });
  return data;
}
