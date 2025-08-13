import http from "./http";

/** Sačuvaj token u storage + stavi ga na axios za dalje pozive */
export function setAuthToken(token) {
  localStorage.setItem("auth_token", token);
  http.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

/** Učitaj token iz storage-a pri startu aplikacije */
export function loadAuthTokenFromStorage() {
  const t = localStorage.getItem("auth_token");
  if (t) {
    http.defaults.headers.common["Authorization"] = `Bearer ${t}`;
  }
}

/** Logout */
export function logout() {
  localStorage.removeItem("auth_token");
  delete http.defaults.headers.common["Authorization"];
}

/** POST /api/users/register (multipart/form-data) */
export async function registerUser(formData) {
  try {
    const { data } = await http.post("/api/users/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data; // { success, message }
  } catch (err) {
    console.error("REGISTER ERROR", err);
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.title ||
      err?.message ||
      "Registracija nije uspela.";
    throw new Error(msg);
  }
}

/** POST /api/users/login – telo: { userNameOrEmail, password } */
export async function loginUser(payload) {
  try {
    const { data } = await http.post("/api/users/login", payload, {
      headers: { "Content-Type": "application/json" },
    });
    // očekujemo: { success, message, token, expiresAtUtc, userId, username, email }
    if (!data?.success || !data?.token) {
      throw new Error(data?.message || "Neispravni podaci za prijavu.");
    }
    setAuthToken(data.token);
    return data;
  } catch (err) {
    console.error("LOGIN ERROR", err);
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.title ||
      err?.message ||
      "Prijava nije uspela.";
    throw new Error(msg);
  }
}
