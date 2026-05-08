import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import RecommendPage from "../pages/RecommendPage";
import HollandPage from "../pages/HollandPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/recommend" element={<RecommendPage />} />
        <Route path="/holland" element={<HollandPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
