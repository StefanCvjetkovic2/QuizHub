import { jwtDecode } from "jwt-decode";

export const getToken = () => localStorage.getItem("access_token");
export const removeToken = () => localStorage.removeItem("access_token");

export const isTokenValid = (token) => {
  try {
    const { exp } = jwtDecode(token);
    return Date.now() < exp * 1000;
  } catch {
    return false;
  }
};

export const checkAndCleanToken = () => {
  const token = getToken();
  if (!token || !isTokenValid(token)) {
    removeToken();
    return false;
  }
  return true;
};

export const isAuthenticated = () => {
  const t = getToken();
  return t && isTokenValid(t);
};

export const getUserIdFromToken = () => {
  const t = getToken();
  if (!t) return null;
  try {
    const d = jwtDecode(t);
    return d.UserId || d.uid || null;
  } catch { return null; }
};

export const getUserRoleFromToken = () => {
  const t = getToken();
  if (!t) return null;
  try {
    const d = jwtDecode(t);
    return d["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || d.role || null;
  } catch { return null; }
};

export const getUsernameFromToken = () => {
  const t = getToken();
  if (!t) return null;
  try {
    const d = jwtDecode(t);
    return d["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || d.unique_name || null;
  } catch { return null; }
};

export const setRoles = (roles) => {
  localStorage.setItem("roles", JSON.stringify(Array.isArray(roles) ? roles : []));
};

export const getRoles = () => {
  try {
    const s = localStorage.getItem("roles");
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
};

// Izvadi role direktno iz JWT (podržava više claim naziva i array/string)
export const getRolesFromToken = () => {
  const t = getToken();
  if (!t) return [];
  try {
    const d = jwtDecode(t);
    const candidates = [
      d.role, // nekad je ovo string ili array
      d["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
      d["roles"], // ponekad custom
    ].filter(Boolean);

    let roles = [];
    for (const c of candidates) {
      if (Array.isArray(c)) roles = roles.concat(c);
      else if (typeof c === "string") roles.push(c);
    }
    // dedupe i normalizacija
    roles = [...new Set(roles.map(String))];
    return roles;
  } catch {
    return [];
  }
};

// Admin check: koristi lokalne role, pa fallback na token decode
export const isAdmin = () => {
  let roles = getRoles();
  if (!roles.length) roles = getRolesFromToken();
  return roles.includes("Admin");
};