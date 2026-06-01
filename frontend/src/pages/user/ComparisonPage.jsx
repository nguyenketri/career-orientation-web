import { useState, useEffect } from "react";
import { getAllUniversityMajors } from "../../services/universityService";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const ComparisonPage = () => {
  const [allMajors, setAllMajors] = useState([]);
  const [selectedMajors, setSelectedMajors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const navigate = useNavigate();

  // Get user subscription plan
  const userPlan = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.subscriptionPlan || "FREE";
    } catch {
      return "FREE";
    }
  })();

  // Determine max comparison limit based on plan
  const getComparisonLimit = () => {
    if (userPlan === "FREE") return 3; // FREE can compare 3
    if (userPlan === "PAID") return 6; // PAID can compare 6
    return 999; // PREMIUM can compare unlimited
  };

  const maxComparisons = getComparisonLimit();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllUniversityMajors();
        setAllMajors(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMajors = allMajors.filter(
    (item) =>
      (item.major?.name + item.university?.name)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) &&
      !selectedMajors.find((selected) => selected._id === item._id),
  );

  const handleSelect = (item) => {
    if (selectedMajors.length >= maxComparisons) {
      setShowUpgradeModal(true);
      return;
    }
    setSelectedMajors([...selectedMajors, item]);
    setSearchTerm("");
  };

  const handleRemove = (id) => {
    setSelectedMajors(selectedMajors.filter((item) => item._id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 pt-32 pb-20 text-slate-900">
      <div className="mx-auto max-w-7xl">
        {/* Search & Select */}
        <div className="relative mb-12">
          {loading ? (
            <div className="h-14 w-full bg-slate-100 border border-slate-200 rounded-2xl animate-pulse"></div>
          ) : (
            <input
              type="text"
              placeholder="Tìm kiếm ngành hoặc trường để so sánh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 shadow-sm transition"
            />
          )}

          <AnimatePresence>
            {searchTerm && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-2xl overflow-hidden z-50 shadow-2xl max-h-60 overflow-y-auto"
              >
                {filteredMajors.length > 0 ? (
                  filteredMajors.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => handleSelect(item)}
                      className="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                    >
                      <div className="font-bold text-slate-900">
                        {item.major?.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {item.university?.name}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-slate-400 text-center">
                    Không tìm thấy kết quả
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Show remaining slots */}
          {selectedMajors.length < maxComparisons && (
            <p className="text-xs text-slate-500 mt-2 text-center">
              {userPlan === "FREE"
                ? "Gói Miễn Phí: So sánh tối đa 3 ngành"
                : `Bạn có thể so sánh thêm ${maxComparisons - selectedMajors.length} ngành nữa (Gói ${userPlan})`}
            </p>
          )}
        </div>

        {/* Comparison Table */}
        {selectedMajors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedMajors.map((item) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-slate-100 rounded-3xl p-8 relative shadow-lg shadow-slate-100"
              >
                <button
                  onClick={() => handleRemove(item._id)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition"
                >
                  ✕
                </button>

                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2 text-slate-900">
                    {item.major?.name}
                  </h3>
                  <div className="group">
                    <p className="text-blue-600 font-bold text-lg">
                      {item.university?.name}
                    </p>
                    {item.university?.website && (
                      <a
                        href={item.university.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-500 hover:text-blue-700 mt-1 bg-blue-50 px-2 py-1 rounded-md transition-all"
                      >
                        Ghé thăm website ↗
                      </a>
                    )}
                  </div>
                  <p className="text-slate-500 text-sm mt-2">
                    📍 {item.university?.address}
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="pb-4 border-b border-slate-100">
                    <p className="text-slate-500 text-sm mb-1">
                      Điểm Chuẩn (2024)
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {item.admissionScore}
                    </p>
                  </div>

                  <div className="pb-4 border-b border-slate-100">
                    <p className="text-slate-500 text-sm mb-1">
                      Học Phí Ước Tính / Năm
                    </p>
                    <p className="text-xl font-semibold text-slate-900">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(item.tuitionFee)}
                    </p>
                  </div>

                  {userPlan !== "FREE" && (
                    <>
                      <div className="pb-4 border-b border-slate-100">
                        <p className="text-slate-500 text-sm mb-1">
                          Tổ Hợp Xét Tuyển
                        </p>
                        <p className="text-xl font-semibold text-blue-600">
                          {item.subjectCombination}
                        </p>
                      </div>

                      <div className="pb-4 border-b border-slate-100">
                        <p className="text-slate-500 text-sm mb-1">Lĩnh Vực</p>
                        <p className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg inline-block text-sm font-medium">
                          {item.major?.hollandTypes?.join(", ") ||
                            "Đang cập nhật"}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-500 text-sm mb-1">
                          Loại Trường
                        </p>
                        <p className="text-sm font-medium text-slate-900">
                          {item.university?.type === "Public"
                            ? "🏛️ Công lập"
                            : "🏢 Tư thục"}
                        </p>
                      </div>
                    </>
                  )}

                  {/* PAID & PREMIUM: 3-year trend chart placeholder */}
                  {(userPlan === "PAID" || userPlan === "PREMIUM") && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                      <p className="text-blue-600 text-xs font-bold uppercase mb-3">
                        Biểu đồ biến động điểm 3 năm
                      </p>
                      <div className="h-20 flex items-end gap-2">
                        <div
                          className="flex-1 bg-blue-300 rounded-t-sm"
                          style={{ height: "60%" }}
                        ></div>
                        <div
                          className="flex-1 bg-blue-400 rounded-t-sm"
                          style={{ height: "80%" }}
                        ></div>
                        <div
                          className="flex-1 bg-blue-600 rounded-t-sm"
                          style={{ height: "100%" }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>2022</span>
                        <span>2023</span>
                        <span>2024</span>
                      </div>
                    </div>
                  )}

                  {/* PREMIUM: AI Suitability Evaluation placeholder */}
                  {userPlan === "PREMIUM" && (
                    <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                      <p className="text-indigo-600 text-xs font-bold uppercase mb-2">
                        AI Đánh giá mức độ vừa sức
                      </p>
                      <p className="text-sm text-slate-600 italic">
                        "Dựa trên điểm số của bạn, ngành này có mức độ phù hợp
                        85%. Bạn có khả năng trúng tuyển cao."
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl">
            <p className="text-slate-500 text-lg">
              Chọn ít nhất một ngành để bắt đầu so sánh
            </p>
          </div>
        )}
      </div>

      {/* Upgrade Confirmation Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6"
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">
                Giới hạn so sánh
              </h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Gói <strong>Miễn Phí</strong> chỉ hỗ trợ so sánh tối đa 3 ngành.
                Nâng cấp lên gói <strong>Trả Phí</strong> để mở khóa thêm nhiều
                lượt so sánh và tính năng chuyên sâu hơn!
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/pricing")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-200"
                >
                  Nâng cấp ngay
                </button>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl transition-all"
                >
                  Để sau
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComparisonPage;
