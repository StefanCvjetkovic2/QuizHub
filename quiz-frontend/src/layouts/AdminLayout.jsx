import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { removeToken } from "../services/tokenService";

export default function AdminLayout() {
  const nav = useNavigate();
  const logout = () => { localStorage.clear(); removeToken(); nav("/login", { replace: true }); };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Link to="/admin">Admin dashboard</Link>
        <Link to="/admin/quizzes">Quizzes</Link>
        <Link to="/admin/categories">Categories</Link>
        <div style={{ marginLeft: "auto" }}>
          <Link to="/">User app</Link>
          <button style={{ marginLeft: 12 }} onClick={logout}>Logout</button>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
