import React from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";

export default function MainLayout() {
  const nav = useNavigate();

  const logout = () => {
    if (confirm("Odjaviti se sa naloga?")) {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}
      nav("/login", { replace: true });
    }
  };

  const linkStyle = ({ isActive }) => ({
    padding: "8px 10px",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: 700,
    color: isActive ? "white" : "inherit",
    background: isActive ? "var(--brand, #2563eb)" : "transparent",
    border: isActive ? "1px solid rgba(37,99,235,.75)" : "1px solid transparent",
    transition: "background .15s ease, color .15s ease, border .15s ease",
  });

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: 16 }}>
      {/* Header / Nav */}
      <nav
        className="card"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto",
          alignItems: "center",
          gap: 12,
          padding: 12,
          borderRadius: 14,
          marginBottom: 16,
          border: "1px solid rgba(148,163,184,.25)",
          background: "rgba(30,41,59,.30)",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div
              aria-hidden
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background:
                  "linear-gradient(135deg, rgba(37,99,235,1) 0%, rgba(56,189,248,1) 100%)",
              }}
            />
            <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: .2 }}>QuizApp</div>
          </Link>
        </div>

        {/* Linkovi */}
        <div style={{ display: "flex", gap: 8, justifySelf: "center" }}>
          
          <NavLink to="/quizzes" style={linkStyle}>Kvizovi</NavLink>
          <NavLink to="/my-results" style={linkStyle}>Moji rezultati</NavLink>
          <NavLink to="/leaderboard" style={linkStyle}>Rang lista</NavLink>
         
        </div>

        

        {/* Desno: Logout */}
        <div style={{ display: "flex", gap: 8, justifySelf: "end" }}>
          <button className="btn btn-red" onClick={logout}>Logout</button>
        </div>
      </nav>

      <Outlet />
    </div>
  );
}
