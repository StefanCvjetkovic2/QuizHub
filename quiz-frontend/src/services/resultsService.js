// src/services/resultsService.js
import http from "./http";

// req = { quizId, elapsedSeconds, answers: [{ questionId, selectedAnswerIds?: string[], text?: string }] }
export async function submitQuiz(req) {
  const { data } = await http.post("/results", req);
  return data; // { success, resultId, correct, total, percentage }
}
