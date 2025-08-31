import React from "react";
import { Routes, Route } from "react-router-dom";

import MainLayout   from "@/layouts/MainLayout.jsx";
import PrivateRoute from "@/components/Route/PrivateRoute.jsx";

import AdminLayout  from "@/layouts/AdminLayout.jsx";
import AdminRoute   from "@/components/Route/AdminRoute.jsx";

import HomePage     from "@/pages/HomePage.jsx";
import LoginPage    from "@/pages/LoginPage.jsx";
import RegisterPage from "@/pages/RegisterPage.jsx";

import QuizzesAdminPage from "@/pages/Admin/QuizzesAdminPage.jsx";
import QuizNewPage      from "@/pages/Admin/QuizNewPage.jsx";
import QuizEditPage     from "@/pages/Admin/QuizEditPage.jsx";
import CategoryNewPage  from "@/pages/Admin/CategoryNewPage.jsx";

/* LAZY Questions stranice */
const QuestionsAdminPage = React.lazy(() => import("@/pages/Admin/Questions/QuestionsAdminPage.jsx")); // globalna lista
const QuizQuestionsPage  = React.lazy(() => import("@/pages/Admin/Questions/QuizQuestionsPage.jsx"));   // pitanja za jedan kviz
const QuestionNewPage    = React.lazy(() => import("@/pages/Admin/Questions/QuestionNewPage.jsx"));
const QuestionEditPage   = React.lazy(() => import("@/pages/Admin/Questions/QuestionEditPage.jsx"));

export default function MainRoutes() {
  return (
    <Routes>
      {/* PUBLIC / AUTH */}
      <Route element={<MainLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
      </Route>

      {/* ADMIN */}
      <Route element={<AdminLayout />}>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <QuizzesAdminPage />
            </AdminRoute>
          }
        />

        {/* KVIZ CRUD */}
        <Route
          path="/admin/quizzes/new"
          element={
            <AdminRoute>
              <QuizNewPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/quizzes/:quizId/edit"
          element={
            <AdminRoute>
              <QuizEditPage />
            </AdminRoute>
          }
        />

        {/* GLOBALNA LISTA PITANJA + DODAVANJE/UREĐIVANJE */}
        <Route
          path="/admin/questions"
          element={
            <AdminRoute>
              <QuestionsAdminPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/questions/new"
          element={
            <AdminRoute>
              <QuestionNewPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/questions/:questionId/edit"
          element={
            <AdminRoute>
              <QuestionEditPage />
            </AdminRoute>
          }
        />

        {/* PITANJA ZA KONKRETAN KVIZ (ostavljamo ako ideš iz “Lista kvizova” → “Kreiraj pitanje”) */}
        <Route
          path="/admin/quizzes/:quizId/questions"
          element={
            <AdminRoute>
              <QuizQuestionsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/quizzes/:quizId/questions/new"
          element={
            <AdminRoute>
              <QuestionNewPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/quizzes/:quizId/questions/:questionId/edit"
          element={
            <AdminRoute>
              <QuestionEditPage />
            </AdminRoute>
          }
        />

        {/* KATEGORIJE */}
        <Route
          path="/admin/categories/new"
          element={
            <AdminRoute>
              <CategoryNewPage />
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  );
}
