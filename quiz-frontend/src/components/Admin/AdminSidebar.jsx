// src/components/Admin/AdminSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function AdminSidebar() {
  return (
    <aside className="admin-menu">
      <NavLink to="/admin" end className={({isActive}) => isActive ? "active" : ""}>Lista kvizova</NavLink>
      <NavLink to="/admin/quizzes/new" className={({isActive}) => isActive ? "active" : ""}>kreiraj kviz</NavLink>
      <NavLink to="/admin/questions" className={({isActive}) => isActive ? "active" : ""}>Pitanja</NavLink>
      <NavLink to="/admin/categories/new" className={({isActive}) => isActive ? "active" : ""}>kreiraj kategoriju</NavLink>
    </aside>
  );
}
