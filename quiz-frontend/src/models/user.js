import { z } from "zod";

export const MeResponseSchema = z.object({
  sub: z.string().optional(),
  username: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  roles: z.array(z.string()).default([]),
});
