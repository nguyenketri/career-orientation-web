import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../../api/axios";

// Phải khớp DIMENSION_PAIRS ở backend/models/mbtiQuestion.model.js —
// mỗi dimension chỉ có đúng 2 giá trị hợp lệ, chọn 1 cho optionA thì optionB
// tự động nhận giá trị còn lại, không cho phép nhập tay để tránh dữ liệu sai.
const DIMENSION_PAIRS = { EI: ["E", "I"], SN: ["S", "N"], TF: ["T", "F"], JP: ["J", "P"] };
const DIMENSION_LABEL = {
  EI: "Hướng ngoại / Hướng nội",
  SN: "Giác quan / Trực giác",
  TF: "Lý trí / Cảm xúc",
  JP: "Nguyên tắc / Linh hoạt",
};
const DIMENSION_BADGE = {
  EI: "bg-blue-100 text-blue-600",
  SN: "bg-purple-100 text-purple-600",
  TF: "bg-orange-100 text-orange-600",
  JP: "bg-teal-100 text-teal-600",
};
const HOLLAND_TYPES = ["R", "I", "A", "S", "E", "C"];
const HOLLAND_LABEL = {
  R: "Realistic",
  I: "Investigative",
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional",
};
const HOLLAND_BADGE = {
  R: "bg-blue-100 text-blue-600",
  I: "bg-purple-100 text-purple-600",
  A: "bg-pink-100 text-pink-600",
  S: "bg-green-100 text-green-600",
  E: "bg-orange-100 text-orange-600",
  C: "bg-slate-200 text-slate-600",
};

const fmtDate = (d) =>
  d && !isNaN(new Date(d).getTime()) ? new Date(d).toLocaleDateString("vi-VN") : "—";
const shortId = (id) => `...${String(id || "").slice(-7)}`;
const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const emptyMbtiForm = {
  question: "",
  dimension: "EI",
  optionA: { text: "", typeValue: "E" },
  optionB: { text: "", typeValue: "I" },
};
const emptyHollandForm = { content: "", type: "R" };

