import React from "react";
import { Routes, Route } from "react-router-dom";

import MainLayout   from "@/layouts/MainLayout.jsx";
import PrivateRoute from "@/components/Route/PrivateRoute.jsx";

import AdminLayout  from "@/layouts/AdminLayout.jsx";
import AdminRoute   from "@/components/Route/AdminRoute.jsx";

import HomePage     from "@/pages/HomePage.jsx";
import LoginPage    from "@/pages/LoginPage.jsx";
import RegisterPage from "@/pages/RegisterPage.jsx";
import AdminDashboard from "@/pages/Admin/AdminDashboard.jsx";

export default function MainRoutes() {
  return (
    <Routes>
      {/* public + user area */}
      <Route element={<MainLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
      </Route>

      {/* admin area */}
      <Route element={<AdminLayout />}>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        {/* primer za dalje:
        <Route path="/admin/quizzes" element={<AdminRoute><QuizzesAdminPage/></AdminRoute>} />
        <Route path="/admin/categories" element={<AdminRoute><CategoriesAdminPage/></AdminRoute>} />
        */}
      </Route>
    </Routes>
  );
}
