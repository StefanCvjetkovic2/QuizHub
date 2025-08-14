import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="container">
      <div className="card">
        <h1>QuizHub</h1>
        <p className="lead">
          Brzi kvizovi, pametno bodovanje i jasni rezultati. Prijavi se da nastaviš
          ili napravi nalog za novi početak.
        </p>

        {!user && (
          <div className="actions">
            <Link className="btn btn--primary" to="/login">Prijava</Link>
            <Link className="btn btn--outline" to="/register">Registracija</Link>
          </div>
        )}

        {user && isAdmin && (
          <div className="actions">
            <Link className="btn btn--primary" to="/admin">Otvori Admin panel</Link>
            <Link className="btn btn--outline" to="/quizzes">Pregled kvizova</Link>
          </div>
        )}

        {user && !isAdmin && (
          <div className="actions">
            <Link className="btn btn--primary" to="/quizzes">Počni kviz</Link>
            <Link className="btn btn--outline" to="/results">Moji rezultati</Link>
          </div>
        )}
      </div>
    </div>
  );
}