const AdminQuestionManagement = () => {
  const [activeTab, setActiveTab] = useState("mbti");

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [mbtiQuestions, setMbtiQuestions] = useState([]);
  const [hollandQuestions, setHollandQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [mbtiPage, setMbtiPage] = useState(1);
  const [mbtiTotalPages, setMbtiTotalPages] = useState(1);
  const [mbtiTotalCount, setMbtiTotalCount] = useState(0);
  const [hollandPage, setHollandPage] = useState(1);
  const [hollandTotalPages, setHollandTotalPages] = useState(1);
  const [hollandTotalCount, setHollandTotalCount] = useState(0);

  const [toast, setToast] = useState("");
  const [exporting, setExporting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyMbtiForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const currentPage = activeTab === "mbti" ? mbtiPage : hollandPage;
  const setCurrentPage = activeTab === "mbti" ? setMbtiPage : setHollandPage;
  const totalPages = activeTab === "mbti" ? mbtiTotalPages : hollandTotalPages;
  const totalCount = activeTab === "mbti" ? mbtiTotalCount : hollandTotalCount;
  const questions = activeTab === "mbti" ? mbtiQuestions : hollandQuestions;

  const showToast = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 2600);
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await axiosClient.get("/admin/questions/stats");
      setStats(res.data.data);
    } catch (err) {
      console.error("Error fetching question stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchPaginatedData = async (tab, page, search, status) => {
    setLoading(true);
    try {
      const endpoint = tab === "mbti" ? "/admin/questions/mbti" : "/admin/questions/holland";
      const res = await axiosClient.get(endpoint, {
        params: { page, limit: 10, search: search || undefined, status: status || undefined },
      });
      if (tab === "mbti") {
        setMbtiQuestions(res.data.data.questions);
        setMbtiTotalPages(res.data.data.pages);
        setMbtiTotalCount(res.data.data.total);
      } else {
        setHollandQuestions(res.data.data.questions);
        setHollandTotalPages(res.data.data.pages);
        setHollandTotalCount(res.data.data.total);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      showToast("Không thể tải danh sách câu hỏi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchPaginatedData(activeTab, currentPage, searchTerm, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, mbtiPage, hollandPage, searchTerm, statusFilter]);

  const refreshAll = () => {
    fetchStats();
    fetchPaginatedData(activeTab, currentPage, searchTerm, statusFilter);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
    setStatusFilter("");
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // ===== Đồng bộ dữ liệu — tải lại toàn bộ thẻ thống kê + danh sách đang xem =====
  const handleSync = async () => {
    setSyncing(true);
    await Promise.all([
      fetchStats(),
      fetchPaginatedData(activeTab, currentPage, searchTerm, statusFilter),
    ]);
    setSyncing(false);
    showToast("Đã đồng bộ dữ liệu mới nhất từ hệ thống.");
  };

  // ===== Xuất Excel (CSV) — toàn bộ câu hỏi của tab đang xem, khớp bộ lọc hiện tại =====
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const endpoint = activeTab === "mbti" ? "/admin/questions/mbti" : "/admin/questions/holland";
      const res = await axiosClient.get(endpoint, {
        params: { page: 1, limit: 10000, search: searchTerm || undefined, status: statusFilter || undefined },
      });
      const all = res.data.data.questions || [];

      let header, rows;
      if (activeTab === "mbti") {
        header = ["ID", "Câu hỏi", "Chiều", "Lựa chọn A", "Giá trị A", "Lựa chọn B", "Giá trị B", "Trạng thái", "Cập nhật"];
        rows = all.map((q) => [
          q._id,
          q.question,
          q.dimension,
          q.optionA?.text,
          q.optionA?.typeValue,
          q.optionB?.text,
          q.optionB?.typeValue,
          q.isActive === false ? "Tạm ẩn" : "Hoạt động",
          fmtDate(q.updatedAt),
        ]);
      } else {
        header = ["ID", "Nội dung", "Nhóm RIASEC", "Trạng thái", "Cập nhật"];
        rows = all.map((q) => [
          q._id,
          q.content,
          q.type,
          q.isActive === false ? "Tạm ẩn" : "Hoạt động",
          fmtDate(q.updatedAt),
        ]);
      }

      const csv = "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `caZup-cau-hoi-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      showToast("Không thể xuất dữ liệu, vui lòng thử lại.");
    } finally {
      setExporting(false);
    }
  };

  // ===== Thêm mới / Sửa =====
  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setFormError("");
    if (item) {
      setFormData(item);
    } else {
      setFormData(activeTab === "mbti" ? emptyMbtiForm : emptyHollandForm);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormError("");
  };

  // Đổi dimension -> reset lại cặp giá trị A/B hợp lệ tương ứng
  const handleDimensionChange = (dimension) => {
    const [a, b] = DIMENSION_PAIRS[dimension];
    setFormData((f) => ({
      ...f,
      dimension,
      optionA: { ...f.optionA, typeValue: a },
      optionB: { ...f.optionB, typeValue: b },
    }));
  };

  // Đổi giá trị Option A -> Option B tự động nhận giá trị còn lại của cặp (không cho nhập tay)
  const handleOptionALetterChange = (letter) => {
    const pair = DIMENSION_PAIRS[formData.dimension] || [];
    const other = pair.find((v) => v !== letter) || "";
    setFormData((f) => ({
      ...f,
      optionA: { ...f.optionA, typeValue: letter },
      optionB: { ...f.optionB, typeValue: other },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const endpoint = activeTab === "mbti" ? "/admin/questions/mbti" : "/admin/questions/holland";
      if (editingItem) {
        await axiosClient.put(`${endpoint}/${editingItem._id}`, formData);
        showToast("Đã cập nhật câu hỏi.");
      } else {
        await axiosClient.post(endpoint, formData);
        showToast("Đã thêm câu hỏi mới.");
      }
      handleCloseModal();
      refreshAll();
    } catch (err) {
      setFormError(err.response?.data?.message || "Không thể lưu câu hỏi.");
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Bật / tạm ẩn câu hỏi khỏi bài test (không xóa) =====
  const handleToggleStatus = async (item) => {
    try {
      const endpoint = activeTab === "mbti" ? "/admin/questions/mbti" : "/admin/questions/holland";
      await axiosClient.patch(`${endpoint}/${item._id}/status`);
      showToast(item.isActive === false ? "Đã kích hoạt lại câu hỏi." : "Đã tạm ẩn câu hỏi khỏi bài test.");
      refreshAll();
    } catch (err) {
      console.error(err);
      showToast("Không thể cập nhật trạng thái.");
    }
  };

  // ===== Xóa (mềm) =====
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setDeleteSubmitting(true);
    try {
      const endpoint = activeTab === "mbti" ? "/admin/questions/mbti" : "/admin/questions/holland";
      await axiosClient.delete(`${endpoint}/${deletingItem._id}`);
      setDeletingItem(null);
      showToast("Đã xóa câu hỏi.");
      refreshAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Không thể xóa câu hỏi.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const pageNumbers = () => {
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

  const statCards = [
    { name: "Tổng số câu hỏi", value: stats?.totalQuestions ?? 0, sub: "MBTI + Holland", icon: "📚" },
    {
      name: "MBTI Questions",
      value: stats?.mbtiTotal ?? 0,
      sub: `${stats?.mbtiActive ?? 0} đang hoạt động`,
      icon: "🧠",
    },
    {
      name: "Holland Questions",
      value: stats?.hollandTotal ?? 0,
      sub: `${stats?.hollandActive ?? 0} đang hoạt động`,
      icon: "🎯",
    },
    { name: "Active Status", value: `${stats?.activePct ?? 0}%`, sub: "Tỉ lệ câu hỏi hoạt động", icon: "✅", isText: true },
  ];

  const questionText = (q) => q.question || q.content || "";

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
          <h1 className="text-3xl font-black text-slate-900">Quản lý Câu hỏi</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý ngân hàng câu hỏi khảo sát MBTI và Holland</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition disabled:opacity-50 flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {syncing ? "Đang đồng bộ..." : "Sync Data"}
          </button>
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
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition flex items-center gap-2"
          >
            <span>+</span> Thêm câu hỏi mới
          </button>
        </div>
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
              {loadingStats ? "…" : card.isText ? card.value : Number(card.value).toLocaleString("vi-VN")}
            </h3>
            <p className="text-xs text-slate-400">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => handleTabChange("mbti")}
              className={`px-6 py-2 font-bold rounded-lg transition-all text-sm ${
                activeTab === "mbti" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              MBTI Questions <span className="ml-1 text-xs opacity-70">{mbtiTotalCount}</span>
            </button>
            <button
              onClick={() => handleTabChange("holland")}
              className={`px-6 py-2 font-bold rounded-lg transition-all text-sm ${
                activeTab === "holland" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Holland Questions <span className="ml-1 text-xs opacity-70">{hollandTotalCount}</span>
            </button>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 block">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Tìm kiếm nội dung câu hỏi..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 block">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
            >
              <option value="">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Tạm ẩn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Nội dung câu hỏi</th>
                <th className="px-6 py-3">{activeTab === "mbti" ? "Chiều" : "Nhóm RIASEC"}</th>
                {activeTab === "mbti" && <th className="px-6 py-3">Lựa chọn A/B</th>}
                <th className="px-6 py-3">Trạng thái</th>
                <th className="px-6 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={activeTab === "mbti" ? 6 : 5} className="px-6 py-10 text-center text-slate-400">
                    Đang tải...
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === "mbti" ? 6 : 5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <span className="text-5xl">📂</span>
                      <p className="text-slate-500 font-medium">
                        {searchTerm ? `Không tìm thấy câu hỏi nào khớp với "${searchTerm}"` : "Không có câu hỏi nào."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{shortId(q._id)}</td>
                    <td className="px-6 py-4 max-w-sm">
                      <p className="text-slate-900 font-medium leading-snug">{questionText(q)}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Cập nhật: {fmtDate(q.updatedAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      {activeTab === "mbti" ? (
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${DIMENSION_BADGE[q.dimension]}`}
                          title={DIMENSION_LABEL[q.dimension]}
                        >
                          {q.dimension}
                        </span>
                      ) : (
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${HOLLAND_BADGE[q.type]}`}
                          title={HOLLAND_LABEL[q.type]}
                        >
                          {q.type}
                        </span>
                      )}
                    </td>
                    {activeTab === "mbti" && (
                      <td className="px-6 py-4 text-xs text-slate-600 space-y-1">
                        <p>
                          <span className="font-bold text-slate-400">A:</span> {q.optionA?.text}{" "}
                          <span className="text-slate-400">({q.optionA?.typeValue})</span>
                        </p>
                        <p>
                          <span className="font-bold text-slate-400">B:</span> {q.optionB?.text}{" "}
                          <span className="text-slate-400">({q.optionB?.typeValue})</span>
                        </p>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                          q.isActive === false ? "text-amber-600" : "text-teal-600"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${q.isActive === false ? "bg-amber-500" : "bg-teal-500"}`} />
                        {q.isActive === false ? "Tạm ẩn" : "Hoạt động"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenModal(q)}
                          title="Chỉnh sửa"
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(q)}
                          title={q.isActive === false ? "Kích hoạt lại" : "Tạm ẩn khỏi bài test"}
                          className={`p-2 rounded-lg transition ${
                            q.isActive === false ? "text-green-600 hover:bg-green-50" : "text-amber-600 hover:bg-amber-50"
                          }`}
                        >
                          {q.isActive === false ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.025 10.025 0 012.132-3.411m3.712-2.98A9.958 9.958 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.965 9.965 0 01-4.043 5.411M3 3l18 18" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => setDeletingItem(q)}
                          title="Xóa"
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
            Hiển thị {questions.length > 0 ? (currentPage - 1) * 10 + 1 : 0} -{" "}
            {(currentPage - 1) * 10 + questions.length} trong {totalCount.toLocaleString("vi-VN")} kết quả
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

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {loading ? (
          <div className="text-center py-10 text-slate-400">Đang tải...</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-10 text-slate-500">Không có câu hỏi nào.</div>
        ) : (
          questions.map((q) => (
            <div key={q._id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="flex justify-between items-start gap-3">
                <p className="text-slate-900 font-medium leading-snug">{questionText(q)}</p>
                <span
                  className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${
                    activeTab === "mbti" ? DIMENSION_BADGE[q.dimension] : HOLLAND_BADGE[q.type]
                  }`}
                >
                  {activeTab === "mbti" ? q.dimension : q.type}
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                  q.isActive === false ? "text-amber-600" : "text-teal-600"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${q.isActive === false ? "bg-amber-500" : "bg-teal-500"}`} />
                {q.isActive === false ? "Tạm ẩn" : "Hoạt động"}
              </span>
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleOpenModal(q)}
                  className="flex-1 px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleToggleStatus(q)}
                  className={`flex-1 px-3 py-2 text-xs font-bold rounded-xl transition ${
                    q.isActive === false ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  }`}
                >
                  {q.isActive === false ? "Kích hoạt" : "Tạm ẩn"}
                </button>
                <button
                  onClick={() => setDeletingItem(q)}
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

      {/* ===== Modal: Thêm mới / Sửa câu hỏi ===== */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleSubmit}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-7 space-y-4 my-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900">
                  {editingItem ? "Cập nhật câu hỏi" : "Thêm câu hỏi mới"}
                </h2>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition"
                >
                  ✕
                </button>
              </div>

              {formError && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{formError}</p>}

              {activeTab === "mbti" ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-500">Nội dung câu hỏi</label>
                    <textarea
                      required
                      rows={2}
                      value={formData.question || ""}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200 transition resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500">Chiều tính cách</label>
                    <select
                      value={formData.dimension || "EI"}
                      onChange={(e) => handleDimensionChange(e.target.value)}
                      className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200 transition"
                    >
                      {Object.keys(DIMENSION_PAIRS).map((d) => (
                        <option key={d} value={d}>
                          {d} — {DIMENSION_LABEL[d]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-slate-500">Nội dung lựa chọn A</label>
                        <input
                          required
                          value={formData.optionA?.text || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, optionA: { ...formData.optionA, text: e.target.value } })
                          }
                          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200 transition"
                        />
                      </div>
                      <div className="w-24">
                        <label className="text-xs font-bold text-slate-500">Giá trị</label>
                        <select
                          value={formData.optionA?.typeValue || ""}
                          onChange={(e) => handleOptionALetterChange(e.target.value)}
                          className="w-full mt-1 px-2 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200 transition"
                        >
                          {(DIMENSION_PAIRS[formData.dimension] || []).map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-slate-500">Nội dung lựa chọn B</label>
                        <input
                          required
                          value={formData.optionB?.text || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, optionB: { ...formData.optionB, text: e.target.value } })
                          }
                          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200 transition"
                        />
                      </div>
                      <div className="w-24">
                        <label className="text-xs font-bold text-slate-500">Giá trị</label>
                        <input
                          disabled
                          value={formData.optionB?.typeValue || ""}
                          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-center"
                          title="Tự động nhận giá trị còn lại của cặp — không thể chọn trùng với Option A"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-500">Nội dung câu hỏi</label>
                    <textarea
                      required
                      rows={2}
                      value={formData.content || ""}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200 transition resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500">Nhóm RIASEC</label>
                    <select
                      value={formData.type || "R"}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-200 transition"
                    >
                      {HOLLAND_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t} — {HOLLAND_LABEL[t]}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition disabled:opacity-50"
              >
                {submitting ? "Đang lưu..." : "Lưu câu hỏi"}
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* ===== Confirm: Xóa câu hỏi ===== */}
      <AnimatePresence>
        {deletingItem && (
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
              <h2 className="text-lg font-black text-slate-900">Xóa câu hỏi này?</h2>
              <p className="text-sm text-slate-500 line-clamp-3">{questionText(deletingItem)}</p>
              <p className="text-xs text-slate-400">
                Câu hỏi sẽ bị ẩn khỏi hệ thống và không còn xuất hiện trong bài test mới.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeletingItem(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition disabled:opacity-50"
                >
                  {deleteSubmitting ? "Đang xóa..." : "Xóa câu hỏi"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminQuestionManagement;
