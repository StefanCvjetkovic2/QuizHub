import { z } from "zod";

export const QuizSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
});
