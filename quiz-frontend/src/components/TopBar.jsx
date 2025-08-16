import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function TopBar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function onLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="topbar">
      <div className="topbar__inner">
        <Link
          to={user ? (isAdmin ? "/admin" : "/app") : "/"}
          className="brand"
        >
          QuizHub
        </Link>

        <div className="spacer" />

        {!user ? (
          <div className="topbar__actions">
            <Link to="/login" className="btn btn--outline">Prijava</Link>
            <Link to="/register" className="btn btn--primary">Registracija</Link>
          </div>
        ) : (
          <div className="topbar__actions">
            {isAdmin ? (
              <Link to="/admin" className="btn btn--outline">Admin</Link>
            ) : (
              <Link to="/app" className="btn btn--outline">Kvizovi</Link>
            )}
            <span className="topbar__user">{user.username || user.email}</span>
            <button onClick={onLogout} className="btn btn--primary">Odjava</button>
          </div>
        )}
      </div>
    </div>
  );
}
