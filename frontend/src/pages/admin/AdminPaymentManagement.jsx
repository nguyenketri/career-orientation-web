import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axiosClient from "../../api/axios";

const STATUS_BADGE = {
  SUCCESS: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  FAILED: "bg-red-100 text-red-700",
};
const STATUS_LABEL = { SUCCESS: "Thành công", PENDING: "Đang chờ", FAILED: "Thất bại" };
const PLAN_BADGE = { PAID: "bg-blue-50 text-blue-600", PREMIUM: "bg-purple-50 text-purple-600" };
const PLAN_LABEL = { FREE: "Cơ bản", PAID: "Tiêu chuẩn", PREMIUM: "Cao cấp" };

const fmtDateTime = (d) =>
  d && !isNaN(new Date(d).getTime())
    ? new Date(d).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

const fmtPct = (n) =>
  n === null || n === undefined ? "Mới" : `${n > 0 ? "+" : ""}${n}%`;

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const pageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = [1];
  if (currentPage > 3) pages.push("...");
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (currentPage < totalPages - 2) pages.push("...");
  pages.push(totalPages);
  return pages;
};

const AdminPaymentManagement = () => {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [toast, setToast] = useState("");
  const [exporting, setExporting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const showToast = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 3000);
  };

  const activeFilters = {
    status: statusFilter || undefined,
    planType: planFilter || undefined,
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await axiosClient.get("/admin/payments/stats");
      setStats(res.data.data);
    } catch (err) {
      console.error("Error fetching payment stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/admin/payments", {
        params: { page: currentPage, limit: 10, search: debouncedSearch || undefined, ...activeFilters },
      });
      setPayments(res.data.data.payments);
      setTotalPages(res.data.data.pages || 1);
      setTotal(res.data.data.total || 0);
    } catch (err) {
      console.error("Error fetching payments:", err);
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
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    (async () => {
      await fetchPayments();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch, statusFilter, planFilter]);

  const refreshAll = async () => {
    await Promise.all([fetchStats(), fetchPayments()]);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleUpdateStatus = async (payment, status) => {
    setUpdatingId(payment._id);
    try {
      await axiosClient.put("/admin/payments/status", { paymentId: payment._id, status });
      showToast(
        status === "SUCCESS" ? "Đã xác nhận giao dịch thành công." : "Đã đánh dấu giao dịch thất bại.",
      );
      await refreshAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Không thể cập nhật trạng thái.");
    } finally {
      setUpdatingId(null);
    }
  };

  // ===== Xuất danh sách (CSV toàn bộ giao dịch khớp bộ lọc hiện tại) =====
  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await axiosClient.get("/admin/payments", {
        params: { page: 1, limit: 10000, search: debouncedSearch || undefined, ...activeFilters },
      });
      const all = res.data.data.payments || [];
      const header = ["Mã GD", "Người dùng", "Email", "Gói dịch vụ", "Số tiền", "Phương thức", "Thời gian", "Trạng thái"];
      const rows = all.map((p) => [
        p.transactionCode,
        p.user?.name || "",
        p.user?.email || "",
        p.planType,
        p.amount,
        p.paymentMethod === "QR" ? "Quét mã QR (PayOS)" : p.paymentMethod,
        fmtDateTime(p.createdAt),
        STATUS_LABEL[p.status] || p.status,
      ]);
      const csv = "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `caZup-giao-dich-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      showToast("Không thể xuất dữ liệu, vui lòng thử lại.");
    } finally {
      setExporting(false);
    }
  };

  const statCards = [
    {
      name: "Tổng doanh thu",
      value: `${(stats?.totalRevenue ?? 0).toLocaleString("vi-VN")}đ`,
      sub: `${fmtPct(stats?.revenueGrowthPct)} so với tháng trước`,
      icon: "💰",
    },
    {
      name: "Giao dịch thành công",
      value: (stats?.successCount ?? 0).toLocaleString("vi-VN"),
      sub: `trên tổng số ${(stats?.total ?? 0).toLocaleString("vi-VN")} giao dịch`,
      icon: "✅",
    },
    {
      name: "Chờ xử lý",
      value: (stats?.pendingCount ?? 0).toLocaleString("vi-VN"),
      sub: "phiên QR còn hiệu lực, chưa thanh toán",
      icon: "⏳",
    },
    {
      name: "Tỷ lệ thất bại",
      value: `${stats?.failureRatePct ?? 0}%`,
      sub: `${(stats?.failedCount ?? 0).toLocaleString("vi-VN")} giao dịch thất bại/hết hạn`,
      icon: "⚠️",
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Quản lý Thanh toán</h1>
          <p className="text-slate-500 text-sm mt-1">
            Theo dõi và quản lý các giao dịch tài chính trên hệ thống caZup.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition disabled:opacity-50 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {exporting ? "Đang xuất..." : "Xuất danh sách"}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div key={card.name} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <p className="text-slate-500 text-sm font-medium">{card.name}</p>
              <span className="text-lg bg-slate-50 rounded-lg p-1.5">{card.icon}</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-1">
              {loadingStats ? "…" : card.value}
            </h3>
            <p className="text-xs text-slate-400">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex-1 min-w-[220px]">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 block">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Tìm kiếm mã giao dịch, tên hoặc email..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
            />
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
              <option value="SUCCESS">Thành công</option>
              <option value="PENDING">Đang chờ</option>
              <option value="FAILED">Thất bại</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 block">
              Gói
            </label>
            <select
              value={planFilter}
              onChange={(e) => handleFilterChange(setPlanFilter)(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
            >
              <option value="">Tất cả</option>
              <option value="PAID">Tiêu chuẩn</option>
              <option value="PREMIUM">Cao cấp</option>
            </select>
          </div>
          {(statusFilter || planFilter || searchTerm) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setDebouncedSearch("");
                setStatusFilter("");
                setPlanFilter("");
                setCurrentPage(1);
              }}
              className="text-sm font-bold text-red-500 hover:underline pb-2.5 whitespace-nowrap"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Mobile View */}
        <div className="lg:hidden p-4 space-y-4">
          {loading ? (
            <p className="text-center py-10 text-slate-400">Đang tải...</p>
          ) : payments.length > 0 ? (
            payments.map((payment) => (
              <div key={payment._id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-sm font-mono font-bold text-blue-600">#{payment.transactionCode}</p>
                    <p className="text-xs text-slate-400">{fmtDateTime(payment.createdAt)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap ${STATUS_BADGE[payment.status]}`}>
                    {STATUS_LABEL[payment.status]}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden">
                      {payment.user?.avatar ? (
                        <img src={payment.user.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        payment.user?.name?.charAt(0)?.toUpperCase() || "U"
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{payment.user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{payment.user?.email}</p>
                    </div>
                  </div>
                  <p className="font-black text-slate-900 shrink-0">{payment.amount.toLocaleString("vi-VN")}đ</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${PLAN_BADGE[payment.planType]}`}>
                    {PLAN_LABEL[payment.planType] || payment.planType}
                  </span>
                  {payment.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(payment, "SUCCESS")}
                        disabled={updatingId === payment._id}
                        className="px-2 py-1 text-xs font-bold text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition disabled:opacity-50"
                      >
                        Xác nhận
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(payment, "FAILED")}
                        disabled={updatingId === payment._id}
                        className="px-2 py-1 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition disabled:opacity-50"
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-10 text-slate-400">Không có dữ liệu thanh toán</p>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <th className="px-6 py-3">Mã GD</th>
                <th className="px-6 py-3">Người dùng</th>
                <th className="px-6 py-3">Gói dịch vụ</th>
                <th className="px-6 py-3">Số tiền</th>
                <th className="px-6 py-3">Phương thức</th>
                <th className="px-6 py-3">Thời gian</th>
                <th className="px-6 py-3">Trạng thái</th>
                <th className="px-6 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-slate-400">Đang tải...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-slate-400">Không có dữ liệu thanh toán</td></tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-bold text-blue-600">#{payment.transactionCode}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden">
                          {payment.user?.avatar ? (
                            <img src={payment.user.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            payment.user?.name?.charAt(0)?.toUpperCase() || "U"
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{payment.user?.name}</p>
                          <p className="text-xs text-slate-500 truncate">{payment.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${PLAN_BADGE[payment.planType]}`}>
                        {PLAN_LABEL[payment.planType] || payment.planType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-slate-900">{payment.amount.toLocaleString("vi-VN")}đ</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2m-6 0H4m3-8H4m3 0V4m6 3V4m6 8V4m0 8h-8m8 8H7" />
                        </svg>
                        Quét mã QR
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {fmtDateTime(payment.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${STATUS_BADGE[payment.status]}`}>
                        {STATUS_LABEL[payment.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {payment.status === "PENDING" ? (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdateStatus(payment, "SUCCESS")}
                            disabled={updatingId === payment._id}
                            title="Xác nhận đã nhận thanh toán"
                            className="px-2.5 py-1.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition disabled:opacity-50"
                          >
                            Xác nhận
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(payment, "FAILED")}
                            disabled={updatingId === payment._id}
                            title="Đánh dấu thất bại"
                            className="px-2.5 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <div className="text-right text-slate-300 text-xs">—</div>
                      )}
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
            Hiển thị {payments.length > 0 ? (currentPage - 1) * 10 + 1 : 0} -{" "}
            {(currentPage - 1) * 10 + payments.length} trong tổng số {total.toLocaleString("vi-VN")} giao dịch
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50 transition"
            >
              ‹
            </button>
            {pageNumbers(currentPage, totalPages).map((p, idx) =>
              p === "..." ? (
                <span key={`e${idx}`} className="px-1 text-slate-400 font-bold">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition ${
                    currentPage === p ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
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

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-4 text-xs text-slate-400 border-t border-slate-100">
        <p>© 2026 caZup AI - Educational Management Platform</p>
        <p>Trợ giúp · Tài liệu API · Phản hồi</p>
      </div>
    </motion.div>
  );
};

export default AdminPaymentManagement;
