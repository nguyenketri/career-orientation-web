import { useEffect, useState } from "react";
import axios from "axios";
import { getAuthHeader } from "../../utils/auth";
import { motion, AnimatePresence } from "framer-motion";

const AdminQuestionManagement = () => {
  const [activeTab, setActiveTab] = useState("mbti");
  const [mbtiQuestions, setMbtiQuestions] = useState([]);
  const [hollandQuestions, setHollandQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Pagination states
  const [mbtiPage, setMbtiPage] = useState(1);
  const [mbtiTotalPages, setMbtiTotalPages] = useState(1);
  const [mbtiTotalCount, setMbtiTotalCount] = useState(0);
  const [hollandPage, setHollandPage] = useState(1);
  const [hollandTotalPages, setHollandTotalPages] = useState(1);
  const [hollandTotalCount, setHollandTotalCount] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  const fetchPaginatedData = async () => {
    setLoading(true);
    try {
      if (activeTab === "mbti") {
        const res = await axios.get(
          `${API_URL}/admin/questions/mbti?page=${mbtiPage}&limit=10`,
          { headers: getAuthHeader() },
        );
        setMbtiQuestions(res.data.data.questions);
        setMbtiTotalPages(res.data.data.pages);
        setMbtiTotalCount(res.data.data.total);
      } else {
        const res = await axios.get(
          `${API_URL}/admin/questions/holland?page=${hollandPage}&limit=10`,
          { headers: getAuthHeader() },
        );
        setHollandQuestions(res.data.data.questions);
        setHollandTotalPages(res.data.data.pages);
        setHollandTotalCount(res.data.data.total);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      alert("Lỗi khi tải câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaginatedData();
  }, [activeTab, mbtiPage, hollandPage]);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData(item);
    } else {
      setFormData(
        activeTab === "mbti"
          ? {
              question: "",
              dimension: "EI",
              optionA: { text: "", typeValue: "" },
              optionB: { text: "", typeValue: "" },
            }
          : { content: "", type: "R" },
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
        activeTab === "mbti"
          ? "/admin/questions/mbti"
          : "/admin/questions/holland";
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
      handleCloseModal();
    } catch (err) {
      console.error("Error saving question:", err);
      alert("Lỗi khi lưu câu hỏi");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) return;
    try {
      const endpoint =
        activeTab === "mbti"
          ? "/admin/questions/mbti"
          : "/admin/questions/holland";
      await axios.delete(`${API_URL}${endpoint}/${id}`, {
        headers: getAuthHeader(),
      });
      await fetchPaginatedData();
    } catch (err) {
      console.error("Error deleting question:", err);
      alert("Lỗi khi xóa câu hỏi");
    }
  };

  if (loading && mbtiQuestions.length === 0 && hollandQuestions.length === 0)
    return (
      <div className="flex items-center justify-center h-full text-slate-600">
        Đang tải...
      </div>
    );

  const filteredQuestions = (
    activeTab === "mbti" ? mbtiQuestions : hollandQuestions
  ).filter((q) =>
    (q.question || q.content || q.text || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const renderPagination = () => {
    let currentPage, setCurrentPage, totalPages;

    if (activeTab === "mbti") {
      currentPage = mbtiPage;
      setCurrentPage = setMbtiPage;
      totalPages = mbtiTotalPages;
    } else {
      currentPage = hollandPage;
      setCurrentPage = setHollandPage;
      totalPages = hollandTotalPages;
    }

    return (
      <div className="flex items-center justify-center gap-2 py-6 border-t border-slate-100">
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-black text-slate-900">Quản lý Câu hỏi</h1>
        <p className="text-slate-500 text-sm mt-1">
          Quản lý nội dung câu hỏi cho các bài kiểm tra định hướng nghề nghiệp
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl">
            🧠
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">
              Tổng câu hỏi MBTI
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {mbtiTotalCount}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-2xl">
            🎯
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">
              Tổng câu hỏi Holland
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {hollandTotalCount}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("mbti")}
            className={`px-6 py-2 font-bold rounded-lg transition-all ${
              activeTab === "mbti"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            MBTI
          </button>
          <button
            onClick={() => setActiveTab("holland")}
            className={`px-6 py-2 font-bold rounded-lg transition-all ${
              activeTab === "holland"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Holland
          </button>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700 transition-all shadow-sm whitespace-nowrap"
          >
            + Thêm mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-bold text-slate-600">
                  Câu hỏi
                </th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((q) => (
                  <tr
                    key={q._id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-slate-900 font-medium">
                          {q.question || q.content || q.text || (
                            <span className="text-slate-400 italic">
                              Không có nội dung câu hỏi
                            </span>
                          )}
                        </span>
                        {activeTab === "mbti" && q.dimension && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mt-1">
                            Dimension: {q.dimension}
                          </span>
                        )}
                        {activeTab === "holland" && q.type && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 mt-1">
                            Category: {q.type}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenModal(q)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(q._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <span className="text-5xl">📂</span>
                      <p className="text-slate-500 font-medium">
                        {searchTerm
                          ? `Không tìm thấy câu hỏi nào khớp với "${searchTerm}"`
                          : `Không có câu hỏi nào trong mục ${
                              activeTab === "mbti" ? "MBTI" : "Holland"
                            }`}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={() => handleOpenModal()}
                          className="text-blue-600 hover:underline text-sm font-bold"
                        >
                          Thêm câu hỏi đầu tiên ngay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {renderPagination()}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
              <h3 className="text-lg font-bold mb-4">
                {editingItem ? "Cập nhật" : "Thêm mới"} câu hỏi
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === "mbti" ? (
                  <input
                    required
                    className="w-full p-2 border rounded-lg"
                    placeholder="Câu hỏi"
                    value={formData.question || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, question: e.target.value })
                    }
                  />
                ) : (
                  <input
                    required
                    className="w-full p-2 border rounded-lg"
                    placeholder="Câu hỏi"
                    value={formData.content || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                  />
                )}
                {activeTab === "mbti" && (
                  <>
                    <select
                      className="w-full p-2 border rounded-lg"
                      value={formData.dimension || "EI"}
                      onChange={(e) =>
                        setFormData({ ...formData, dimension: e.target.value })
                      }
                    >
                      {["EI", "SN", "TF", "JP"].map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        required
                        className="p-2 border rounded-lg"
                        placeholder="Option A"
                        value={formData.optionA?.text || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            optionA: {
                              ...formData.optionA,
                              text: e.target.value,
                            },
                          })
                        }
                      />
                      <input
                        required
                        className="p-2 border rounded-lg"
                        placeholder="Value A"
                        value={formData.optionA?.typeValue || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            optionA: {
                              ...formData.optionA,
                              typeValue: e.target.value,
                            },
                          })
                        }
                      />
                      <input
                        required
                        className="p-2 border rounded-lg"
                        placeholder="Option B"
                        value={formData.optionB?.text || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            optionB: {
                              ...formData.optionB,
                              text: e.target.value,
                            },
                          })
                        }
                      />
                      <input
                        required
                        className="p-2 border rounded-lg"
                        placeholder="Value B"
                        value={formData.optionB?.typeValue || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            optionB: {
                              ...formData.optionB,
                              typeValue: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </>
                )}
                {activeTab === "holland" && (
                  <input
                    required
                    className="w-full p-2 border rounded-lg"
                    placeholder="Category (R, I, A, S, E, C)"
                    value={formData.type || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  />
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-slate-100 rounded-lg"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Lưu
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

export default AdminQuestionManagement;
