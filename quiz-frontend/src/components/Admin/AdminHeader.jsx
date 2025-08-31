import React from "react";
import { useNavigate } from "react-router-dom";
import { removeToken, getUsernameFromToken } from "../../services/tokenService";

export default function AdminHeader() {
  const nav = useNavigate();
  const ime = localStorage.getItem("username") || getUsernameFromToken() || "Admin";
  const logout = () => { localStorage.clear(); removeToken(); nav("/login", { replace:true }); };

  return (
    <header className="admin-header">
      <div className="admin-title">Kviz</div>
      <div className="admin-center">Admin <span style={{textTransform:"capitalize"}}>{ime}</span></div>
      <button className="admin-logout" onClick={logout}>LogOUT</button>
    </header>
  );
}
