import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

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

// USER
import QuizzesBrowsePage from "@/pages/User/QuizzesBrowsePage.jsx";
import QuizPlayPage      from "@/pages/User/QuizPlayPage.jsx";
import QuizResultPage    from "@/pages/User/QuizResultPage.jsx";
import MyResultsPage     from "@/pages/User/MyResultsPage";
import ResultDetailsPage from "@/pages/User/ResultDetailsPage";
import LeaderboardPage   from "@/pages/User/LeaderboardPage";

// ⬇️ ADMIN: pregled rezultata (NOVO)
import AdminResultsPage        from "@/pages/Admin/Results/AdminResultsPage.jsx";


// LAZY: Admin Questions
const QuestionsAdminPage = React.lazy(() => import("@/pages/Admin/Questions/QuestionsAdminPage.jsx"));
const QuizQuestionsPage  = React.lazy(() => import("@/pages/Admin/Questions/QuizQuestionsPage.jsx"));
const QuestionNewPage    = React.lazy(() => import("@/pages/Admin/Questions/QuestionNewPage.jsx"));
const QuestionEditPage   = React.lazy(() => import("@/pages/Admin/Questions/QuestionEditPage.jsx"));

export default function MainRoutes() {
  return (
    <Routes>
      
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<MainLayout />}>

        {/* Ako je ulogovan, "/" vodi na /quizzes; inače PrivateRoute prebaci na /login */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Navigate to="/quizzes" replace />
            </PrivateRoute>
          }
        />

        {/* Pregled dostupnih kvizova (koristi quizPublicService) */}
        <Route
          path="/quizzes"
          element={
            <PrivateRoute>
              <QuizzesBrowsePage />
            </PrivateRoute>
          }
        />

        {/* Igranje kviza */}
        <Route
          path="/quizzes/:quizId"
          element={
            <PrivateRoute>
              <QuizPlayPage />
            </PrivateRoute>
          }
        />

        {/* Rezultat nakon kviza */}
        <Route
          path="/quizzes/:quizId/result"
          element={
            <PrivateRoute>
              <QuizResultPage />
            </PrivateRoute>
          }
        />

        <Route path="/my-results" element={<MyResultsPage />} />
        <Route path="/results/:resultId" element={<ResultDetailsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />

        {/* (Opcionalno) backward-compat: redirect sa starog placeholdera */}
        <Route path="/play/:quizId" element={<Navigate to="../quizzes/:quizId" replace />} />
      </Route>

      {/* ================= ADMIN (AdminLayout) ================= */}
      <Route element={<AdminLayout />}>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <QuizzesAdminPage />
            </AdminRoute>
          }
        />

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

        {/* Globalna lista / CRUD pitanja */}
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

        {/* Pitanja za konkretan kviz */}
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

        {/* Kategorije */}
        <Route
          path="/admin/categories/new"
          element={
            <AdminRoute>
              <CategoryNewPage />
            </AdminRoute>
          }
        />

        {/* ⬇️ NOVO: Admin pregled rezultata */}
        <Route
          path="/admin/results"
          element={
            <AdminRoute>
              <AdminResultsPage />
            </AdminRoute>
          }
        />
       
      </Route>

      {/* 404 → /quizzes */}
      <Route path="*" element={<Navigate to="/quizzes" replace />} />
    </Routes>
  );
}
