// src/services/leaderboardService.js
import http from "./http";

function mapItem(x = {}) {
  return {
    rank: x.rank ?? x.Rank ?? 0,
    userId: x.userId ?? x.UserId ?? "",
    userName: x.userName ?? x.UserName ?? "",
    quizId: x.quizId ?? x.QuizId ?? "",
    quizTitle: x.quizTitle ?? x.QuizTitle ?? "",
    score: x.score ?? x.Score ?? 0,
    total: x.total ?? x.Total ?? 0,
    percentage: x.percentage ?? x.Percentage ?? 0,
    timeTakenSeconds: x.timeTakenSeconds ?? x.TimeTakenSeconds ?? null,
    dateTaken: x.dateTaken ?? x.DateTaken ?? null,
    isYou: !!(x.isYou ?? x.IsYou),
  };
}

export async function getLeaderboard({ quizId, period = "all", page = 1, pageSize = 50 }) {
  const { data } = await http.get("/results/leaderboard", {
    params: { quizId, period, page, pageSize },
  });
  const items = Array.isArray(data?.items ?? data?.Items) ? (data.items ?? data.Items) : [];
  return {
    items: items.map(mapItem),
    total: data?.total ?? data?.Total ?? items.length,
    page: data?.page ?? data?.Page ?? page,
    pageSize: data?.pageSize ?? data?.PageSize ?? pageSize,
    yourRank: data?.yourRank ?? data?.YourRank ?? null,
  };
}
