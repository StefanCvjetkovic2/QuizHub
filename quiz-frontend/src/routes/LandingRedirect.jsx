import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LandingRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.isAdmin ? "/admin" : "/app"} replace />;
}
