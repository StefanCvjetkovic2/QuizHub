// src/services/resultsService.js
import http from "./http";

/* ================== SUBMIT (ne diramo) ================== */
// req = { quizId, elapsedSeconds, answers: [{ questionId, selectedAnswerIds?: string[], text?: string }] }
export async function submitQuiz(req) {
  const { data } = await http.post("/results", req);
  return data; // { success, resultId, correct, total, percentage, ... }
}

/* ================== POMOĆNE ================== */
function boolish(v) {
  if (v === true || v === false) return v;
  if (v == null) return undefined;
  const s = String(v).trim().toLowerCase();
  if (["1","true","yes","y","da","tacno","tačno"].includes(s)) return true;
  if (["0","false","no","n","ne","netacno","netačno"].includes(s)) return false;
  return undefined;
}

function normalizeDetailItem(it) {
  if (!it) return null;

  // ID pitanja (podrži i PascalCase)
  const qid = it.questionId ?? it.QuestionId ?? it.qid ?? it.id ?? it.Id;
  if (!qid) return null;

  // isCorrect (podrži i PascalCase i alternativna imena)
  let isCorrect =
    it.isCorrect ?? it.IsCorrect ?? it.correct ?? it.tacan ?? it.tačno ?? it.is_true ?? undefined;
  isCorrect = boolish(isCorrect);

  // correct ids (podrži i PascalCase)
  let correctIds =
    it.correctAnswerIds ?? it.CorrectAnswerIds ??
    it.correctIds ??
    (Array.isArray(it.answers) ? it.answers.filter(a => boolish(a?.isCorrect ?? a?.IsCorrect) === true).map(a => a?.id ?? a?.Id) : undefined) ??
    [];
  if (!Array.isArray(correctIds)) correctIds = [];

  // correct texts (podrži i PascalCase)
  let correctTexts =
    it.correctAnswerTexts ?? it.CorrectAnswerTexts ??
    it.correctTexts ??
    (it.correctText ? [it.correctText] : undefined) ??
    (it.expectedText ? [it.expectedText] : undefined) ??
    [];
  if (!Array.isArray(correctTexts)) correctTexts = [];

  // korisnički odgovori (podrži i PascalCase)
  let userIds = it.userSelectedAnswerIds ?? it.UserSelectedAnswerIds ?? it.userIds ?? [];
  if (!Array.isArray(userIds)) userIds = [];
  const userText = it.userText ?? it.UserText ?? it.answerText ?? "";

  return {
    questionId: String(qid),
    isCorrect,
    correctAnswerIds: correctIds.map(String),
    correctAnswerTexts: correctTexts,
    userSelectedAnswerIds: userIds.map(String),
    userText,
  };
}

function pickDetailsPayload(data) {
  const cands = [data, data?.data, data?.result, data?.results];
  for (const x of cands) {
    const list =
      x?.details ?? x?.Details ?? // <— novo sa BE
      x?.questionResults ?? x?.perQuestion ?? x?.items ?? x?.questions ?? x?.rows;
    if (Array.isArray(list)) return list;
  }
  return [];
}

/* ============== DETALJI JEDNOG REZULTATA (per-pitanje) ============== */
export async function getResultDetails(resultId) {
  if (!resultId) return [];
  // 1) NAŠA GLAVNA RUTA
  try {
    const { data } = await http.get(`/results/${resultId}`);
    const rawList = pickDetailsPayload(data);
    if (Array.isArray(rawList) && rawList.length) {
      return rawList.map(normalizeDetailItem).filter(Boolean);
    }
  } catch {}

  // 2) Fallback na moguće stare/alternativne rute
  const endpoints = [
    `/results/detail/${resultId}`,
    `/results/${resultId}/detail`,
    `/quiz-results/${resultId}`,
    { url: `/results`, params: { id: resultId } },
  ];
  for (const ep of endpoints) {
    try {
      const { data } = await (typeof ep === "string"
        ? http.get(ep)
        : http.get(ep.url, { params: ep.params }));
      const rawList = pickDetailsPayload(data);
      if (Array.isArray(rawList) && rawList.length) {
        const norm = rawList.map(normalizeDetailItem).filter(Boolean);
        if (norm.length) return norm;
      }
    } catch {}
  }
  return [];
}

