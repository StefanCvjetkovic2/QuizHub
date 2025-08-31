import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, isAdmin } from "../../services/tokenService";

export default function AdminRoute({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/" replace />;
  return <>{children}</>;
}
