import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LandingRedirect() {
  const { user } = useAuth();

  // Nije ulogovan → login
  if (!user) return <Navigate to="/login" replace />;

  // Ulogovan → admin ili user
  return <Navigate to={user.isAdmin ? "/admin" : "/quizzes"} replace />;
}
