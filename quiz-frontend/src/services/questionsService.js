// src/services/questionsService.js
import http from "./http";

/* ---------- Tipovi i mapiranja ---------- */
export const TYPE_LABELS = {
  SingleChoice: "Jedan tačan",
  MultipleChoice: "Višestruki tačni",
  TrueFalse: "Tačno / Netačno",
  FillInTheBlank: "Unos teksta",
};

// front (single/multiple/boolean/text) -> DB (SingleChoice/MultipleChoice/TrueFalse/FillInTheBlank)
export function toDbType(t) {
  if (!t) return "SingleChoice";
  const v = t.toLowerCase();
  if (v === "single") return "SingleChoice";
  if (v === "multiple") return "MultipleChoice";
  if (v === "boolean") return "TrueFalse";
  if (v === "text") return "FillInTheBlank";
  // već je DB format?
  return t;
}

// DB -> front
export function toFrontType(db) {
  switch (db) {
    case "SingleChoice": return "single";
    case "MultipleChoice": return "multiple";
    case "TrueFalse":     return "boolean";
    case "FillInTheBlank":return "text";
    default:              return (db || "").toLowerCase();
  }
}

/* ---------- API pozivi ---------- */

// GET /api/admin/questions?quizId=&type=&q=&page=&pageSize=
export async function getQuestions(params) {
  const { data } = await http.get("/admin/questions", { params });
  return data; // { page, pageSize, total, items }
}

// GET /api/admin/questions/{id}
export async function getQuestion(id) {
  const { data } = await http.get(`/admin/questions/${id}`);
  return data; // { id, quizId, text, type:'single|multiple|boolean|text', order, answers:[{id,text,isCorrect}] }
}

// POST /api/admin/questions
export async function createQuestion(dto) {
  const payload = normalizeForApi(dto);
  const { data } = await http.post("/admin/questions", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return data; // { success, message, ... }
}

// PUT /api/admin/questions/{id}
export async function updateQuestion(id, dto) {
  const payload = normalizeForApi(dto);
  const { data } = await http.put(`/admin/questions/${id}`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return data; // { success, message }
}

// DELETE /api/admin/questions/{id}
export async function deleteQuestion(id) {
  await http.delete(`/admin/questions/${id}`);
}

/* ---------- Pomoćno: odredi sljedeći order za kviz ---------- */
export async function getNextOrderForQuiz(quizId) {
  // Uzmi total kroz list endpoint (najbrže)
  const { total } = await getQuestions({ quizId, page: 1, pageSize: 1 });
  return (Number(total) || 0) + 1;
}

export async function getQuestionsCountForQuiz(quizId) {
  const { data } = await http.get("/admin/questions", {
    params: { quizId, page: 1, pageSize: 1 }, // minimalan upit; koristi total
  });
  return Number(data?.total ?? 0);
}


/* ---------- Normalizacija forme -> payload za API ---------- */
function normalizeForApi(form) {
  // form.type može biti 'single'/'multiple'/'boolean'/'text' ILI već DB naziv.
  const typeDb = toDbType(form.type);

  const base = {
    quizId: form.quizId,
    text: (form.text || "").trim(),
    type: typeDb,
    order: Number(form.order) || 0,
  };

  if (typeDb === "SingleChoice" || typeDb === "MultipleChoice") {
    const answers = (form.answers || [])
      .map(a => ({ text: (a.text || "").trim(), isCorrect: !!a.isCorrect }))
      .filter(a => a.text.length > 0);

    return { ...base, answers };
  }

  if (typeDb === "TrueFalse") {
    // form.trueIsCorrect === true/false
    const val = !!form.trueIsCorrect;
    return {
      ...base,
      answers: [
        { text: "Tačno",   isCorrect: val },
        { text: "Netačno", isCorrect: !val },
      ],
    };
  }

  // FillInTheBlank
  const list = (form.answers || [])
    .map(a => (typeof a === "string" ? a : a?.text))
    .map(s => (s || "").trim())
    .filter(Boolean)
    .map(s => ({ text: s, isCorrect: true }));

  return { ...base, answers: list };
}
