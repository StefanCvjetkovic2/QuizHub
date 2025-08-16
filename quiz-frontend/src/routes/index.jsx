import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingRedirect from "./LandingRedirect";
import Home from "../pages/Home";
import Register from "../pages/Register";
import Login from "../pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import TopBar from "../components/TopBar";

// USER (app)
import AppLayout from "../pages/App/Layout";
import UserQuizzesList from "../pages/App/QuizzesList";
import MyResults from "../pages/App/MyResults";
import Leaderboard from "../pages/App/Leaderboard";
import PlayQuiz from "../pages/App/PlayQuiz";

// ADMIN
import AdminLayout from "../pages/Admin/Layout";
import AdminQuizzesList from "../pages/Admin/QuizzesList";
import AdminQuizCreate from "../pages/Admin/QuizCreate";
import AdminQuestionCreate from "../pages/Admin/QuestionCreate";
import AdminQuizEdit from "../pages/Admin/QuizEdit";
import AdminQuizQuestions from "../pages/Admin/QuizQuestions";
import AdminCategories from "../pages/Admin/Categories";
import AdminQuestions from "../pages/Admin/Questions";
import AdminResults from "../pages/Admin/Results";

export default function RoutesRoot() {
  return (
    <BrowserRouter>
      <TopBar />
      <Routes>
        {/* landing / auth / public */}
        <Route path="/" element={<LandingRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />

        {/* BRIDGE: stara ruta /quizzes -> nova /app/quizzes */}
        <Route path="/quizzes" element={<Navigate to="/app/quizzes" replace />} />

        {/* USER / APP */}
        <Route element={<ProtectedRoute adminOnly={false} />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="quizzes" replace />} />
            <Route path="quizzes" element={<UserQuizzesList />} />
            <Route path="my-results" element={<MyResults />} />
            <Route path="leaderboard" element={<Leaderboard />} />
           <Route path="quiz/:id/start" element={<PlayQuiz />} />
          </Route>
        </Route>

        {/* ADMIN */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="quizzes" replace />} />
            <Route path="quizzes" element={<AdminQuizzesList />} />
            <Route path="quizzes/create" element={<AdminQuizCreate />} />
            <Route path="quizzes/:id/edit" element={<AdminQuizEdit />} />
            <Route path="quizzes/:id/questions" element={<AdminQuizQuestions />} />
            <Route path="questions/create" element={<AdminQuestionCreate />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="questions" element={<AdminQuestions />} />
            <Route path="results" element={<AdminResults />} />
            <Route path="*" element={<Navigate to="/admin/quizzes" replace />} />
          </Route>
        </Route>

        {/* global fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
