import { useEffect, useState } from "react";
import axiosClient from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminReport } from "../../context/AdminReportContext";

const MONTHS = [
  "T1", "T2", "T3", "T4", "T5", "T6",
  "T7", "T8", "T9", "T10", "T11", "T12",
];

const PLAN_BADGE = {
  FREE: "bg-slate-100 text-slate-600",
  PAID: "bg-blue-100 text-blue-600",
  PREMIUM: "bg-orange-100 text-orange-600",
};

const fmtVND = (n) => `${Number(n || 0).toLocaleString("vi-VN")} VND`;
const fmtDate = (d) =>
  d && !isNaN(new Date(d).getTime())
    ? new Date(d).toLocaleDateString("vi-VN")
    : "—";

// Escape 1 ô CSV: bọc trong dấu ngoặc kép, nhân đôi dấu " bên trong
const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const emptyUserForm = {
  name: "",
  email: "",
  password: "",
  role: "user",
  subscriptionPlan: "FREE",
  subscriptionDays: 30,
};

const AdminDashboard = () => {
  const openReport = useAdminReport();

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState("All");
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [toast, setToast] = useState("");
  const [exporting, setExporting] = useState(false);
  const [hoveredMonth, setHoveredMonth] = useState(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyUserForm);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState(emptyUserForm);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const showToast = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 2600);
  };

  // Hàm THUẦN dùng lại được cả trong effect lẫn trong các handler (create/edit/delete...)
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await axiosClient.get("/admin/stats");
      setStats(res.data.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchMonthlyRevenue = async () => {
    try {
      const res = await axiosClient.get("/admin/monthly-revenue");
      setMonthlyRevenueData(res.data.data);
    } catch (err) {
      console.error("Error fetching monthly revenue:", err);
    }
  };

  const fetchUsers = async (page, search) => {
    setLoadingUsers(true);
    try {
      const res = await axiosClient.get("/admin/users", {
        params: { page, limit: 10, search: search || undefined },
      });
      setUsers(res.data.data.users);
      setTotalPages(res.data.data.pages || 1);
      setTotalUsersCount(res.data.data.total || 0);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    (async () => {
      await Promise.all([fetchStats(), fetchMonthlyRevenue()]);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await fetchUsers(currentPage, searchTerm);
    })();
  }, [currentPage, searchTerm]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const refreshAll = () => {
    fetchStats();
    fetchUsers(currentPage, searchTerm);
  };

  // ===== Xuất Excel (CSV) — toàn bộ user khớp bộ lọc hiện tại =====
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const res = await axiosClient.get("/admin/users", {
        params: { page: 1, limit: 10000, search: searchTerm || undefined },
      });
      const all = res.data.data.users || [];
      const header = [
        "Tên người dùng",
        "Email",
        "Số điện thoại",
        "Ngày đăng ký",
        "Vai trò",
        "Gói dịch vụ",
        "Trạng thái",
      ];
      const rows = all.map((u) => [
        u.name,
        u.email,
        u.phone || "",
        fmtDate(u.createdAt),
        u.role,
        u.subscriptionPlan || "FREE",
        u.status === "ACTIVE" ? "Hoạt động" : "Đã khóa",
      ]);
      const csv =
        "﻿" +
        [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `caZup-danh-sach-tai-khoan-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      showToast("Không thể xuất dữ liệu, vui lòng thử lại.");
    } finally {
      setExporting(false);
    }
  };

  // ===== Tạo tài khoản mới =====
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError("");
    setCreateSubmitting(true);
    try {
      await axiosClient.post("/admin/users", createForm);
      setCreateModalOpen(false);
      setCreateForm(emptyUserForm);
      showToast("Đã tạo tài khoản mới.");
      refreshAll();
    } catch (err) {
      setCreateError(
        err.response?.data?.message || "Không thể tạo tài khoản.",
      );
    } finally {
      setCreateSubmitting(false);
    }
  };

  // ===== Sửa tài khoản =====
  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({
      name: user.name,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan || "FREE",
      subscriptionDays: 30,
    });
    setEditError("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError("");
    setEditSubmitting(true);
    try {
      await axiosClient.put(`/admin/users/${editUser._id}`, editForm);
      setEditUser(null);
      showToast("Đã cập nhật tài khoản.");
      refreshAll();
    } catch (err) {
      setEditError(
        err.response?.data?.message || "Không thể cập nhật tài khoản.",
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  // ===== Khóa / Mở khóa =====
  const handleToggleStatus = async (user) => {
    try {
      await axiosClient.patch(`/admin/users/${user._id}/status`);
      showToast(
        user.status === "ACTIVE"
          ? "Đã khóa tài khoản."
          : "Đã mở khóa tài khoản.",
      );
      refreshAll();
    } catch (err) {
      console.error(err);
      showToast("Không thể cập nhật trạng thái.");
    }
  };

  // ===== Xóa (mềm) =====
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setDeleteSubmitting(true);
    try {
      await axiosClient.delete(`/admin/users/${deletingUser._id}`);
      setDeletingUser(null);
      showToast("Đã xóa tài khoản.");
      refreshAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Không thể xóa tài khoản.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const yearRevenue = monthlyRevenueData.reduce(
    (sum, m) => sum + (m.amount || 0),
    0,
  );

  const statCards = [
    {
      name: "Người dùng mới (tháng này)",
      value: stats?.newUsersThisMonth ?? 0,
      icon: "👤",
      color: "bg-blue-100",
    },
    {
      name: "Doanh thu cả năm",
      value: fmtVND(yearRevenue),
      icon: "💰",
      color: "bg-orange-100",
    },
    {
      name: "Test Holland hoàn thành",
      value: stats?.hollandTotal ?? 0,
      icon: "🧭",
      color: "bg-blue-100",
    },
    {
      name: "Test MBTI hoàn thành",
      value: stats?.mbtiTotal ?? 0,
      icon: "🧠",
      color: "bg-teal-100",
    },
  ];

  const chartMonths = MONTHS.filter(
    (m) => selectedMonth === "All" || m === selectedMonth,
  );
  const maxRevenue = Math.max(...monthlyRevenueData.map((m) => m.amount), 1);

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      {/* Stat Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {statCards.map((card) => (
          <div
            key={card.name}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className={`${card.color} p-2.5 rounded-xl text-lg w-fit mb-4`}>
              {card.icon}
            </div>
            <p className="text-slate-500 text-xs font-medium mb-1">
              {card.name}
            </p>
            <h3 className="text-xl font-black text-slate-900 truncate">
              {loadingStats ? "…" : card.value}
            </h3>
          </div>
        ))}
      </motion.div>

      {/* Chart + Top Majors */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900">Xu hướng Doanh thu</h3>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold bg-slate-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-200 transition"
            >
              <option value="All">Năm nay</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m === "T" + (new Date().getMonth() + 1) ? "Tháng này" : m}
                </option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto -mx-2 px-2">
            <div
              className="flex items-end justify-between h-64 gap-3"
              style={{ minWidth: chartMonths.length > 6 ? `${chartMonths.length * 48}px` : undefined }}
            >
              {chartMonths.map((month) => {
                const monthData = monthlyRevenueData.find((m) => m.month === month);
                const amount = monthData ? monthData.amount : 0;
                const heightPct = Math.max((amount / maxRevenue) * 100, 3);
                const isCurrentMonth = month === "T" + (new Date().getMonth() + 1);
                return (
                  <div
                    key={month}
                    className="relative flex-1 flex flex-col items-center gap-2 h-full shrink-0"
                    onMouseEnter={() => setHoveredMonth(month)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    onClick={() =>
                      setHoveredMonth((prev) => (prev === month ? null : month))
                    }
                  >
                    {hoveredMonth === month && (
                      <div className="absolute -top-2 -translate-y-full bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-10">
                        {fmtVND(amount)}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
                      </div>
                    )}
                    <div className="w-full flex-1 flex items-end justify-center">
                      <div
                        className={`w-full max-w-[42px] min-w-[20px] rounded-t-lg transition-all duration-500 cursor-pointer ${
                          isCurrentMonth ? "bg-[#0f172a]" : "bg-blue-100 hover:bg-blue-200"
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA Báo cáo chi tiết */}
        <div className="bg-[#0f172a] text-white p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">
            📊
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">Báo cáo hệ thống</h3>
            <p className="text-sm text-white/50 leading-relaxed">
              Xem chi tiết phân bổ gói cước, loại test và xu hướng doanh thu 6 tháng gần nhất.
            </p>
          </div>
          <button
            onClick={openReport}
            className="mt-1 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-sm font-bold transition"
          >
            Xem tất cả báo cáo
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </motion.div>

      {/* Quản lý Tài khoản */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">Quản lý Tài khoản</h3>
            <p className="text-sm text-slate-500">
              Danh sách {totalUsersCount.toLocaleString("vi-VN")} người dùng đang hoạt động
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Tìm theo tên, email..."
              className="w-full sm:w-56 px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportExcel}
                disabled={exporting}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition disabled:opacity-50"
              >
                {exporting ? "Đang xuất..." : "Xuất Excel"}
              </button>
              <button
                onClick={() => {
                  setCreateForm(emptyUserForm);
                  setCreateError("");
                  setCreateModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition"
              >
                <span>+</span> Thêm mới
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Card List */}
        <div className="lg:hidden divide-y divide-slate-50 border-t border-slate-100">
          {loadingUsers ? (
            <p className="px-6 py-10 text-center text-slate-400">Đang tải...</p>
          ) : users.length === 0 ? (
            <p className="px-6 py-10 text-center text-slate-400">
              Không tìm thấy người dùng nào.
            </p>
          ) : (
            users.map((user) => (
              <div key={user._id} className="p-5 space-y-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name?.charAt(0)?.toUpperCase() || "U"
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      user.status === "ACTIVE"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {user.status === "ACTIVE" ? "Hoạt động" : "Đã khóa"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      PLAN_BADGE[user.subscriptionPlan] || PLAN_BADGE.FREE
                    }`}
                  >
                    {user.subscriptionPlan || "FREE"}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                    Đăng ký {fmtDate(user.createdAt)}
                  </span>
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => openEdit(user)}
                    className="flex-1 px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleToggleStatus(user)}
                    className={`flex-1 px-3 py-2 text-xs font-bold rounded-xl transition ${
                      user.status === "ACTIVE"
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    {user.status === "ACTIVE" ? "Khóa" : "Mở khóa"}
                  </button>
                  <button
                    onClick={() => setDeletingUser(user)}
                    className="flex-1 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <th className="px-6 py-3">Tên người dùng</th>
                <th className="px-6 py-3">Email / Số điện thoại</th>
                <th className="px-6 py-3">Ngày đăng ký</th>
                <th className="px-6 py-3">Gói dịch vụ</th>
                <th className="px-6 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loadingUsers ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    Đang tải...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name?.charAt(0)?.toUpperCase() || "U"
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{user.name}</p>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              user.status === "ACTIVE"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {user.status === "ACTIVE" ? "Hoạt động" : "Đã khóa"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">{user.email}</p>
                      <p className="text-xs text-slate-400">
                        {user.phone || "Chưa cập nhật SĐT"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {fmtDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          PLAN_BADGE[user.subscriptionPlan] || PLAN_BADGE.FREE
                        }`}
                      >
                        {user.subscriptionPlan || "FREE"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(user)}
                          title="Sửa tài khoản"
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          title={user.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa"}
                          className={`p-2 rounded-lg transition ${
                            user.status === "ACTIVE"
                              ? "text-amber-600 hover:bg-amber-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {user.status === "ACTIVE" ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM8 11V7a4 4 0 118 0" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => setDeletingUser(user)}
                          title="Xóa tài khoản"
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Hiển thị {users.length > 0 ? (currentPage - 1) * 10 + 1 : 0} -{" "}
            {(currentPage - 1) * 10 + users.length} của{" "}
            {totalUsersCount.toLocaleString("vi-VN")}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50 transition"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-bold transition ${
                  currentPage === p
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50 transition"
            >
              ›
            </button>
          </div>
        </div>
      </motion.div>

      {/* ===== Modal: Thêm mới ===== */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleCreateSubmit}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-7 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900">Thêm tài khoản mới</h2>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition"
                >
                  ✕
                </button>
              </div>

              {createError && (
                <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">
                  {createError}
                </p>
              )}

              <div>
                <label className="text-xs font-bold text-slate-500">Tên người dùng</label>
                <input
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Email</label>
                <input
                  required
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Mật khẩu tạm thời</label>
                <input
                  required
                  type="text"
                  minLength={6}
                  value={createForm.password}
                  onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500">Vai trò</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200 transition"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">Gói dịch vụ</label>
                  <select
                    value={createForm.subscriptionPlan}
                    onChange={(e) => setCreateForm((f) => ({ ...f, subscriptionPlan: e.target.value }))}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200 transition"
                  >
                    <option value="FREE">FREE</option>
                    <option value="PAID">PAID</option>
                    <option value="PREMIUM">PREMIUM</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={createSubmitting}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition disabled:opacity-50"
              >
                {createSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* ===== Modal: Sửa tài khoản ===== */}
      <AnimatePresence>
        {editUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleEditSubmit}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-7 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900">Sửa tài khoản</h2>
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-slate-500 -mt-2">{editUser.email}</p>

              {editError && (
                <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">
                  {editError}
                </p>
              )}

              <div>
                <label className="text-xs font-bold text-slate-500">Tên người dùng</label>
                <input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500">Vai trò</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200 transition"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">Gói dịch vụ</label>
                  <select
                    value={editForm.subscriptionPlan}
                    onChange={(e) => setEditForm((f) => ({ ...f, subscriptionPlan: e.target.value }))}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200 transition"
                  >
                    <option value="FREE">FREE</option>
                    <option value="PAID">PAID</option>
                    <option value="PREMIUM">PREMIUM</option>
                  </select>
                </div>
              </div>
              {editForm.subscriptionPlan !== "FREE" && (
                <div>
                  <label className="text-xs font-bold text-slate-500">
                    Số ngày hiệu lực (kể từ hôm nay)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editForm.subscriptionDays}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, subscriptionDays: e.target.value }))
                    }
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={editSubmitting}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition disabled:opacity-50"
              >
                {editSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* ===== Confirm: Xóa tài khoản ===== */}
      <AnimatePresence>
        {deletingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-7 space-y-4 text-center"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center text-2xl">
                🗑️
              </div>
              <h2 className="text-lg font-black text-slate-900">
                Xóa tài khoản "{deletingUser.name}"?
              </h2>
              <p className="text-sm text-slate-500">
                Tài khoản sẽ bị ẩn khỏi hệ thống và không thể đăng nhập. Dữ liệu vẫn được lưu trữ và có thể khôi phục bởi quản trị viên hệ thống.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeletingUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition disabled:opacity-50"
                >
                  {deleteSubmitting ? "Đang xóa..." : "Xóa tài khoản"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
