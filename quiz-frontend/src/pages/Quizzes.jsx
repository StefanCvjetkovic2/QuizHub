import { useAuth } from "../context/AuthContext";

export default function Quizzes() {
  const { user } = useAuth();
  return (
    <div className="container">
      <div className="card">
        <h1>Kvizovi</h1>
        <p className="lead">
          {user ? `Zdravo, ${user.username || user.email}!` : "Lista dostupnih kvizova."}
        </p>
        <p>Ovde ćemo uskoro prikazati listu kvizova za korisnike.</p>
      </div>
    </div>
  );
}
