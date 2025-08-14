import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-menu">
          <NavLink end to="/admin/quizzes" className="admin-link">📚 Lista kvizova</NavLink>
          <NavLink to="/admin/quizzes/create" className="admin-link">➕ Kreiraj kviz</NavLink>
          <NavLink to="/admin/questions/create" className="admin-link">➕ Kreiraj pitanje</NavLink>
          <NavLink to="/admin/questions" className="admin-link">❓ Pitanja (CRUD)</NavLink>
          <NavLink to="/admin/categories" className="admin-link">🏷️ Kategorije</NavLink>
          <NavLink to="/admin/results" className="admin-link">📊 Rezultati</NavLink>
        </div>
      </aside>

      <main className="admin-content">
        {/* Bez .card – stranice same odlučuju kad žele “card” */}
        <Outlet />
      </main>
    </div>
  );
}
