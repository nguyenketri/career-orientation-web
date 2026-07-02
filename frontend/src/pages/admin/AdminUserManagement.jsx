import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../../api/axios";

const PLAN_BADGE = {
  FREE: "bg-slate-100 text-slate-600",
  PAID: "bg-blue-100 text-blue-600",
  PREMIUM: "bg-orange-100 text-orange-600",
};

const fmtDate = (d) =>
  d && !isNaN(new Date(d).getTime())
    ? new Date(d).toLocaleDateString("vi-VN")
    : "—";
const fmtPct = (n) =>
  n === null || n === undefined ? "Mới" : `${n > 0 ? "+" : ""}${n}%`;
const userCode = (id) => `#CZ${String(id || "").slice(-4).toUpperCase()}`;

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

const AdminUserManagement = () => {
  const [searchParams] = useSearchParams();

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [joinedFrom, setJoinedFrom] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsersCount, setTotalUsersCount] = useState(0);

  const [toast, setToast] = useState("");
  const [exporting, setExporting] = useState(false);

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

  const activeFilters = {
    plan: planFilter || undefined,
    status: statusFilter || undefined,
    role: roleFilter || undefined,
    joinedFrom: joinedFrom || undefined,
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await axiosClient.get("/admin/users/stats");
      setStats(res.data.data);
    } catch (err) {
      console.error("Error fetching user stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async (page, search, filters) => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/admin/users", {
        params: { page, limit: 10, search: search || undefined, ...filters },
      });
      setUsers(res.data.data.users);
      setTotalPages(res.data.data.pages || 1);
      setTotalUsersCount(res.data.data.total || 0);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchStats();
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await fetchUsers(currentPage, searchTerm, activeFilters);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, planFilter, statusFilter, roleFilter, joinedFrom]);

  const refreshAll = () => {
    fetchStats();
    fetchUsers(currentPage, searchTerm, activeFilters);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  // ===== Xuất Excel (CSV) — toàn bộ user khớp bộ lọc hiện tại =====
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const res = await axiosClient.get("/admin/users", {
        params: {
          page: 1,
          limit: 10000,
          search: searchTerm || undefined,
          ...activeFilters,
        },
      });
      const all = res.data.data.users || [];
      const header = [
        "Mã người dùng",
        "Tên người dùng",
        "Email",
        "Số điện thoại",
        "Ngày gia nhập",
        "Vai trò",
        "Gói dịch vụ",
        "Trạng thái",
      ];
      const rows = all.map((u) => [
        userCode(u._id),
        u.name,
        u.email,
        u.phone || "",
        fmtDate(u.createdAt),
        u.role,
        u.subscriptionPlan || "FREE",
        u.status === "ACTIVE" ? "Hoạt động" : "Bị tạm khóa",
      ]);
      const csv =
        "﻿" +
        [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `caZup-nguoi-dung-${new Date().toISOString().slice(0, 10)}.csv`;
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
      setCreateError(err.response?.data?.message || "Không thể tạo tài khoản.");
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
      setEditError(err.response?.data?.message || "Không thể cập nhật tài khoản.");
    } finally {
      setEditSubmitting(false);
    }
  };

  // ===== Khóa / Mở khóa =====
  const handleToggleStatus = async (user) => {
    try {
      await axiosClient.patch(`/admin/users/${user._id}/status`);
      showToast(user.status === "ACTIVE" ? "Đã khóa tài khoản." : "Đã mở khóa tài khoản.");
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

  const statCards = [
    {
      name: "Tổng người dùng",
      value: totalUsersCount || stats?.total || 0,
      sub: `+${stats?.newThisWeek ?? 0} người dùng mới tuần này`,
      icon: "👥",
    },
    {
      name: "Đang hoạt động",
      value: stats?.activeCount ?? 0,
      sub: `${stats?.activePct ?? 0}% tổng số`,
      icon: "👁️",
    },
    {
      name: "Người dùng mới (7 ngày)",
      value: stats?.newThisWeek ?? 0,
      sub: `${fmtPct(stats?.weekGrowthPct)} so với tuần trước`,
      icon: "✨",
    },
    {
      name: "Gói Premium",
      value: stats?.premiumCount ?? 0,
      sub: `${stats?.premiumPct ?? 0}% tỉ lệ chuyển đổi`,
      icon: "⭐",
    },
  ];

  // Danh sách số trang hiển thị (rút gọn kiểu 1 2 3 ... N khi nhiều trang)
  const pageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Quản lý Người dùng
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý, theo dõi và hỗ trợ cộng đồng sinh viên caZup.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-bold transition disabled:opacity-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {exporting ? "Đang xuất..." : "Xuất Excel"}
          </button>
          <button
            onClick={() => {
              setCreateForm(emptyUserForm);
              setCreateError("");
              setCreateModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition flex items-center gap-2"
          >
            <span>+</span> Thêm người dùng
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div
            key={card.name}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-slate-500 text-sm font-medium">{card.name}</p>
              <span className="text-lg bg-slate-50 rounded-lg p-1.5">{card.icon}</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-1">
              {loadingStats ? "…" : card.value.toLocaleString("vi-VN")}
            </h3>
            <p className="text-xs text-slate-400">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 block">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Tìm theo tên, email hoặc SĐT..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 block">
              Loại tài khoản
            </label>
            <select
              value={planFilter}
              onChange={(e) => handleFilterChange(setPlanFilter)(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
            >
              <option value="">Tất cả</option>
              <option value="FREE">Free</option>
              <option value="PAID">Paid</option>
              <option value="PREMIUM">Premium</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 block">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(setStatusFilter)(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
            >
              <option value="">Tất cả</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Bị tạm khóa</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 block">
              Ngày tham gia (từ)
            </label>
            <input
              type="date"
              value={joinedFrom}
              onChange={(e) => handleFilterChange(setJoinedFrom)(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>
          <button
            onClick={() => setShowAdvanced((s) => !s)}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition whitespace-nowrap pb-2.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Bộ lọc nâng cao
          </button>
        </div>

        {showAdvanced && (
          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 block">
                Vai trò
              </label>
              <select
                value={roleFilter}
                onChange={(e) => handleFilterChange(setRoleFilter)(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
              >
                <option value="">Tất cả</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {(planFilter || statusFilter || roleFilter || joinedFrom) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setPlanFilter("");
                    setStatusFilter("");
                    setRoleFilter("");
                    setJoinedFrom("");
                    setCurrentPage(1);
                  }}
                  className="text-sm font-bold text-red-500 hover:underline pb-2.5"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Users Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <th className="px-6 py-3">Người dùng</th>
                <th className="px-6 py-3">Thông tin liên lạc</th>
                <th className="px-6 py-3">Ngày gia nhập</th>
                <th className="px-6 py-3">Loại tài khoản</th>
                <th className="px-6 py-3">Trạng thái</th>
                <th className="px-6 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    Đang tải...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className={`transition ${
                      user.status === "ACTIVE"
                        ? "hover:bg-slate-50/60"
                        : "bg-red-50/40 hover:bg-red-50/70"
                    }`}
                  >
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
                          <p className="text-[11px] text-slate-400">ID: {userCode(user._id)}</p>
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
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                          user.status === "ACTIVE" ? "text-teal-600" : "text-red-500"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === "ACTIVE" ? "bg-teal-500" : "bg-red-500"
                          }`}
                        />
                        {user.status === "ACTIVE" ? "Hoạt động" : "Bị tạm khóa"}
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
            {(currentPage - 1) * 10 + users.length} trên{" "}
            {totalUsersCount.toLocaleString("vi-VN")} kết quả
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50 transition"
            >
              ‹
            </button>
            {pageNumbers().map((p, idx) =>
              p === "..." ? (
                <span key={`e${idx}`} className="px-1 text-slate-400 font-bold">
                  ...
                </span>
              ) : (
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
              ),
            )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50 transition"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Users List - Mobile (Cards) */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {loading ? (
          <div className="text-center py-10 text-slate-400">Đang tải...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            Không tìm thấy người dùng nào
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className={`p-5 rounded-2xl border shadow-sm space-y-4 ${
                user.status === "ACTIVE"
                  ? "bg-white border-slate-100"
                  : "bg-red-50/40 border-red-100"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name?.charAt(0)?.toUpperCase() || "U"
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-400">{userCode(user._id)}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                    user.status === "ACTIVE" ? "text-teal-600" : "text-red-500"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      user.status === "ACTIVE" ? "bg-teal-500" : "bg-red-500"
                    }`}
                  />
                  {user.status === "ACTIVE" ? "Hoạt động" : "Bị tạm khóa"}
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
                  Tham gia {fmtDate(user.createdAt)}
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

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition"
            >
              Trước
            </button>
            <span className="text-sm text-slate-500">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition"
            >
              Sau
            </button>
          </div>
        )}
      </div>

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
                <h2 className="text-xl font-black text-slate-900">Thêm người dùng</h2>
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
              <p className="text-sm text-slate-500 -mt-2">
                {editUser.email} · {userCode(editUser._id)}
              </p>

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
    </motion.div>
  );
};

export default AdminUserManagement;
