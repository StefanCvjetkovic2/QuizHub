import http from "./http";

const BASE = "/quizzes";

// --------- list ---------
function mapQuizPublic(x = {}) {
  const diff = x.difficulty ?? x.tezina ?? null;
  return {
    id: x.id,
    title: x.title ?? x.naziv ?? "",
    description: x.description ?? x.opis ?? "",
    questionCount: x.questionCount ?? x.questionsCount ?? x.count ?? 0,
    difficulty: typeof diff === "number" ? diff : Number.parseInt(diff || 0, 10) || 0,
    timeLimitSeconds: x.timeLimitSeconds ?? x.timeLimit ?? x.vremenskoOgranicenje ?? 0,
    categoryId: x.categoryId ?? x.kategorijaId ?? null,
    categoryName: x.categoryName ?? x.category ?? x.kategorija ?? "",
  };
}

// --------- helpers ---------
const toFrontType = (raw) => {
  if (!raw) return "single";
  const s = String(raw).toLowerCase();
  if (["single","singlechoice","jedan","jedan tačan","jedan tacan"].includes(s)) return "single";
  if (["multiple","multiplechoice","visestruki","više","vise"].includes(s)) return "multiple";
  if (["boolean","truefalse","tacno/netacno","tačno/netačno","tf","bool"].includes(s)) return "boolean";
  if (["fillintheblank","text","unos","fillin"].includes(s)) return "text";
  return "single";
};

function boolish(v) {
  if (v === true || v === false) return v;
  if (v == null) return undefined;
  const s = String(v).trim().toLowerCase();
  if (["1","true","yes","y","da","tacno","tačno"].includes(s)) return true;
  if (["0","false","no","n","ne","netacno","netačno"].includes(s)) return false;
  return undefined;
}

function normIdList(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(x => String(x));
  if (typeof raw === "string") return raw.split(",").map(s => s.trim()).filter(Boolean).map(String);
  if (typeof raw === "number") return [String(raw)];
  if (typeof raw === "object") {
    // npr { "42": true, "99": false }
    const out = [];
    for (const [k, v] of Object.entries(raw)) if (boolish(v) === true) out.push(String(k));
    return out;
  }
  return [];
}

function normTextList(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(x => String(x).trim()).filter(Boolean);
  if (typeof raw === "string") return [raw.trim()].filter(Boolean);
  if (typeof raw === "object") {
    // npr { text: "Tačno" } ili [{text:"5"}]
    if (raw.text) return [String(raw.text).trim()];
    if (Array.isArray(raw.items)) return raw.items.map(x => String(x.text ?? x).trim()).filter(Boolean);
  }
  return [];
}

function sameText(a, b) {
  return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
}

// --------- detail (najbitnije izmene) ---------
function mapQuizDetail(x = {}) {
  return {
    id: x.id,
    title: x.title ?? x.naziv ?? "",
    description: x.description ?? x.opis ?? "",
    difficulty: x.difficulty ?? x.tezina ?? 0,
    timeLimitSeconds: x.timeLimitSeconds ?? x.timeLimit ?? x.vremenskoOgranicenje ?? 0,
    questions: (x.questions ?? []).map((q, idx) => {
      // 1) pokupi "tačno" na nivou PITANJA (ID ili tekst) iz raznih polja
      let qLevelIds = []
        .concat(normIdList(q.correctAnswerIds))
        .concat(normIdList(q.correctIds))
        .concat(normIdList(q.correctOptionIds))
        .concat(normIdList(q.correct_options))
        .concat(normIdList(q.correct_answers))
        .concat(normIdList(q.correctAnswerId))
        .concat(normIdList(q.tacanId))
        .filter(Boolean);

      let qLevelTexts = []
        .concat(normTextList(q.correctAnswerTexts))
        .concat(normTextList(q.correctTexts))
        .concat(normTextList(q.correctText))
        .concat(normTextList(q.expectedText))
        .concat(normTextList(q.tacanText))
        .filter(Boolean);

      // 2) mapiraj answers; ako BE nije označio isCorrect, postavi ga po qLevelIds / qLevelTexts
      const answers = (q.answers ?? []).map(a => {
        const rawFlag =
          a.isCorrect ??
          a.correct ??
          a.isTrue ??
          a.true ??
          a.correctAnswer ??
          a.isCorrectAnswer ??
          a.is_right ??
          a.is_valid ??
          a.is_valid_answer ??
          a.is_correct ??
          a.is_correct_answer ??
          a.tacan ??
          a.tacno ??
          a.is_tacan;

        let isCorrect = (rawFlag !== undefined ? boolish(rawFlag) : undefined);

        if (isCorrect === undefined) {
          if (qLevelIds.length && qLevelIds.includes(String(a.id))) isCorrect = true;
          else if (qLevelTexts.length && qLevelTexts.some(t => sameText(t, a.text))) isCorrect = true;
        }

        return {
          id: a.id,
          text: a.text ?? a.tekst ?? "",
          isCorrect, // može biti true ili undefined (nikad false ovde da ne pokvarimo fallback)
        };
      });

      // 3) izračunaj finalne correctIds/texts (da ih ima i pitanje – koristi rezultat mape iz #2)
      const finalCorrectIds = answers.filter(a => a.isCorrect === true).map(a => String(a.id));
      const finalCorrectTexts = answers.filter(a => a.isCorrect === true).map(a => a.text).filter(Boolean);

      return {
        id: q.id,
        text: q.text ?? q.tekst ?? "",
        type: toFrontType(q.type ?? q.tip),
        order: q.order ?? idx + 1,
        answers,
        correctIds: finalCorrectIds,      // ⬅️ koristi rezultat gore (i iz q-level polja)
        correctTexts: finalCorrectTexts,  // ⬅️ isto
      };
    }),
  };
}

export async function listPublicQuizzes(params = {}) {
  const { q, categoryId, difficulty, page = 1, pageSize = 12 } = params;
  const query = { page, pageSize };
  if (q && q.trim()) query.q = q.trim();
  if (categoryId) query.categoryId = Number(categoryId);
  if (difficulty) query.difficulty = Number(difficulty);

  const { data } = await http.get(BASE, { params: query });
  const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  return {
    items: items.map(mapQuizPublic),
    total: data?.total ?? items.length,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? pageSize,
  };
}

export async function getPublicQuiz(id) {
  const { data } = await http.get(`${BASE}/${id}`);
  return mapQuizPublic(data);
}

export async function getPublicQuizDetail(id) {
  const { data } = await http.get(`${BASE}/${id}`);
  return mapQuizDetail(data);
}

export async function getPublicQuizQuestionsCount(id) {
  const { data } = await http.get(`${BASE}/${id}`);
  if (Array.isArray(data?.questions)) return data.questions.length;
  const raw = data?.questionCount ?? data?.questionsCount ?? data?.count ?? 0;
  const n = typeof raw === "number" ? raw : Number.parseInt(raw, 10);
  return Number.isNaN(n) ? 0 : n;
}
