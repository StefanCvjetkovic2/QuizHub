import { createContext, useContext, useEffect, useState } from "react";
import { getUserFromToken } from "../models/auth";
import { loadAuthTokenFromStorage, logout as apiLogout, loginUser } from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUserFromToken());

  useEffect(() => {
    loadAuthTokenFromStorage();
    setUser(getUserFromToken());
  }, []);

  async function login(credentials) {
    const res = await loginUser(credentials); // setAuthToken je unutar loginUser
    setUser(getUserFromToken());
    return res;
  }

  function logout() {
    apiLogout();
    setUser(null);
  }

  const value = { user, isAdmin: !!user?.isAdmin, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
