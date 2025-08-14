import http from "./http";
import { getUserFromToken } from "../models/auth";

/** Snimi token i postavi ga na axios */
export function setAuthToken(token) {
  localStorage.setItem("auth_token", token);
  http.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

/** Učitaj token pri startu (ako postoji) */
export function loadAuthTokenFromStorage() {
  const t = localStorage.getItem("auth_token");
  if (t) http.defaults.headers.common["Authorization"] = `Bearer ${t}`;
}

/** Logout */
export function logout() {
  localStorage.removeItem("auth_token");
  delete http.defaults.headers.common["Authorization"];
}

/** REGISTER (multipart/form-data) */
export async function registerUser(formData) {
  const { data } = await http.post("/api/users/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data; // { success, message }
}

/** LOGIN (JSON) – očekuje { success, token, ... } */
export async function loginUser(payload) {
  const { data } = await http.post("/api/users/login", payload, {
    headers: { "Content-Type": "application/json" },
  });
  if (!data?.success || !data?.token) {
    throw new Error(data?.message || "Neispravni podaci za prijavu.");
  }
  setAuthToken(data.token);
  getUserFromToken(); // inicijalizuj parsiranog user-a
  return data;
}

/** Brzi test */
export async function getMe() {
  const { data } = await http.get("/api/users/me");
  return data;
}