/* ============== LISTA MOJIH REZULTATA ============== */
function mapResultListItem(x = {}) {
  const totalRaw = x.total ?? x.Total ?? x.questionsCount ?? x.count ?? 0;
  const scoreRaw = x.score ?? x.correct ?? x.Correct ?? 0;

  const pctRaw = x.percentage ?? x.Percentage;
  const pct = pctRaw != null ? Number(pctRaw) : (totalRaw ? (scoreRaw * 100) / totalRaw : 0);

  return {
    id: String(x.id ?? x.resultId ?? x.Id ?? x._id ?? ""),
    quizId: String(x.quizId ?? x.QuizId ?? x.quiz?.id ?? x.qid ?? ""),
    quizTitle: x.quizTitle ?? x.QuizTitle ?? x.quiz?.title ?? x.title ?? "",
    dateTaken: x.dateTaken ?? x.DateTaken ?? x.takenAt ?? x.createdAt ?? x.created ?? x.date ?? x.datetime ?? null,
    score: Number(scoreRaw) || 0,
    total: Number(totalRaw) || 0,
    percentage: Math.round(pct),
    timeTakenSeconds: x.timeTakenSeconds ?? x.TimeTakenSeconds ?? x.elapsedSeconds ?? x.durationSeconds ?? x.time ?? null,
  };
}

export async function listMyResults({ page = 1, pageSize = 20 } = {}) {
  // 1) NAŠA GLAVNA RUTA – vraća PagedDto{ Items, Total, Page, PageSize }
  try {
    const { data } = await http.get("/results/my", { params: { page, pageSize } });
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data?.Items) ? data.Items : [];
    return {
      items: items.map(mapResultListItem),
      total: data?.total ?? data?.Total ?? items.length,
      page: data?.page ?? data?.Page ?? page,
      pageSize: data?.pageSize ?? data?.PageSize ?? pageSize,
    };
  } catch {}

  // 2) Fallback-ovi (ako BE nekad vrati staru rutu)
  const candidates = [
    { url: "/results/me", params: { page, pageSize } },
    { url: "/my/results", params: { page, pageSize } },
    { url: "/results", params: { mine: true, page, pageSize } },
    { url: "/quiz-results/me", params: { page, pageSize } },
  ];
  for (const ep of candidates) {
    try {
      const { data } = await http.get(ep.url, { params: ep.params });
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data?.Items) ? data.Items : [];
      if (items.length) {
        return {
          items: items.map(mapResultListItem),
          total: data?.total ?? data?.Total ?? items.length,
          page: data?.page ?? data?.Page ?? page,
          pageSize: data?.pageSize ?? data?.PageSize ?? pageSize,
        };
      }
    } catch {}
  }
  return { items: [], total: 0, page, pageSize };
}

/* ============== SAŽETAK JEDNOG REZULTATA ============== */
function mapResultSummary(x = {}) {
  // Samo prosledi kroz mapResultListItem – dovoljan je za header
  return mapResultListItem(x);
}

export async function getResultSummary(resultId) {
  // 1) NAŠA GLAVNA RUTA
  try {
    const { data } = await http.get(`/results/${resultId}`);
    // direktno objekt – pripremi shape koji očekuje mapResultListItem
    const s = data || {};
    return mapResultSummary({
      id: s.resultId ?? s.id ?? s.Id,
      quizId: s.quizId ?? s.QuizId,
      quizTitle: s.quizTitle ?? s.QuizTitle,
      correct: s.correct ?? s.Correct,
      total: s.total ?? s.Total,
      percentage: s.percentage ?? s.Percentage,
      timeTakenSeconds: s.timeTakenSeconds ?? s.TimeTakenSeconds,
      dateTaken: s.dateTaken ?? s.DateTaken,
    });
  } catch {}

  // 2) fallback
  const endpoints = [
    `/quiz-results/${resultId}`,
    { url: `/results`, params: { id: resultId } },
  ];
  for (const ep of endpoints) {
    try {
      const { data } = await (typeof ep === "string"
        ? http.get(ep)
        : http.get(ep.url, { params: ep.params }));
      if (data?.id || data?.resultId || data?.Id) return mapResultSummary(data);
      const cands = [data?.data, data?.result, data];
      for (const c of cands) {
        if (c?.id || c?.resultId || c?.Id) return mapResultSummary(c);
      }
    } catch {}
  }
  return null;
}
