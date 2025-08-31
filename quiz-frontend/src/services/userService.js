import http from "./http";
import { MeResponseSchema } from "../models/user";

export async function fetchMe() {
  const res = await http.get("/users/me");
  const data = MeResponseSchema.parse(res.data);
  // sačuvaj role u localStorage (stringified)
  localStorage.setItem("roles", JSON.stringify(data.roles || []));
  // radi lakšeg pristupa možeš i username/email
  if (data.username) localStorage.setItem("username", data.username);
  if (data.email) localStorage.setItem("email", data.email);
  return data;
}


// /api/users/login — body prima { usernameOrEmail, password } (ili username/email + password)
export async function loginUser({ identifier, password }) {
  const payloads = [
    { usernameOrEmail: identifier, password },
    { username: identifier, password },
    { email: identifier, password },
  ];
  let lastErr;
  for (const p of payloads) {
    try {
      const res = await http.post("/users/login", p);
      return res.data; // { success, message, token, expiresAtUtc, userId, username, email }
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("Login nije uspeo");
}

// /api/users/register — multipart/form-data: Username, Email, Password, Image (ili ProfileImage)
export async function registerUser({ username, email, password, image }) {
  const fd = new FormData();
  fd.append("Username", username);
  fd.append("Email", email);
  fd.append("Password", password);
  if (image instanceof File) fd.append("Image", image); // promeni ključ ako tvoj BE traži npr. ProfileImage

  const res = await http.post("/users/register", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data; // očekuje { success, message, ... }
}
