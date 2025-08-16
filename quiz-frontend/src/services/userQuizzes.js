// src/services/userQuizzes.js
import http from "./http";

/**
 * Public detail kviza za korisnika
 * GET /api/Quizzes/{id}
 * očekuje: { id, title, description, timeLimitSeconds, questions: [{id,text,type,order,answers:[{id,text,...}]}] }
 */
export async function getQuizPublic(id) {
  const { data } = await http.get(`/api/Quizzes/${id}`);
  return data;
}
