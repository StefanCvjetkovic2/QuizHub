// src/services/resultsService.js
import http from "./http";

// req = { quizId, elapsedSeconds, answers: [{ questionId, selectedAnswerIds?: string[], text?: string }] }
export async function submitQuiz(req) {
  const { data } = await http.post("/results", req);
  return data; // očekujemo bar { success, resultId, correct, total, percentage }
}

/* ---------------- helpers za detalje rezultata ---------------- */

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
  const qid = it.questionId ?? it.qid ?? it.id;
  if (!qid) return null;

  let isCorrect =
    it.isCorrect ?? it.correct ?? it.tacan ?? it.tačno ?? it.is_true ?? undefined;
  isCorrect = boolish(isCorrect);

  // mogu stići na više načina
  let correctIds =
    it.correctAnswerIds ??
    it.correctIds ??
    (Array.isArray(it.answers) ? it.answers.filter(a => boolish(a?.isCorrect) === true).map(a => a?.id) : undefined) ??
    [];
  if (!Array.isArray(correctIds)) correctIds = [];

  let correctTexts =
    it.correctAnswerTexts ??
    it.correctTexts ??
    (it.correctText ? [it.correctText] : undefined) ??
    (it.expectedText ? [it.expectedText] : undefined) ??
    [];
  if (!Array.isArray(correctTexts)) correctTexts = [];

  return { questionId: qid, isCorrect, correctAnswerIds: correctIds, correctAnswerTexts: correctTexts };
}

function pickDetailsPayload(data) {
  const cands = [data, data?.data, data?.result, data?.results];
  for (const x of cands) {
    const list =
      x?.details ?? x?.questionResults ?? x?.perQuestion ?? x?.items ?? x?.questions ?? x?.rows;
    if (Array.isArray(list)) return list;
  }
  return [];
}

/**
 * Pokuša više tipičnih ruta da dođe do detalja rezultata (per-pitanje).
 * Ako server nema ove rute, vrati prazan niz i UI će pasti na fallback.
 */
export async function getResultDetails(resultId) {
  if (!resultId) return [];
  const endpoints = [
    `/results/${resultId}`,
    `/results/detail/${resultId}`,
    `/results/${resultId}/detail`,
    `/quiz-results/${resultId}`,
    // kao query
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
    } catch (e) {
      // probaj sledeći endpoint
    }
  }
  return [];
}
