import { z } from "zod";

// Login: username ili email + password
export const LoginRequestSchema = z.object({
  identifier: z.string().min(1), // username ILI email (unosimo u jednom polju)
  password: z.string().min(1),
});

// Odgovor backend-a (prema tvom controlleru/komandi)
export const LoginResultSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  token: z.string(),            // JWT
  expiresAtUtc: z.string(),     // ISO string
  userId: z.string(),
  username: z.string(),
  email: z.string(),
});

// Registracija: username, email, password, confirmPassword, image (File)
export const RegisterRequestSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  image: z.any().optional(), // File ili undefined; validiraćemo ručno dole
}).refine((data) => data.password === data.confirmPassword, {
  message: "Lozinke se ne poklapaju.",
  path: ["confirmPassword"],
});
