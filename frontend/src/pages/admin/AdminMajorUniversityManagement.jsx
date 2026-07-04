import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../../api/axios";

const TYPE_LABEL = { Public: "Công lập", Private: "Tư thục", International: "Quốc tế" };
const TYPE_BADGE = {
  Public: "bg-blue-100 text-blue-600",
  Private: "bg-purple-100 text-purple-600",
  International: "bg-orange-100 text-orange-600",
};
const TYPE_REVERSE = { "Công lập": "Public", "Tư thục": "Private", "Quốc tế": "International" };

const TABS = [
  { id: "universities", label: "Trường Đại học" },
  { id: "majors", label: "Ngành học" },
  { id: "mappings", label: "Liên kết Ngành-Trường" },
];

const fmtMoney = (n) =>
  n || n === 0 ? `${Number(n).toLocaleString("vi-VN")}đ` : "—";

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const downloadCsv = (filename, header, rows) => {
  const csv =
    "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// Parser CSV đơn giản có hỗ trợ ô chứa dấu phẩy / xuống dòng khi được bọc trong ngoặc kép
const BOM = String.fromCharCode(0xfeff);
const parseCsv = (text) => {
  const clean = text.startsWith(BOM) ? text.slice(1) : text;
  const parseLine = (line) => {
    const cells = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            cur += '"';
            i++;
          } else inQuotes = false;
        } else cur += ch;
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        cells.push(cur);
        cur = "";
      } else cur += ch;
    }
    cells.push(cur);
    return cells;
  };
  const lines = clean.split(/\r\n|\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) return [];
  const headers = parseLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = parseLine(line);
    const obj = {};
    headers.forEach((h, i) => (obj[h] = (cells[i] ?? "").trim()));
    return obj;
  });
};

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

const emptyUniversityForm = {
  name: "",
  location: "",
  address: "",
  type: "Public",
  website: "",
  image: "",
  coverImage: "",
  description: "",
  rating: 0,
  reviewCount: 0,
  facilities: [],
};

const emptyMajorForm = {
  name: "",
  description: "",
  benchmarkScore: 0,
  tuitionFee: 0,
  hollandTypes: [],
  mbtiTypes: [],
  subjectCombinations: [],
};

const emptyMappingForm = {
  university: "",
  major: "",
  admissionScore: 0,
  subjectCombination: "",
  tuitionFee: 0,
  admissionHistory: [],
};

