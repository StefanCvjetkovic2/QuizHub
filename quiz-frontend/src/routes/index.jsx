// src/routes/index.jsx (ili gdje već držiš root ruter)
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingRedirect from "./LandingRedirect";
import Home from "../pages/Home";
import Register from "../pages/Register";
import Login from "../pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import Quizzes from "../pages/Quizzes";
import TopBar from "../components/TopBar";

// ADMIN
import AdminLayout from "../pages/Admin/Layout";             // <— promijenjeno!
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

        {/* user za kvizove */}
        <Route element={<ProtectedRoute adminOnly={false} />}>
          <Route path="/quizzes" element={<Quizzes />} />
        </Route>

        {/* admin sve rute */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="quizzes" replace />} />
            <Route path="quizzes" element={<AdminQuizzesList />} />
            <Route path="quizzes/create" element={<AdminQuizCreate />} />
            <Route path="quizzes/:id/edit" element={<AdminQuizEdit />} />
            <Route path="quizzes/:id/questions" element={<AdminQuizQuestions />} />

            {/* novo: kreiranje pitanja iz menija */}
            <Route path="questions/create" element={<AdminQuestionCreate />} />

            <Route path="categories" element={<AdminCategories />} />
            <Route path="questions" element={<AdminQuestions />} />
            <Route path="results" element={<AdminResults />} />

            {/* fallback u okviru admina */}
            <Route path="*" element={<Navigate to="/admin/quizzes" replace />} />
          </Route>
        </Route>

        {/* globalni fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
