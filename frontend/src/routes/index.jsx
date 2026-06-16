import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProfilePage from "../pages/user/ProfilePage";
import ComparisonPage from "../pages/user/ComparisonPage";
import PublicComparisonPage from "../pages/user/PublicComparisonPage";
import MentorChatPage from "../pages/user/MentorChatPage";
import TestResultPage from "../pages/user/TestResultPage";
import TestsPage from "../pages/user/TestsPage";
import RecommendPage from "../pages/user/RecommendPage";
import UniversityDetailPage from "../pages/user/UniversityDetailPage";
import { RecommendationProvider } from "../context/RecommendationContext";
import HistoryPage from "../pages/user/HistoryPage";
import ResultDetailPage from "../pages/user/ResultDetailPage";
import RecommendationDetailPage from "../pages/user/RecommendationDetailPage";
import PaymentHistoryPage from "../pages/user/PaymentHistoryPage";
import PricingPage from "../pages/user/PricingPage";
import UpgradePromptPage from "../pages/user/UpgradePromptPage";
import ProtectedRoute from "./ProtectedRoute";

// Admin Pages
import AdminProtectedRoute from "./AdminProtectedRoute";
import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUserManagement from "../pages/admin/AdminUserManagement";
import AdminPaymentManagement from "../pages/admin/AdminPaymentManagement";
import AdminMajorUniversityManagement from "../pages/admin/AdminMajorUniversityManagement";
import AdminQuestionManagement from "../pages/admin/AdminQuestionManagement";

const AppRoutes = () => {
  return (
    <RecommendationProvider>
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
          <Route path="/recommend" element={<RecommendPage />} />
          <Route path="/university/:id" element={<UniversityDetailPage />} />
          <Route path="/test-result" element={<TestResultPage />} />
          <Route
            path="/result-detail/:type/:id"
            element={
              <ProtectedRoute>
                <ResultDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendation-detail/:id"
            element={
              <ProtectedRoute>
                <RecommendationDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="/tests" element={<TestsPage />} />
          <Route path="/comparison" element={<ComparisonPage />} />
          <Route path="/share-comparison" element={<PublicComparisonPage />} />
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
          <Route
            path="/upgrade-prompt"
            element={
              <ProtectedRoute>
                <UpgradePromptPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
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
          <Route
            path="/admin/majors"
            element={
              <AdminProtectedRoute>
                <AdminLayout>
                  <AdminMajorUniversityManagement />
                </AdminLayout>
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/questions"
            element={
              <AdminProtectedRoute>
                <AdminLayout>
                  <AdminQuestionManagement />
                </AdminLayout>
              </AdminProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </BrowserRouter>
    </RecommendationProvider>
  );
};

export default AppRoutes;
