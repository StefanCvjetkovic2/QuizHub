
import http from "./http";

const BASE = "/quizzes";

// map za listu (već ga imaš; ostavljam radi jasnoće)
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

// 🆕 map za detalj sa pitanjima
const toFrontType = (raw) => {
  if (!raw) return "single";
  const s = String(raw).toLowerCase();
  if (["single", "singlechoice", "jedan", "jedan tačan", "jedan tacan"].includes(s)) return "single";
  if (["multiple", "multiplechoice", "visestruki", "više", "vise"].includes(s)) return "multiple";
  if (["boolean", "truefalse", "tacno/netacno", "tačno/netačno"].includes(s)) return "boolean";
  if (["fillintheblank", "text", "unos", "fillin"].includes(s)) return "text";
  return "single";
};

function mapQuizDetail(x = {}) {
  return {
    id: x.id,
    title: x.title ?? x.naziv ?? "",
    description: x.description ?? x.opis ?? "",
    difficulty: x.difficulty ?? x.tezina ?? 0,
    timeLimitSeconds: x.timeLimitSeconds ?? x.timeLimit ?? x.vremenskoOgranicenje ?? 0,
    questions: (x.questions ?? []).map((q, idx) => ({
      id: q.id,
      text: q.text ?? q.tekst ?? "",
      type: toFrontType(q.type ?? q.tip),
      order: q.order ?? idx + 1,
      // BE ponekad ne šalje IsCorrect (što je ok) – mi ga ignorisemo u toku kviza
      answers: (q.answers ?? []).map(a => ({
        id: a.id,
        text: a.text ?? a.tekst ?? "",
        isCorrect: a.isCorrect ?? a.tacan ?? undefined,
      })),
    })),
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
