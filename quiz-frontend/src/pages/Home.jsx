import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container">
      <div className="card">
        <h1>QuizHub</h1>
        <p className="lead">
          Brzi kvizovi, pametno bodovanje i jasni rezultati. Prijavi se da
          nastaviš gde si stao ili kreiraj nalog za novi početak.
        </p>

        <div className="actions">
          <Link className="btn btn--primary" to="/login">Prijava</Link>
          <Link className="btn btn--outline" to="/register">Registracija</Link>
        </div>
      </div>
    </div>
  );
}
