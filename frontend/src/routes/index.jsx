import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProfilePage from "../pages/user/ProfilePage";
import ComparisonPage from "../pages/user/ComparisonPage";
import MentorChatPage from "../pages/user/MentorChatPage";
import HollandPage from "../pages/user/HollandPage";
import HollandTestPage from "../pages/user/HollandTestPage";
import MbtiPage from "../pages/user/MbtiPage";
import MbtiTestPage from "../pages/user/MbtiTestPage";
import RecommendPage from "../pages/user/RecommendPage";
import HistoryPage from "../pages/user/HistoryPage";
import PaymentHistoryPage from "../pages/user/PaymentHistoryPage";
import PricingPage from "../pages/user/PricingPage";
import ProtectedRoute from "./ProtectedRoute";

// Admin Pages
import AdminProtectedRoute from "./AdminProtectedRoute";
import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUserManagement from "../pages/admin/AdminUserManagement";
import AdminPaymentManagement from "../pages/admin/AdminPaymentManagement";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-history"
          element={
            <ProtectedRoute>
              <PaymentHistoryPage />
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
        <Route
          path="/holland-test"
          element={
            <ProtectedRoute>
              <HollandTestPage />
            </ProtectedRoute>
          }
        />
        <Route path="/mbti" element={<MbtiPage />} />
        <Route
          path="/mbti-test"
          element={
            <ProtectedRoute>
              <MbtiTestPage />
            </ProtectedRoute>
          }
        />
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
        <Route
          path="/pricing"
          element={
            <ProtectedRoute>
              <PricingPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminUserManagement />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminPaymentManagement />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default AppRoutes;
