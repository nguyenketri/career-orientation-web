import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProfilePage from "../pages/user/ProfilePage";
import ComparisonPage from "../pages/user/ComparisonPage";
import MentorChatPage from "../pages/user/MentorChatPage";
import HollandPage from "../pages/user/HollandPage";
import MbtiPage from "../pages/user/MbtiPage";
import RecommendPage from "../pages/user/RecommendPage";
import DashboardPage from "../pages/user/DashboardPage";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommend"
          element={
            <ProtectedRoute>
              <RecommendPage />
            </ProtectedRoute>
          }
        />
        <Route path="/holland" element={<HollandPage />} />
        <Route path="/mbti" element={<MbtiPage />} />
        <Route
          path="/compare"
          element={
            <ProtectedRoute>
              <ComparisonPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor"
          element={
            <ProtectedRoute>
              <MentorChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
