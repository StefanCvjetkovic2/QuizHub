// src/pages/App/Layout.jsx
import { NavLink, Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <nav className="admin-menu">
          <NavLink to="/app/Quizzes" className="admin-link">📚 Dostupni kvizovi</NavLink>
          <NavLink to="/app/my-results" className="admin-link">🧍 Moji rezultati</NavLink>
          <NavLink to="/app/leaderboard" className="admin-link">🏆 Rang lista</NavLink>
        </nav>
      </aside>

      <main className="admin-content">
        <div >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
