import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
export default function MainLayout() {
  const nav = useNavigate();
  const logout = () => { localStorage.clear(); nav("/login", { replace: true }); };
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 16 }}>
      <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Link to="/">Početna</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Registracija</Link>
        <div style={{ marginLeft: "auto" }}><button onClick={logout}>Logout</button></div>
      </nav>
      <Outlet />
    </div>
  );
}
