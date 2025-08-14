// src/models/auth.js
import { jwtDecode } from "jwt-decode";

export function getStoredToken() {
  return localStorage.getItem("auth_token") || null;
}

export function decodeToken(token) {
  try { 
    return jwtDecode(token); 
  } catch { 
    return null; 
  }
}

/** Vrati normalizovanog korisnika iz tokena */
export function getUserFromToken(token = getStoredToken()) {
  if (!token) return null;
  const p = decodeToken(token);
  if (!p) return null;

  // probaj razne ključeve za role
  const keys = [
    "role",
    "roles",
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
  ];
  let roles = [];
  for (const k of keys) {
    const v = p[k];
    if (Array.isArray(v)) { roles = v; break; }
    if (typeof v === "string") { roles = [v]; break; }
  }

  return {
    id: p.uid || p.sub || null,
    username: p.unique_name || p.name || p.username || null,
    email: p.email || null,
    roles,
    isAdmin: roles.includes("Admin"),
    exp: p.exp ? new Date(p.exp * 1000) : null,
    raw: p,
  };
}

export function isAuthenticated() {
  return !!getUserFromToken();
}
