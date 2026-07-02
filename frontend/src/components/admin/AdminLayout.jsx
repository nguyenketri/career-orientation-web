import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { logoutUser, getUser } from "../../utils/auth";
import axiosClient from "../../api/axios";
import NotificationBell from "../NotificationBell";
import { AdminReportContext } from "../../context/AdminReportContext";

const NAV_ICONS = {
  dashboard: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zm0 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
  users: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4",
  school: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.42A12.02 12.02 0 0121 12c0 2.31-.55 4.49-1.53 6.42M12 14L5.84 10.58A12.02 12.02 0 003 12c0 2.31.55 4.49 1.53 6.42M12 14v7",
  question: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  payment: "M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  report: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
};

const NavIcon = ({ d, className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

const AdminLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const admin = getUser();

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: NAV_ICONS.dashboard },
    { name: "Quản lý User", path: "/admin/users", icon: NAV_ICONS.users },
    { name: "Quản lý Ngành/Trường", path: "/admin/majors", icon: NAV_ICONS.school },
    { name: "Quản lý Câu hỏi", path: "/admin/questions", icon: NAV_ICONS.question },
    { name: "Quản lý Thanh toán", path: "/admin/payments", icon: NAV_ICONS.payment },
  ];

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const openReport = async () => {
    setIsReportOpen(true);
    setReportLoading(true);
    try {
      const res = await axiosClient.get("/admin/report");
      setReportData(res.data.data);
    } catch (err) {
      console.error("Error fetching report:", err);
    } finally {
      setReportLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/admin/users?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
    <AdminReportContext.Provider value={openReport}>
      <div className="flex min-h-screen bg-[#f8fafc]">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✕" : "☰"}
        </button>

        {/* Sidebar */}
        <aside
          className={`${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static z-40 w-64 h-full bg-[#0f172a] text-white flex flex-col transition-transform duration-300`}
        >
          <div className="p-6 border-b border-slate-700">
            <h1 className="text-lg font-bold">Admin Panel</h1>
            <p className="text-xs text-slate-400">System Controller</p>
          </div>

          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === item.path
                    ? "bg-[#1e293b] text-white"
                    : "text-slate-400 hover:bg-[#1e293b] hover:text-white"
                }`}
              >
                <NavIcon d={item.icon} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 space-y-3 border-t border-slate-700">
            <button
              onClick={openReport}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-sm transition"
            >
              <NavIcon d={NAV_ICONS.report} className="w-4 h-4" />
              Generate Report
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 text-slate-400 hover:text-white text-sm transition px-2"
            >
              <NavIcon d={NAV_ICONS.logout} className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <header className="h-16 shrink-0 bg-white border-b border-slate-100 flex items-center justify-between gap-4 px-5 lg:px-8 pl-20 lg:pl-8">
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
              <div className="relative">
                <svg
                  className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm nhanh (tên, email)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-100 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
            </form>

            <div className="flex items-center gap-3 shrink-0">
              <NotificationBell />
              <Link to="/profile" className="flex items-center gap-3 group">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 leading-tight">
                    {admin?.name || "Admin"}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Hệ thống Controller
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 group-hover:ring-2 group-hover:ring-blue-200 transition shrink-0">
                  {admin?.avatar ? (
                    <img src={admin.avatar} alt={admin.name} className="w-full h-full object-cover" />
                  ) : (
                    <NavIcon d={NAV_ICONS.users} className="w-5 h-5" />
                  )}
                </div>
              </Link>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
        </div>
      </div>

      {/* Generate Report Modal — dùng chung cho toàn bộ admin panel */}
      <AnimatePresence>
        {isReportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:bg-white print:backdrop-blur-none print:p-0 print:static print:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl print:shadow-none print:max-h-none print:overflow-visible print:rounded-none"
            >
              <div className="p-8 print:p-0">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">
                      Báo cáo hệ thống chi tiết
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Dữ liệu tổng hợp tính đến {new Date().toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsReportOpen(false)}
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

                    <div className="bg-slate-50 p-6 rounded-2xl">
                      <h3 className="font-bold text-slate-900 mb-4">
                        Xu hướng doanh thu (6 tháng)
                      </h3>
                      <div className="space-y-2">
                        {reportData.revenueTrend.map((item) => (
                          <div key={item._id} className="flex items-center gap-4">
                            <span className="text-xs font-medium text-slate-500 w-16">
                              {item._id}
                            </span>
                            <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-orange-500"
                                style={{
                                  width: `${
                                    reportData.revenueTrend.length > 0
                                      ? (item.amount /
                                          Math.max(
                                            ...reportData.revenueTrend.map((r) => r.amount),
                                            1,
                                          )) *
                                        100
                                      : 0
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

                    <div className="flex justify-end gap-4 pt-4 print:hidden">
                      <button
                        onClick={() => window.print()}
                        className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition"
                      >
                        In báo cáo
                      </button>
                      <button
                        onClick={() => setIsReportOpen(false)}
                        className="px-6 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-300 transition"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-4">
                    <p className="text-red-500 font-medium">
                      Không thể tải dữ liệu báo cáo.
                    </p>
                    <button
                      onClick={openReport}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition"
                    >
                      Thử lại
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminReportContext.Provider>
  );
};

export default AdminLayout;
