import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { getAuthHeader } from "../../utils/auth";
import { motion, AnimatePresence } from "framer-motion";

const AdminMajorUniversityManagement = () => {
  const [activeTab, setActiveTab] = useState("universities");
  const [universities, setUniversities] = useState([]);
  const [majors, setMajors] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Pagination states
  const [uniPage, setUniPage] = useState(1);
  const [uniTotalPages, setUniTotalPages] = useState(1);
  const [majorPage, setMajorPage] = useState(1);
  const [majorTotalPages, setMajorTotalPages] = useState(1);
  const [mapPage, setMapPage] = useState(1);
  const [mapTotalPages, setMapTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  const fetchDropdownData = async () => {
    try {
      const [uniRes, majorRes] = await Promise.all([
        axios.get(`${API_URL}/admin/majors/universities?limit=1000`, {
          headers: getAuthHeader(),
        }),
        axios.get(`${API_URL}/admin/majors/majors?limit=1000`, {
          headers: getAuthHeader(),
        }),
      ]);
      // Handle both paginated and non-paginated responses for safety
      const unis = uniRes.data.data.universities || uniRes.data.data;
      const majs = majorRes.data.data.majors || majorRes.data.data;
      setUniversities(unis);
      setMajors(majs);
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
    }
  };

  const fetchPaginatedData = useCallback(async () => {
    setLoading(true);
    try {
      const searchParam = debouncedSearchTerm
        ? `&search=${encodeURIComponent(debouncedSearchTerm)}`
        : "";
      if (activeTab === "universities") {
        const res = await axios.get(
          `${API_URL}/admin/majors/universities?page=${uniPage}&limit=10${searchParam}`,
          { headers: getAuthHeader() },
        );
        setUniversities(res.data.data.universities);
        setUniTotalPages(res.data.data.pages);
      } else if (activeTab === "majors") {
        const res = await axios.get(
          `${API_URL}/admin/majors/majors?page=${majorPage}&limit=10${searchParam}`,
          { headers: getAuthHeader() },
        );
        setMajors(res.data.data.majors);
        setMajorTotalPages(res.data.data.pages);
      } else if (activeTab === "mappings") {
        const res = await axios.get(
          `${API_URL}/admin/majors/university-majors?page=${mapPage}&limit=10${searchParam}`,
          { headers: getAuthHeader() },
        );
        setMappings(res.data.data.universityMajors);
        setMapTotalPages(res.data.data.pages);
      }
    } catch (err) {
      console.error("Error fetching paginated data:", err);
      alert("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [activeTab, uniPage, majorPage, mapPage, debouncedSearchTerm]);

  useEffect(() => {
    const init = async () => {
      await fetchDropdownData();
      await fetchPaginatedData();
    };
    init();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const loadData = async () => {
      await fetchPaginatedData();
    };
    loadData();
  }, [
    activeTab,
    uniPage,
    majorPage,
    mapPage,
    debouncedSearchTerm,
    fetchPaginatedData,
  ]);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData(item);
    } else {
      setFormData(
        activeTab === "universities"
          ? {
              name: "",
              location: "",
              address: "",
              website: "",
              type: "Public",
              image: "",
              facilities: [],
              admissionYear: 2024,
            }
          : activeTab === "majors"
            ? {
                name: "",
                description: "",
                benchmarkScore: 0,
                tuitionFee: 0,
                hollandTypes: [],
                mbtiTypes: [],
                subjectCombinations: [],
              }
            : {
                university: "",
                major: "",
                admissionScore: 0,
                subjectCombination: "",
                tuitionFee: 0,
                admissionHistory: [],
              },
      );
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint =
        activeTab === "universities"
          ? "/admin/majors/universities"
          : activeTab === "majors"
            ? "/admin/majors/majors"
            : "/admin/majors/university-majors";

      if (editingItem) {
        await axios.put(`${API_URL}${endpoint}/${editingItem._id}`, formData, {
          headers: getAuthHeader(),
        });
      } else {
        await axios.post(`${API_URL}${endpoint}`, formData, {
          headers: getAuthHeader(),
        });
      }
      await fetchPaginatedData();
      await fetchDropdownData();
      handleCloseModal();
    } catch (err) {
      console.error("Error saving data:", err);
      alert("Lỗi khi lưu dữ liệu");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mục này?")) return;
    try {
      const endpoint =
        activeTab === "universities"
          ? "/admin/majors/universities"
          : activeTab === "majors"
            ? "/admin/majors/majors"
            : "/admin/majors/university-majors";
      await axios.delete(`${API_URL}${endpoint}/${id}`, {
        headers: getAuthHeader(),
      });
      await fetchPaginatedData();
      await fetchDropdownData();
    } catch (err) {
      console.error("Error deleting data:", err);
      alert("Lỗi khi xóa dữ liệu");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-full text-slate-600">
        Đang tải...
      </div>
    );

  const renderPagination = () => {
    let currentPage, setCurrentPage, totalPages;

    if (activeTab === "universities") {
      currentPage = uniPage;
      setCurrentPage = setUniPage;
      totalPages = uniTotalPages;
    } else if (activeTab === "majors") {
      currentPage = majorPage;
      setCurrentPage = setMajorPage;
      totalPages = majorTotalPages;
    } else {
      currentPage = mapPage;
      setCurrentPage = setMapPage;
      totalPages = mapTotalPages;
    }

    return (
      <div className="flex flex-wrap items-center justify-center gap-2 py-6 border-t border-slate-100">
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
                  ? "bg-blue-600 text-white"
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
    );
  };

  const renderContent = () => {
    if (activeTab === "universities") {
      return (
        <>
          {/* Mobile View */}
          <div className="grid grid-cols-1 gap-4 lg:hidden p-4">
            {universities.map((u) => (
              <div
                key={u._id}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">
                      {u.name}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {u.location}
                    </p>
                    <p className="text-xs text-blue-600 truncate">
                      {u.website}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenModal(u)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg transition"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">
                    Tên trường
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">
                    Địa điểm
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">
                    Website
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 text-center">
                    Đánh giá
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {universities.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {u.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {u.location}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {u.website}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-bold">
                        ⭐ {u.rating || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(u)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    }

    if (activeTab === "majors") {
      return (
        <>
          {/* Mobile View */}
          <div className="grid grid-cols-1 gap-4 lg:hidden p-4">
            {majors.map((m) => (
              <div
                key={m._id}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">
                      {m.name}
                    </p>
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {m.description}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenModal(m)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg transition"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(m._id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">
                    Tên ngành
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">
                    Mô tả
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {majors.map((m) => (
                  <tr
                    key={m._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {m.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {m.description}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(m)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(m._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    }

    return (
      <>
        {/* Mobile View */}
        <div className="grid grid-cols-1 gap-4 lg:hidden p-4">
          {mappings.map((map) => (
            <div
              key={map._id}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">
                    {map.university?.name}
                  </p>
                  <p className="text-sm text-slate-500 truncate">
                    {map.major?.name}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenModal(map)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg transition"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(map._id)}
                    className="p-2 bg-red-50 text-red-600 rounded-lg transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-bold text-slate-600">
                  Trường
                </th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600">
                  Ngành
                </th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mappings.map((map) => (
                <tr
                  key={map._id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {map.university?.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {map.major?.name}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(map)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(map._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-black text-slate-900">
          Quản lý Ngành & Trường
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Quản lý danh sách trường đại học, ngành học và sự liên kết giữa chúng
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {[
            { id: "universities", label: "Trường Đại học" },
            { id: "majors", label: "Ngành Học" },
            { id: "mappings", label: "Liên kết" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm"
        >
          + Thêm mới
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {renderContent()}
        {renderPagination()}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingItem ? "Cập nhật" : "Thêm mới"}{" "}
                  {activeTab === "universities"
                    ? "Trường"
                    : activeTab === "majors"
                      ? "Ngành"
                      : "Liên kết"}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {activeTab === "universities" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Tên trường
                      </label>
                      <input
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.name || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Địa điểm (Tỉnh/Thành)
                      </label>
                      <input
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.location || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Loại trường
                      </label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.type || "Public"}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value })
                        }
                      >
                        <option value="Public">Công lập</option>
                        <option value="Private">Tư thục</option>
                        <option value="International">Quốc tế</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Địa chỉ chi tiết
                      </label>
                      <input
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.address || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Website
                      </label>
                      <input
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.website || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, website: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Ảnh trường (URL)
                      </label>
                      <input
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.image || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, image: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Đánh giá (Rating)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.rating || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rating: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Cơ sở vật chất (phẩy tách)
                      </label>
                      <input
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={
                          Array.isArray(formData.facilities)
                            ? formData.facilities.join(", ")
                            : ""
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            facilities: e.target.value
                              .split(",")
                              .map((s) => s.trim()),
                          })
                        }
                      />
                    </div>
                  </div>
                )}
                {activeTab === "majors" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Tên ngành
                      </label>
                      <input
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.name || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Mô tả
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        rows="3"
                        value={formData.description || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </>
                )}
                {activeTab === "mappings" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Trường
                        </label>
                        <select
                          required
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          value={formData.university || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              university: e.target.value,
                            })
                          }
                        >
                          <option value="">Chọn trường</option>
                          {universities.map((u) => (
                            <option key={u._id} value={u._id}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Ngành
                        </label>
                        <select
                          required
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          value={formData.major || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, major: e.target.value })
                          }
                        >
                          <option value="">Chọn ngành</option>
                          {majors.map((m) => (
                            <option key={m._id} value={m._id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-slate-800">
                          Lịch sử tuyển sinh (Điểm chuẩn & Học phí)
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            const history = formData.admissionHistory || [];
                            setFormData({
                              ...formData,
                              admissionHistory: [
                                ...history,
                                {
                                  year: new Date().getFullYear(),
                                  admissionScore: 0,
                                  tuitionFee: 0,
                                  subjectCombination: "",
                                },
                              ],
                            });
                          }}
                          className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-100 transition font-bold"
                        >
                          + Thêm năm
                        </button>
                      </div>

                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {(formData.admissionHistory || []).map(
                          (item, index) => (
                            <div
                              key={index}
                              className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3 relative group"
                            >
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase">
                                  Năm
                                </label>
                                <input
                                  type="number"
                                  required
                                  className="w-full px-2 py-1 text-sm border border-slate-200 rounded bg-white"
                                  value={item.year || ""}
                                  onChange={(e) => {
                                    const newHistory = [
                                      ...(formData.admissionHistory || []),
                                    ];
                                    newHistory[index].year = parseInt(
                                      e.target.value,
                                    );
                                    setFormData({
                                      ...formData,
                                      admissionHistory: newHistory,
                                    });
                                  }}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase">
                                  Điểm
                                </label>
                                <input
                                  type="number"
                                  step="0.1"
                                  required
                                  className="w-full px-2 py-1 text-sm border border-slate-200 rounded bg-white"
                                  value={item.admissionScore || ""}
                                  onChange={(e) => {
                                    const newHistory = [
                                      ...(formData.admissionHistory || []),
                                    ];
                                    newHistory[index].admissionScore =
                                      parseFloat(e.target.value);
                                    setFormData({
                                      ...formData,
                                      admissionHistory: newHistory,
                                    });
                                  }}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase">
                                  Học phí
                                </label>
                                <input
                                  type="number"
                                  required
                                  className="w-full px-2 py-1 text-sm border border-slate-200 rounded bg-white"
                                  value={item.tuitionFee || ""}
                                  onChange={(e) => {
                                    const newHistory = [
                                      ...(formData.admissionHistory || []),
                                    ];
                                    newHistory[index].tuitionFee = parseInt(
                                      e.target.value,
                                    );
                                    setFormData({
                                      ...formData,
                                      admissionHistory: newHistory,
                                    });
                                  }}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase">
                                  Tổ hợp
                                </label>
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-sm border border-slate-200 rounded bg-white"
                                  value={item.subjectCombination || ""}
                                  onChange={(e) => {
                                    const newHistory = [
                                      ...(formData.admissionHistory || []),
                                    ];
                                    newHistory[index].subjectCombination =
                                      e.target.value;
                                    setFormData({
                                      ...formData,
                                      admissionHistory: newHistory,
                                    });
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newHistory = (
                                    formData.admissionHistory || []
                                  ).filter((_, i) => i !== index);
                                  setFormData({
                                    ...formData,
                                    admissionHistory: newHistory,
                                  });
                                }}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                              >
                                ✕
                              </button>
                            </div>
                          ),
                        )}
                        {(!formData.admissionHistory ||
                          formData.admissionHistory.length === 0) && (
                          <p className="text-center text-xs text-slate-400 py-4">
                            Chưa có dữ liệu tuyển sinh. Vui lòng nhấn "+ Thêm
                            năm".
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminMajorUniversityManagement;
