export function difficultyLabelFrom(dto = {}) {
  const raw =
    dto.tezina ?? dto.difficulty ?? dto.Difficulty ?? dto.difficultyLevel;
  if (raw === null || raw === undefined || raw === "" || raw === "-") return "-";
  const n = typeof raw === "string" ? parseInt(raw, 10) : raw;
  switch (n) {
    case 1: return "lako";
    case 2: return "srednje";
    case 3: return "teško";
    default:
      // možda backend već šalje string "lako/srednje/teško"
      return typeof raw === "string" ? raw : "-";
  }
}

export function mapQuiz(dto = {}) {
  const rawDiff = dto.tezina ?? dto.difficulty ?? dto.Difficulty;
  const n = typeof rawDiff === "string" ? parseInt(rawDiff, 10) : rawDiff;

  return {
    id: dto.id ?? dto.quizId ?? dto.Id ?? dto.QuizId,
    naziv: dto.naziv ?? dto.name ?? dto.title ?? "",
    opis: dto.opis ?? dto.description ?? "",
    brojPitanja:
      dto.brojPitanja ?? dto.questionCount ?? dto.questionsCount ?? 0,
    difficultyId: Number.isFinite(n) ? n : null,
    tezina: difficultyLabelFrom(dto),
    vremenskoOgranicenje:
      dto.vremenskoOgranicenje ??
      dto.timeLimitSeconds ??
      dto.timeLimit ??
      null,
  };
}
export function normalizeType(t) {
  const s = String(t || "").toLowerCase();
  if (s.includes("truefalse") || s === "tf" || s === "boolean" || s === "bool") return "boolean";
  if (s.includes("single")) return "single";
  if (s.includes("multiple")) return "multiple";
  if (s.includes("fill") || s.includes("text") || s.includes("unos")) return "text";
  return s;
}