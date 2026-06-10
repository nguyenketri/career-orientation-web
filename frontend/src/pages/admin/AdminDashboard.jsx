import { useEffect, useState } from "react";
import axiosClient from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosClient.get("/admin/stats");
        setStats(res.data.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchRecentUsers = async () => {
      try {
        const res = await axiosClient.get(
          `/admin/users?page=${currentPage}&limit=5`,
        );
        setRecentUsers(res.data.data.users);
        setTotalPages(res.data.data.pages);
      } catch (err) {
        console.error("Error fetching recent users:", err);
      }
    };
    fetchRecentUsers();
  }, [currentPage]);

  const handleGenerateReport = async () => {
    setReportLoading(true);
    setIsReportModalOpen(true);
    try {
      const res = await axiosClient.get("/admin/report");
      setReportData(res.data.data);
    } catch (err) {
      console.error("Error fetching report:", err);
    } finally {
      setReportLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-full text-slate-600">
        Đang tải...
      </div>
    );

  const statCards = [
    {
      name: "Người dùng mới",
      value: stats?.totalUsers || 0,
      trend: "Thực tế",
      icon: "👥",
      color: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      name: "Doanh thu tháng",
      value: `${(stats?.totalRevenue || 0).toLocaleString()}đ`,
      trend: "Thực tế",
      icon: "📊",
      color: "bg-orange-100",
      textColor: "text-orange-600",
    },
    {
      name: "Số người đăng ký",
      value: stats?.totalSubscriptions || 0,
      trend: "Thực tế",
      icon: "💼",
      color: "bg-teal-100",
      textColor: "text-teal-600",
    },
    {
      name: "Test được làm",
      value: stats?.totalTests || 0,
      trend: "Thực tế",
      icon: "📝",
      color: "bg-purple-100",
      textColor: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Xem tổng quan hệ thống quản lý
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((card) => (
          <div
            key={card.name}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${card.color} p-3 rounded-lg text-xl`}>
                {card.icon}
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {card.trend}
              </span>
            </div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">
              {card.name}
            </p>
            <h3 className="text-2xl font-black text-slate-900">{card.value}</h3>
          </div>
        ))}
      </motion.div>

      {/* Charts & Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">
              Xu hướng doanh thu
            </h3>
            <span className="text-xs text-slate-500">Xem lịch sử →</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-end justify-between h-32 gap-2">
              {["T2", "T3", "T4", "T5", "T6", "T7"].map((day, i) => (
                <div
                  key={day}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className={`w-full rounded-lg transition-all ${
                      i === 3 ? "bg-slate-900 h-20" : "bg-slate-200 h-12"
                    }`}
                  />
                  <span className="text-xs text-slate-500">{day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#0f172a] text-white p-6 rounded-2xl shadow-lg">
          <h3 className="font-bold text-lg mb-4">Tính năng nhanh</h3>
          <div className="space-y-3">
            <button
              onClick={handleGenerateReport}
              className="w-full bg-orange-500 py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition"
            >
              Generate Report
            </button>
          </div>
        </div>
      </motion.div>

      {/* Recent Users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900">
            Người dùng mới nhất
          </h3>
        </div>
        <div className="space-y-3">
          {recentUsers.map((user, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                  {user.name?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${
                    user.subscriptionPlan === "PREMIUM"
                      ? "bg-purple-100 text-purple-600"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {user.subscriptionPlan}
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                    : ""}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Trước
          </button>
          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                  currentPage === i + 1
                    ? "bg-orange-500 text-white"
                    : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Sau
          </button>
        </div>
      </motion.div>

      {/* Report Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">
                      Báo cáo hệ thống chi tiết
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Dữ liệu tổng hợp tính đến{" "}
                      {new Date().toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsReportModalOpen(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition"
                  >
                    ✕
                  </button>
                </div>

                {reportLoading ? (
                  <div className="py-20 text-center text-slate-500">
                    Đang tạo báo cáo...
                  </div>
                ) : reportData ? (
                  <div className="space-y-8">
                    {/* Summary Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-blue-50 p-6 rounded-2xl">
                        <p className="text-blue-600 text-xs font-bold uppercase mb-1">
                          Tổng người dùng
                        </p>
                        <h4 className="text-2xl font-black text-blue-900">
                          {reportData.summary.totalUsers}
                        </h4>
                      </div>
                      <div className="bg-orange-50 p-6 rounded-2xl">
                        <p className="text-orange-600 text-xs font-bold uppercase mb-1">
                          Tổng doanh thu
                        </p>
                        <h4 className="text-2xl font-black text-orange-900">
                          {reportData.summary.totalRevenue.toLocaleString()}đ
                        </h4>
                      </div>
                      <div className="bg-purple-50 p-6 rounded-2xl">
                        <p className="text-purple-600 text-xs font-bold uppercase mb-1">
                          Tổng lượt test
                        </p>
                        <h4 className="text-2xl font-black text-purple-900">
                          {reportData.summary.totalTests}
                        </h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Plan Distribution */}
                      <div className="bg-slate-50 p-6 rounded-2xl">
                        <h3 className="font-bold text-slate-900 mb-4">
                          Phân bổ gói cước
                        </h3>
                        <div className="space-y-3">
                          {reportData.planDistribution.map((item) => (
                            <div
                              key={item._id}
                              className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm"
                            >
                              <span className="font-medium text-slate-700">
                                {item._id || "FREE"}
                              </span>
                              <span className="font-bold text-slate-900">
                                {item.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Test Distribution */}
                      <div className="bg-slate-50 p-6 rounded-2xl">
                        <h3 className="font-bold text-slate-900 mb-4">
                          Phân bổ loại Test
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm">
                            <span className="font-medium text-slate-700">
                              Holland Test
                            </span>
                            <span className="font-bold text-slate-900">
                              {reportData.testDistribution.holland}
                            </span>
                          </div>
                          <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm">
                            <span className="font-medium text-slate-700">
                              MBTI Test
                            </span>
                            <span className="font-bold text-slate-900">
                              {reportData.testDistribution.mbti}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Revenue Trend */}
                    <div className="bg-slate-50 p-6 rounded-2xl">
                      <h3 className="font-bold text-slate-900 mb-4">
                        Xu hướng doanh thu (6 tháng)
                      </h3>
                      <div className="space-y-2">
                        {reportData.revenueTrend.map((item) => (
                          <div
                            key={item._id}
                            className="flex items-center gap-4"
                          >
                            <span className="text-xs font-medium text-slate-500 w-16">
                              {item._id}
                            </span>
                            <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-orange-500"
                                style={{
                                  width: `${
                                    (item.amount /
                                      Math.max(
                                        ...reportData.revenueTrend.map(
                                          (r) => r.amount,
                                        ),
                                      )) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-900">
                              {item.amount.toLocaleString()}đ
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                      <button
                        onClick={() => window.print()}
                        className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition"
                      >
                        In báo cáo
                      </button>
                      <button
                        onClick={() => setIsReportModalOpen(false)}
                        className="px-6 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-300 transition"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center text-red-500">
                    Không thể tải dữ liệu báo cáo.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
