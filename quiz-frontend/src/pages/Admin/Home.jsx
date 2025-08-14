import { Link } from "react-router-dom";

export default function AdminHome() {
  return (
    <div className="container">
      <div className="card">
        <h1>Admin panel</h1>
        <p className="lead">Upravljaj kvizovima, pitanjima, kategorijama i rezultatima.</p>

        <div className="grid grid-2">
          <Link className="btn btn--primary" to="/admin/quizzes">Kvizovi (CRUD)</Link>
          <Link className="btn btn--primary" to="/admin/questions">Pitanja (CRUD)</Link>
          <Link className="btn btn--outline" to="/admin/categories">Kategorizacija</Link>
          <Link className="btn btn--outline" to="/admin/results">Rezultati korisnika</Link>
          <Link className="btn btn--primary btn--full" to="/admin/quizzes/create">Kreiraj kviz</Link>
        </div>
      </div>
    </div>
  );
}
