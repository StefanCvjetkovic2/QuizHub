// Public kviz (za igranje) – bez /admin prefiksa
import http from "./http";

/** GET /api/Quizzes/{id} */
export async function getQuizPublic(id) {
  const { data } = await http.get(`/api/Quizzes/${id}`);
  return data; // očekujemo { id,title,description,timeLimitSeconds,questions:[{id,text,type,order,answers:[{id,text,isCorrect}]}] }
}
