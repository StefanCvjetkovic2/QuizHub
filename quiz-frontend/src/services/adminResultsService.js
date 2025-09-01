import http from "./http";

/* mapiranje jednog rezultata iz admin liste */
function mapAdminResult(x = {}) {
  const total = x.total ?? x.questionsCount ?? x.count ?? 0;
  const score = x.score ?? x.correct ?? 0;
  const pct =
    x.percentage != null ? Number(x.percentage) : (total ? (score * 100) / total : 0);

  return {
    id: String(x.id ?? x.resultId ?? x._id ?? ""),
    quizId: String(x.quizId ?? x.quiz?.id ?? ""),
    quizTitle: x.quizTitle ?? x.quiz?.title ?? x.title ?? "",
    userId: String(x.userId ?? x.user?.id ?? ""),
    userName:
      x.userName ??
      x.username ??
      x.user?.userName ??
      x.user?.username ??
      x.user?.email ??
      "—",
    score: Number(score) || 0,
    total: Number(total) || 0,
    percentage: Math.round(pct),
    timeTakenSeconds:
      x.timeTakenSeconds ?? x.elapsedSeconds ?? x.durationSeconds ?? null,
    dateTaken: x.dateTaken ?? x.takenAt ?? x.createdAt ?? x.created ?? x.datetime ?? null,
  };
}

/** GET /api/admin/results?page=&pageSize=&quizId=&userId= */
export async function listAdminResults({ page = 1, pageSize = 20, quizId, userId } = {}) {
  const params = { page, pageSize };
  if (quizId) params.quizId = quizId;
  if (userId) params.userId = userId;

  const { data } = await http.get("/admin/results", { params });
  const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  return {
    items: items.map(mapAdminResult),
    total: data?.total ?? items.length,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? pageSize,
  };
}