const AdminMajorUniversityManagement = () => {
  const [activeTab, setActiveTab] = useState("universities");

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [allUniversities, setAllUniversities] = useState([]);
  const [allMajors, setAllMajors] = useState([]);

  const [universities, setUniversities] = useState([]);
  const [majors, setMajors] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [mapUniFilter, setMapUniFilter] = useState("");
  const [mapMajorFilter, setMapMajorFilter] = useState("");

  const [uniPage, setUniPage] = useState(1);
  const [uniTotalPages, setUniTotalPages] = useState(1);
  const [uniTotal, setUniTotal] = useState(0);
  const [majorPage, setMajorPage] = useState(1);
  const [majorTotalPages, setMajorTotalPages] = useState(1);
  const [majorTotal, setMajorTotal] = useState(0);
  const [mapPage, setMapPage] = useState(1);
  const [mapTotalPages, setMapTotalPages] = useState(1);
  const [mapTotal, setMapTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [toast, setToast] = useState("");
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const showToast = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await axiosClient.get("/admin/majors/stats");
      setStats(res.data.data);
    } catch (err) {
      console.error("Error fetching majors stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchAllDropdowns = async () => {
    try {
      const [uniRes, majorRes] = await Promise.all([
        axiosClient.get("/admin/majors/universities", { params: { limit: 1000 } }),
        axiosClient.get("/admin/majors/majors", { params: { limit: 1000 } }),
      ]);
      setAllUniversities(uniRes.data.data.universities || []);
      setAllMajors(majorRes.data.data.majors || []);
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
    }
  };

  const fetchUniversities = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/admin/majors/universities", {
        params: {
          page: uniPage,
          limit: 10,
          search: debouncedSearch || undefined,
          location: locationFilter || undefined,
          type: typeFilter || undefined,
        },
      });
      setUniversities(res.data.data.universities);
      setUniTotalPages(res.data.data.pages || 1);
      setUniTotal(res.data.data.total || 0);
    } catch (err) {
      console.error("Error fetching universities:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMajors = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/admin/majors/majors", {
        params: { page: majorPage, limit: 10, search: debouncedSearch || undefined },
      });
      setMajors(res.data.data.majors);
      setMajorTotalPages(res.data.data.pages || 1);
      setMajorTotal(res.data.data.total || 0);
    } catch (err) {
      console.error("Error fetching majors:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMappings = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/admin/majors/university-majors", {
        params: {
          page: mapPage,
          limit: 10,
          search: debouncedSearch || undefined,
          university: mapUniFilter || undefined,
          major: mapMajorFilter || undefined,
        },
      });
      setMappings(res.data.data.universityMajors);
      setMapTotalPages(res.data.data.pages || 1);
      setMapTotal(res.data.data.total || 0);
    } catch (err) {
      console.error("Error fetching mappings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await Promise.all([fetchStats(), fetchAllDropdowns()]);
    })();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    (async () => {
      if (activeTab === "universities") await fetchUniversities();
      else if (activeTab === "majors") await fetchMajors();
      else await fetchMappings();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, uniPage, majorPage, mapPage, debouncedSearch, locationFilter, typeFilter, mapUniFilter, mapMajorFilter]);

  const refreshCurrentTab = async () => {
    await Promise.all([
      fetchStats(),
      fetchAllDropdowns(),
      activeTab === "universities"
        ? fetchUniversities()
        : activeTab === "majors"
          ? fetchMajors()
          : fetchMappings(),
    ]);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
    setDebouncedSearch("");
    setLocationFilter("");
    setTypeFilter("");
    setMapUniFilter("");
    setMapMajorFilter("");
  };

  const currentEndpoint = () =>
    activeTab === "universities"
      ? "/admin/majors/universities"
      : activeTab === "majors"
        ? "/admin/majors/majors"
        : "/admin/majors/university-majors";

  // ===== Modal thêm/sửa =====
  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setFormError("");
    if (item) {
      // Với tab Liên kết, university/major trong item đã được populate thành object đầy đủ —
      // phải quy về ID string trước khi đưa vào form, nếu không lúc submit sẽ gửi nguyên object
      // và bị lỗi cast ObjectId ở backend.
      if (activeTab === "mappings") {
        setFormData({
          ...item,
          university: item.university?._id || item.university,
          major: item.major?._id || item.major,
        });
      } else {
        setFormData(item);
      }
    } else {
      setFormData(
        activeTab === "universities"
          ? emptyUniversityForm
          : activeTab === "majors"
            ? emptyMajorForm
            : emptyMappingForm,
      );
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const endpoint = currentEndpoint();
      if (editingItem) {
        await axiosClient.put(`${endpoint}/${editingItem._id}`, formData);
        showToast("Đã cập nhật thành công.");
      } else {
        await axiosClient.post(endpoint, formData);
        showToast("Đã thêm mới thành công.");
      }
      handleCloseModal();
      await refreshCurrentTab();
    } catch (err) {
      setFormError(err.response?.data?.message || "Không thể lưu dữ liệu, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setDeleteSubmitting(true);
    try {
      await axiosClient.delete(`${currentEndpoint()}/${deletingItem._id}`);
      showToast("Đã xóa thành công.");
      setDeletingItem(null);
      await refreshCurrentTab();
    } catch (err) {
      showToast(err.response?.data?.message || "Không thể xóa, vui lòng thử lại.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // ===== Xuất danh sách (CSV toàn bộ dữ liệu khớp bộ lọc hiện tại) =====
  const handleExport = async () => {
    setExporting(true);
    try {
      if (activeTab === "universities") {
        const res = await axiosClient.get("/admin/majors/universities", {
          params: {
            page: 1,
            limit: 10000,
            search: debouncedSearch || undefined,
            location: locationFilter || undefined,
            type: typeFilter || undefined,
          },
        });
        const rows = (res.data.data.universities || []).map((u) => [
          u.name,
          u.location,
          u.address,
          TYPE_LABEL[u.type] || u.type,
          u.website || "",
          u.rating || 0,
          u.reviewCount || 0,
          u.needsUpdate ? "Cần cập nhật" : "Hoạt động",
        ]);
        downloadCsv(
          `caZup-truong-dai-hoc-${new Date().toISOString().slice(0, 10)}.csv`,
          ["Tên trường", "Địa điểm", "Địa chỉ", "Loại hình", "Website", "Đánh giá", "Số lượt đánh giá", "Trạng thái"],
          rows,
        );
      } else if (activeTab === "majors") {
        const res = await axiosClient.get("/admin/majors/majors", {
          params: { page: 1, limit: 10000, search: debouncedSearch || undefined },
        });
        const rows = (res.data.data.majors || []).map((m) => [
          m.name,
          m.description || "",
          m.benchmarkScore ?? "",
          m.tuitionFee ?? "",
          (m.subjectCombinations || []).join(" / "),
          (m.universities || []).length,
        ]);
        downloadCsv(
          `caZup-nganh-hoc-${new Date().toISOString().slice(0, 10)}.csv`,
          ["Tên ngành", "Mô tả", "Điểm chuẩn", "Học phí", "Tổ hợp môn", "Số trường đào tạo"],
          rows,
        );
      } else {
        const res = await axiosClient.get("/admin/majors/university-majors", {
          params: {
            page: 1,
            limit: 10000,
            search: debouncedSearch || undefined,
            university: mapUniFilter || undefined,
            major: mapMajorFilter || undefined,
          },
        });
        const rows = (res.data.data.universityMajors || []).map((m) => [
          m.university?.name || "",
          m.major?.name || "",
          m.admissionScore ?? "",
          m.tuitionFee ?? "",
          m.subjectCombination || "",
        ]);
        downloadCsv(
          `caZup-lien-ket-nganh-truong-${new Date().toISOString().slice(0, 10)}.csv`,
          ["Trường", "Ngành", "Điểm chuẩn mới nhất", "Học phí", "Tổ hợp môn"],
          rows,
        );
      }
    } catch (err) {
      console.error("Export error:", err);
      showToast("Không thể xuất dữ liệu, vui lòng thử lại.");
    } finally {
      setExporting(false);
    }
  };

  // ===== Nhập file CSV =====
  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length === 0) {
      showToast("Tệp không có dữ liệu hợp lệ.");
      return;
    }

    setImporting(true);
    let success = 0;
    let failed = 0;
    for (const row of rows) {
      try {
        if (activeTab === "universities") {
          const typeRaw = row["Loại hình"] || row.type || "Public";
          await axiosClient.post("/admin/majors/universities", {
            name: row["Tên trường"] || row.name,
            location: row["Địa điểm"] || row.location,
            address: row["Địa chỉ"] || row.address,
            type: TYPE_REVERSE[typeRaw] || typeRaw,
            website: row["Website"] || row.website || "",
          });
        } else if (activeTab === "majors") {
          await axiosClient.post("/admin/majors/majors", {
            name: row["Tên ngành"] || row.name,
            description: row["Mô tả"] || row.description || "",
            benchmarkScore: parseFloat(row["Điểm chuẩn"] || row.benchmarkScore) || 0,
            tuitionFee: parseInt(row["Học phí"] || row.tuitionFee, 10) || 0,
          });
        } else {
          const uniName = (row["Trường"] || row.university || "").toLowerCase();
          const majorName = (row["Ngành"] || row.major || "").toLowerCase();
          const uni = allUniversities.find((u) => u.name.toLowerCase() === uniName);
          const major = allMajors.find((m) => m.name.toLowerCase() === majorName);
          if (!uni || !major) throw new Error("Không khớp tên trường/ngành");
          await axiosClient.post("/admin/majors/university-majors", {
            university: uni._id,
            major: major._id,
            admissionScore: parseFloat(row["Điểm chuẩn mới nhất"] || row.admissionScore) || 0,
            subjectCombination: row["Tổ hợp môn"] || row.subjectCombination || "",
            tuitionFee: parseInt(row["Học phí"] || row.tuitionFee, 10) || 0,
          });
        }
        success++;
      } catch {
        failed++;
      }
    }
    setImporting(false);
    showToast(`Nhập file hoàn tất: ${success} thành công${failed ? `, ${failed} lỗi` : ""}.`);
    await refreshCurrentTab();
  };

  const renderPagination = (currentPage, setCurrentPage, totalPages, total, rowCount) => (
    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-100">
      <p className="text-xs text-slate-500">
        Hiển thị {rowCount > 0 ? (currentPage - 1) * 10 + 1 : 0} -{" "}
        {(currentPage - 1) * 10 + rowCount} trong tổng số {total.toLocaleString("vi-VN")} bản ghi
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50 transition"
        >
          «
        </button>
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50 transition"
        >
          ‹
        </button>
        {pageNumbers(currentPage, totalPages).map((p, idx) =>
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
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50 transition"
        >
          »
        </button>
      </div>
    </div>
  );

  const EditIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
  const DeleteIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
  const ViewIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const renderUniversitiesTab = () => (
    <>
      <div className="grid grid-cols-1 gap-4 lg:hidden p-4">
        {universities.map((u) => (
          <div key={u._id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
                  {u.image ? (
                    <img src={u.image} alt={u.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    "🏫"
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{u.name}</p>
                  <p className="text-xs text-slate-500 truncate">{u.location}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleOpenModal(u)} className="p-2 bg-blue-50 text-blue-600 rounded-lg transition">
                  <EditIcon />
                </button>
                <button onClick={() => setDeletingItem(u)} className="p-2 bg-red-50 text-red-600 rounded-lg transition">
                  <DeleteIcon />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`px-2 py-1 rounded-md text-xs font-bold ${TYPE_BADGE[u.type] || TYPE_BADGE.Public}`}>
                {TYPE_LABEL[u.type] || u.type}
              </span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-bold">
                ⭐ {u.rating || 0} ({u.reviewCount || 0})
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${u.needsUpdate ? "bg-amber-50 text-amber-600" : "bg-teal-50 text-teal-600"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${u.needsUpdate ? "bg-amber-500" : "bg-teal-500"}`} />
                {u.needsUpdate ? "Cần cập nhật" : "Hoạt động"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full min-w-[960px] text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wide">
              <th className="px-6 py-3">Thông tin trường</th>
              <th className="px-6 py-3">Địa điểm</th>
              <th className="px-6 py-3">Loại hình</th>
              <th className="px-6 py-3">Đánh giá</th>
              <th className="px-6 py-3">Trạng thái</th>
              <th className="px-6 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Đang tải...</td></tr>
            ) : universities.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Không tìm thấy trường nào.</td></tr>
            ) : (
              universities.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
                        {u.image ? (
                          <img src={u.image} alt={u.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          "🏫"
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{u.name}</p>
                        {u.website && (
                          <a href={u.website} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline truncate block">
                            {u.website}
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{u.location}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${TYPE_BADGE[u.type] || TYPE_BADGE.Public}`}>
                      {TYPE_LABEL[u.type] || u.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-bold whitespace-nowrap">
                      ⭐ {u.rating || 0} <span className="text-yellow-600 font-medium">({u.reviewCount || 0})</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${u.needsUpdate ? "text-amber-600" : "text-teal-600"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.needsUpdate ? "bg-amber-500" : "bg-teal-500"}`} />
                      {u.needsUpdate ? "Cần cập nhật" : "Hoạt động"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1.5">
                      <Link to={`/university/${u._id}`} target="_blank" title="Xem trang công khai" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition">
                        <ViewIcon />
                      </Link>
                      <button onClick={() => handleOpenModal(u)} title="Sửa" className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition">
                        <EditIcon />
                      </button>
                      <button onClick={() => setDeletingItem(u)} title="Xóa" className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition">
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderMajorsTab = () => (
    <>
      <div className="grid grid-cols-1 gap-4 lg:hidden p-4">
        {majors.map((m) => (
          <div key={m._id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate">{m.name}</p>
                <p className="text-sm text-slate-500 line-clamp-2">{m.description}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleOpenModal(m)} className="p-2 bg-blue-50 text-blue-600 rounded-lg transition"><EditIcon /></button>
                <button onClick={() => setDeletingItem(m)} className="p-2 bg-red-50 text-red-600 rounded-lg transition"><DeleteIcon /></button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md">Điểm chuẩn: {m.benchmarkScore ?? "—"}</span>
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md">{fmtMoney(m.tuitionFee)}</span>
              <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md">{(m.universities || []).length} trường</span>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full min-w-[960px] text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wide">
              <th className="px-6 py-3">Ngành học</th>
              <th className="px-6 py-3">Tổ hợp môn</th>
              <th className="px-6 py-3">Điểm chuẩn</th>
              <th className="px-6 py-3">Học phí tham khảo</th>
              <th className="px-6 py-3">Số trường đào tạo</th>
              <th className="px-6 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Đang tải...</td></tr>
            ) : majors.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Không tìm thấy ngành nào.</td></tr>
            ) : (
              majors.map((m) => (
                <tr key={m._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{m.name}</p>
                    <p className="text-xs text-slate-500 line-clamp-1 max-w-xs">{m.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {(m.subjectCombinations || []).slice(0, 4).map((s) => (
                        <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-bold">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">{m.benchmarkScore ?? "—"}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{fmtMoney(m.tuitionFee)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-600">
                      {(m.universities || []).length} trường
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => handleOpenModal(m)} title="Sửa" className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"><EditIcon /></button>
                      <button onClick={() => setDeletingItem(m)} title="Xóa" className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"><DeleteIcon /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderMappingsTab = () => (
    <>
      <div className="grid grid-cols-1 gap-4 lg:hidden p-4">
        {mappings.map((map) => (
          <div key={map._id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate">{map.university?.name}</p>
                <p className="text-sm text-slate-500 truncate">{map.major?.name}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleOpenModal(map)} className="p-2 bg-blue-50 text-blue-600 rounded-lg transition"><EditIcon /></button>
                <button onClick={() => setDeletingItem(map)} className="p-2 bg-red-50 text-red-600 rounded-lg transition"><DeleteIcon /></button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md">Điểm chuẩn: {map.admissionScore ?? "—"}</span>
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md">{fmtMoney(map.tuitionFee)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full min-w-[960px] text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wide">
              <th className="px-6 py-3">Trường</th>
              <th className="px-6 py-3">Ngành</th>
              <th className="px-6 py-3">Điểm chuẩn mới nhất</th>
              <th className="px-6 py-3">Học phí</th>
              <th className="px-6 py-3">Tổ hợp</th>
              <th className="px-6 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Đang tải...</td></tr>
            ) : mappings.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Không tìm thấy liên kết nào.</td></tr>
            ) : (
              mappings.map((map) => (
                <tr key={map._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{map.university?.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{map.major?.name}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">{map.admissionScore ?? "—"}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{fmtMoney(map.tuitionFee)}</td>
                  <td className="px-6 py-4">
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-bold">
                      {map.subjectCombination || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1.5">
                      <Link to={`/major/${map._id}`} target="_blank" title="Xem trang công khai" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition">
                        <ViewIcon />
                      </Link>
                      <button onClick={() => handleOpenModal(map)} title="Sửa" className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"><EditIcon /></button>
                      <button onClick={() => setDeletingItem(map)} title="Xóa" className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"><DeleteIcon /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  const statCards = [
    { name: "Tổng số trường", value: stats?.totalUniversities ?? 0, icon: "🏫" },
    { name: "Tổng số ngành", value: stats?.totalMajors ?? 0, icon: "📚" },
    { name: "Liên kết dữ liệu", value: stats?.totalLinks ?? 0, icon: "🔗" },
    {
      name: "Cần cập nhật",
      value: stats?.needsUpdateCount ?? 0,
      icon: "⚠️",
      sub: "trường thiếu ảnh bìa trang chi tiết",
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleImportFile}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Quản trị Dữ liệu caZup</h1>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý trường đại học, ngành học và mối liên kết tuyển sinh trong hệ thống
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-bold transition disabled:opacity-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {exporting ? "Đang xuất..." : "Xuất danh sách"}
          </button>
          <button
            onClick={handleImportClick}
            disabled={importing}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition disabled:opacity-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m0-9l-3 3m3-3l3 3" />
            </svg>
            {importing ? "Đang nhập..." : "Nhập File"}
          </button>
        </div>
      </div>

      {/* Tabs + Thêm mới */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition whitespace-nowrap ${
                activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition shadow-sm"
        >
          + Thêm mới
        </button>
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (activeTab === "universities") setUniPage(1);
                else if (activeTab === "majors") setMajorPage(1);
                else setMapPage(1);
              }}
              placeholder={
                activeTab === "universities"
                  ? "Tìm theo tên trường, địa điểm hoặc website..."
                  : activeTab === "majors"
                    ? "Tìm theo tên ngành hoặc mô tả..."
                    : "Tìm theo tên trường hoặc tên ngành..."
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>

          {activeTab === "universities" && (
            <>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 block">
                  Địa điểm
                </label>
                <select
                  value={locationFilter}
                  onChange={(e) => {
                    setLocationFilter(e.target.value);
                    setUniPage(1);
                  }}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
                >
                  <option value="">Tất cả địa điểm</option>
                  {(stats?.locations || []).map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 block">
                  Loại hình
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setUniPage(1);
                  }}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
                >
                  <option value="">Tất cả</option>
                  <option value="Public">Công lập</option>
                  <option value="Private">Tư thục</option>
                  <option value="International">Quốc tế</option>
                </select>
              </div>
            </>
          )}

          {activeTab === "mappings" && (
            <>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 block">
                  Trường
                </label>
                <select
                  value={mapUniFilter}
                  onChange={(e) => {
                    setMapUniFilter(e.target.value);
                    setMapPage(1);
                  }}
                  className="w-full lg:w-auto lg:max-w-[220px] px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
                >
                  <option value="">Tất cả trường</option>
                  {allUniversities.map((u) => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 block">
                  Ngành
                </label>
                <select
                  value={mapMajorFilter}
                  onChange={(e) => {
                    setMapMajorFilter(e.target.value);
                    setMapPage(1);
                  }}
                  className="w-full lg:w-auto lg:max-w-[220px] px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition"
                >
                  <option value="">Tất cả ngành</option>
                  {allMajors.map((m) => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {activeTab === "universities" && renderUniversitiesTab()}
        {activeTab === "majors" && renderMajorsTab()}
        {activeTab === "mappings" && renderMappingsTab()}

        {activeTab === "universities" &&
          renderPagination(uniPage, setUniPage, uniTotalPages, uniTotal, universities.length)}
        {activeTab === "majors" &&
          renderPagination(majorPage, setMajorPage, majorTotalPages, majorTotal, majors.length)}
        {activeTab === "mappings" &&
          renderPagination(mapPage, setMapPage, mapTotalPages, mapTotal, mappings.length)}
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
              {loadingStats ? "…" : card.value.toLocaleString("vi-VN")}
            </h3>
            {card.sub && <p className="text-xs text-slate-400">{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-4 text-xs text-slate-400 border-t border-slate-100">
        <p>© 2026 caZup AI - Educational Management Platform</p>
        <p>Trợ giúp · Tài liệu API · Phản hồi</p>
      </div>

      {/* ===== Modal: Thêm/Sửa ===== */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingItem ? "Cập nhật" : "Thêm mới"}{" "}
                  {activeTab === "universities" ? "Trường" : activeTab === "majors" ? "Ngành" : "Liên kết"}
                </h3>
                <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {formError && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{formError}</p>
                )}

                {activeTab === "universities" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tên trường</label>
                      <input
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Địa điểm (Tỉnh/Thành)</label>
                      <input
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.location || ""}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Loại trường</label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.type || "Public"}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        <option value="Public">Công lập</option>
                        <option value="Private">Tư thục</option>
                        <option value="International">Quốc tế</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ chi tiết</label>
                      <input
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.address || ""}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                      <input
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.website || ""}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Ảnh logo (URL)</label>
                      <input
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.image || ""}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Ảnh bìa trang chi tiết (coverImage)
                      </label>
                      <input
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Bỏ trống sẽ khiến trường bị đánh dấu Cần cập nhật"
                        value={formData.coverImage || ""}
                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả ngắn</label>
                      <textarea
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        rows="2"
                        value={formData.description || ""}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Đánh giá (Rating)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.rating ?? 0}
                        onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Số lượt đánh giá</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.reviewCount ?? 0}
                        onChange={(e) => setFormData({ ...formData, reviewCount: parseInt(e.target.value, 10) || 0 })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Cơ sở vật chất (phẩy tách)</label>
                      <input
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={Array.isArray(formData.facilities) ? formData.facilities.join(", ") : ""}
                        onChange={(e) =>
                          setFormData({ ...formData, facilities: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
                        }
                      />
                    </div>
                  </div>
                )}

                {activeTab === "majors" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tên ngành</label>
                      <input
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                      <textarea
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        rows="3"
                        value={formData.description || ""}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Điểm chuẩn</label>
                      <input
                        type="number"
                        step="0.1"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.benchmarkScore ?? 0}
                        onChange={(e) => setFormData({ ...formData, benchmarkScore: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Học phí tham khảo (VNĐ)</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.tuitionFee ?? 0}
                        onChange={(e) => setFormData({ ...formData, tuitionFee: parseInt(e.target.value, 10) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tổ hợp môn (phẩy tách)</label>
                      <input
                        placeholder="VD: A00, A01, D07"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={Array.isArray(formData.subjectCombinations) ? formData.subjectCombinations.join(", ") : ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            subjectCombinations: e.target.value.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nhóm Holland phù hợp (phẩy tách)</label>
                      <input
                        placeholder="VD: R, I, A"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={Array.isArray(formData.hollandTypes) ? formData.hollandTypes.join(", ") : ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hollandTypes: e.target.value.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nhóm MBTI phù hợp (phẩy tách)</label>
                      <input
                        placeholder="VD: INTJ, ISTJ"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={Array.isArray(formData.mbtiTypes) ? formData.mbtiTypes.join(", ") : ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            mbtiTypes: e.target.value.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean),
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {activeTab === "mappings" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Trường</label>
                        <select
                          required
                          disabled={!!editingItem}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                          value={formData.university?._id || formData.university || ""}
                          onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                        >
                          <option value="">Chọn trường</option>
                          {allUniversities.map((u) => (
                            <option key={u._id} value={u._id}>{u.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ngành</label>
                        <select
                          required
                          disabled={!!editingItem}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                          value={formData.major?._id || formData.major || ""}
                          onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                        >
                          <option value="">Chọn ngành</option>
                          {allMajors.map((m) => (
                            <option key={m._id} value={m._id}>{m.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Điểm chuẩn (mới nhất)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          value={formData.admissionScore ?? 0}
                          onChange={(e) => setFormData({ ...formData, admissionScore: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tổ hợp môn chính</label>
                        <input
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          value={formData.subjectCombination || ""}
                          onChange={(e) => setFormData({ ...formData, subjectCombination: e.target.value.toUpperCase() })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Học phí (VNĐ/năm)</label>
                        <input
                          type="number"
                          required
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          value={formData.tuitionFee ?? 0}
                          onChange={(e) => setFormData({ ...formData, tuitionFee: parseInt(e.target.value, 10) || 0 })}
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-slate-800">Lịch sử tuyển sinh (Điểm chuẩn & Học phí)</h4>
                        <button
                          type="button"
                          onClick={() => {
                            const history = formData.admissionHistory || [];
                            setFormData({
                              ...formData,
                              admissionHistory: [
                                ...history,
                                { year: new Date().getFullYear(), admissionScore: 0, tuitionFee: 0, subjectCombination: "" },
                              ],
                            });
                          }}
                          className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-100 transition font-bold"
                        >
                          + Thêm năm
                        </button>
                      </div>

                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {(formData.admissionHistory || []).map((item, index) => (
                          <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3 relative group">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Năm</label>
                              <input
                                type="number"
                                required
                                className="w-full px-2 py-1 text-sm border border-slate-200 rounded bg-white"
                                value={item.year || ""}
                                onChange={(e) => {
                                  const newHistory = [...(formData.admissionHistory || [])];
                                  newHistory[index] = { ...newHistory[index], year: parseInt(e.target.value, 10) };
                                  setFormData({ ...formData, admissionHistory: newHistory });
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Điểm</label>
                              <input
                                type="number"
                                step="0.1"
                                required
                                className="w-full px-2 py-1 text-sm border border-slate-200 rounded bg-white"
                                value={item.admissionScore ?? ""}
                                onChange={(e) => {
                                  const newHistory = [...(formData.admissionHistory || [])];
                                  newHistory[index] = { ...newHistory[index], admissionScore: parseFloat(e.target.value) };
                                  setFormData({ ...formData, admissionHistory: newHistory });
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Học phí</label>
                              <input
                                type="number"
                                required
                                className="w-full px-2 py-1 text-sm border border-slate-200 rounded bg-white"
                                value={item.tuitionFee ?? ""}
                                onChange={(e) => {
                                  const newHistory = [...(formData.admissionHistory || [])];
                                  newHistory[index] = { ...newHistory[index], tuitionFee: parseInt(e.target.value, 10) || 0 };
                                  setFormData({ ...formData, admissionHistory: newHistory });
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Tổ hợp</label>
                              <input
                                type="text"
                                className="w-full px-2 py-1 text-sm border border-slate-200 rounded bg-white"
                                value={item.subjectCombination || ""}
                                onChange={(e) => {
                                  const newHistory = [...(formData.admissionHistory || [])];
                                  newHistory[index] = { ...newHistory[index], subjectCombination: e.target.value.toUpperCase() };
                                  setFormData({ ...formData, admissionHistory: newHistory });
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newHistory = (formData.admissionHistory || []).filter((_, i) => i !== index);
                                setFormData({ ...formData, admissionHistory: newHistory });
                              }}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center transition hover:scale-110"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        {(!formData.admissionHistory || formData.admissionHistory.length === 0) && (
                          <p className="text-center text-xs text-slate-400 py-4">
                            Chưa có dữ liệu tuyển sinh. Vui lòng nhấn "+ Thêm năm".
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm disabled:opacity-50"
                  >
                    {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== Confirm: Xóa ===== */}
      <AnimatePresence>
        {deletingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-7 space-y-4 text-center"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center text-2xl">🗑️</div>
              <h2 className="text-lg font-black text-slate-900">
                Xóa {activeTab === "universities" ? "trường" : activeTab === "majors" ? "ngành" : "liên kết"} "
                {deletingItem.name || `${deletingItem.university?.name} - ${deletingItem.major?.name}`}"?
              </h2>
              <p className="text-sm text-slate-500">
                {activeTab === "universities"
                  ? "Trường sẽ bị ẩn khỏi hệ thống và các liên kết ngành-trường liên quan cũng sẽ bị ẩn theo."
                  : activeTab === "majors"
                    ? "Ngành sẽ bị ẩn khỏi hệ thống và các liên kết ngành-trường liên quan cũng sẽ bị ẩn theo."
                    : "Liên kết này sẽ bị xóa khỏi danh sách tuyển sinh của ngành và trường tương ứng."}
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
                  {deleteSubmitting ? "Đang xóa..." : "Xóa"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminMajorUniversityManagement;
