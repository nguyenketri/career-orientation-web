import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import HollandPage from "../pages/user/HollandPage";
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
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
