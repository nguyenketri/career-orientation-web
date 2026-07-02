import { useState, useRef, useEffect, useCallback } from "react";
import {
  recommendBySubjects,
  getRecommendQuota,
} from "../../services/recommendService";
import { getUser } from "../../utils/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useRecommendation } from "../../context/RecommendationContext";

const RecommendPage = () => {
  const {
    scores,
    setScores,
    result,
    setResult,
    filters,
    setFilters,
    pagination,
    setPagination,
  } = useRecommendation();

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [quota, setQuota] = useState(null);
  const navigate = useNavigate();
  const requestCountRef = useRef(0);

  const fetchQuota = useCallback(async () => {
    if (!getUser()) {
      const guestUsed = localStorage.getItem("guest_recommendation_used");
      if (guestUsed) {
        setQuota({ plan: "GUEST", used: 1, limit: 1, remaining: 0 });
      } else {
        setQuota({ plan: "GUEST", used: 0, limit: 1, remaining: 1 });
      }
      return;
    }

    try {
      const data = await getRecommendQuota();
      setQuota(data.data);
    } catch (err) {
      console.error("Error fetching quota:", err);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuota();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchQuota]);

  const handleRecommend = async (isLoadMore = false) => {
    // Check guest quota
    if (!getUser() && !isLoadMore) {
      const guestUsed = localStorage.getItem("guest_recommendation_used");
      if (guestUsed) {
        navigate("/login");
        return;
      }
    }

    requestCountRef.current += 1;
    const currentRequestId = requestCountRef.current;

    try {
      setError("");
      if (!isLoadMore) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const validScores = Object.values(scores).filter(
        (s) => s !== "" && !isNaN(Number(s)),
      );
      if (validScores.length < 3) {
        if (currentRequestId === requestCountRef.current) {
          setError("Vui lòng nhập tối thiểu 3 môn học để tính tổ hợp.");
        }
        return;
      }

      const formattedScores = {};
      Object.keys(scores).forEach((key) => {
        if (scores[key] !== "") {
          formattedScores[key] = Number(scores[key]);
        }
      });

      const currentPage = isLoadMore ? pagination.page + 1 : 1;
      const response = await recommendBySubjects(
        formattedScores,
        {
          location: filters.location,
          type: filters.type,
          maxTuition: filters.maxTuition * 1000000,
        },
        { ...pagination, page: currentPage },
      );

      if (currentRequestId !== requestCountRef.current) return;

      if (isLoadMore) {
        setResult((prev) => ({
          ...response.data,
          recommendations: [
            ...(prev?.recommendations || []),
            ...(response.data?.recommendations || []),
          ],
        }));
        setPagination((prev) => ({ ...prev, page: currentPage }));
      } else {
        setResult(response.data);
        setPagination((prev) => ({ ...prev, page: 1 }));
      }

      // Update quota after successful search
      if (!getUser() && !isLoadMore) {
        localStorage.setItem("guest_recommendation_used", "true");
      }
      fetchQuota();
    } catch (err) {
      if (currentRequestId !== requestCountRef.current) return;

      if (err.response?.data?.code === "QUOTA_EXCEEDED") {
        if (!getUser()) {
          navigate("/login");
        } else {
          navigate("/upgrade-prompt?feature=Phân tích tổ hợp điểm");
        }
      } else {
        setError("Có lỗi xảy ra, vui lòng thử lại sau.");
      }
      console.log(err);
    } finally {
      if (currentRequestId === requestCountRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };

  const handleScoreChange = (e) => {
    const { name, value } = e.target;
    if (value === "" || (Number(value) >= 0 && Number(value) <= 10)) {
      setScores((prev) => ({ ...prev, [name]: value }));
    }
  };

  const subjectInputs = [
    { name: "math", label: "TOÁN" },
    { name: "literature", label: "VĂN" },
    { name: "english", label: "ANH" },
    { name: "physics", label: "LÝ" },
    { name: "chemistry", label: "HÓA" },
    { name: "biology", label: "SINH" },
    { name: "history", label: "SỬ" },
    { name: "geography", label: "ĐỊA" },
    { name: "civicEducation", label: "GDCD" },
  ];

  const getUniversityImage = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Uni")}&background=random&size=400`;
  };

  // Xác suất đậu dựa trên khoảng cách điểm user so với điểm chuẩn
  const getProbability = (item) => {
    const margin =
      (item.userScoreForCombination ?? 0) - (item.admissionScore ?? 0);
    if (margin >= 2) return { label: "Rất cao (>99%)", color: "text-green-600" };
    if (margin >= 0) return { label: "Cao (95%)", color: "text-green-600" };
    if (margin >= -2) return { label: "Trung bình (70%)", color: "text-orange-500" };
    return { label: "Thử sức (55%)", color: "text-rose-500" };
  };

  const totalResults = result?.total ?? result?.totalResults ?? 0;
  const remainingResults = Math.max(
    totalResults - (result?.recommendations?.length || 0),
    0,
  );

  const sortedCombinations = result?.combinations
    ? [...result.combinations].sort((a, b) => b.score - a.score)
    : [];

  // Nhãn hiển thị lượt dùng theo gói dịch vụ
  const renderQuotaBadge = () => {
    if (!quota) return null;
    const plan = quota.plan || (getUser() ? "FREE" : "GUEST");

    if (quota.limit === Infinity || plan === "PREMIUM") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600">
          <span>✨</span> Không giới hạn lượt (Premium)
        </span>
      );
    }

    const remaining = quota.remaining ?? 0;
    const isGuest = plan === "GUEST";
    return (
      <span
        className={`text-[11px] font-bold ${
          remaining === 0 ? "text-rose-500" : "text-slate-400"
        }`}
      >
        Còn{" "}
        <span
          className={remaining === 0 ? "text-rose-500" : "text-blue-600"}
        >
          {remaining}
        </span>
        /{quota.limit} lượt {isGuest ? "thử miễn phí" : "hôm nay"}
      </span>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 px-4 md:px-8 pt-24 pb-20 text-slate-900">
        <div className="mx-auto max-w-7xl flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-6 text-slate-900 font-bold text-lg">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Bộ lọc
              </div>

              {/* Region Filter */}
              <div className="mb-8">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Khu vực
                </h4>
                <div className="space-y-3">
                  {[
                    { label: "Toàn quốc", value: "" },
                    { label: "Hà Nội", value: "Hà Nội" },
                    { label: "TP. Hồ Chí Minh", value: "TP.HCM" },
                    { label: "Đà Nẵng", value: "Đà Nẵng" },
                  ].map((loc) => (
                    <label
                      key={loc.label}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="location"
                        checked={filters.location === loc.value}
                        onChange={() =>
                          setFilters((prev) => ({
                            ...prev,
                            location: loc.value,
                          }))
                        }
                        className="w-4 h-4 rounded-full border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-600 group-hover:text-blue-600 transition">
                        {loc.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tuition Filter */}
              <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                    Học phí tối đa (Triệu VND/năm)
                  </h4>
                  <span className="text-sm font-black text-blue-600">
                    {filters.maxTuition} Triệu
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={filters.maxTuition}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      maxTuition: Number(e.target.value),
                    }))
                  }
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between w-full mt-4 px-1">
                  {["10M", "50M", "100M", "150M", "200M+"].map((marker) => (
                    <span
                      key={marker}
                      className="text-[10px] font-medium text-slate-400 tracking-wider"
                    >
                      {marker}
                    </span>
                  ))}
                </div>
              </div>

              {/* University Type Filter */}
              <div className="mb-8">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Loại hình trường
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Tất cả", value: "" },
                    { label: "Công lập", value: "Public" },
                    { label: "Dân lập", value: "Private" },
                    { label: "Quốc tế", value: "International" },
                  ].map((t) => (
                    <button
                      key={t.label}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, type: t.value }))
                      }
                      className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                        filters.type === t.value
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mentor AI Promo */}
              <div className="mt-10 p-5 bg-slate-900 rounded-2xl text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <h5 className="font-bold mb-2">Mentor AI</h5>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Bạn chưa biết chọn ngành nào? Hãy để AI phân tích tính cách
                    và điểm số của bạn.
                  </p>
                  <button
                    onClick={() => navigate("/mentor")}
                    className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition"
                  >
                    Thử ngay →
                  </button>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition duration-500">
                  <span className="text-6xl">🤖</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Score Input Section */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm mb-8">
              <div className="flex justify-between items-start gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Phân tích tổ hợp điểm
                  </h2>
                  <p className="text-sm text-slate-500">
                    Nhập điểm các môn thi THPT Quốc gia để nhận gợi ý chính xác
                    nhất.
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 shrink-0 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-[11px] font-bold text-green-600">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Dữ liệu 2023
                </span>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3 mb-8">
                {subjectInputs.map((subj) => (
                  <div key={subj.name} className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase text-center">
                      {subj.label}
                    </label>
                    <input
                      type="number"
                      name={subj.name}
                      value={scores[subj.name]}
                      onChange={handleScoreChange}
                      placeholder="0.0"
                      className="w-full text-center py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-500 shrink-0">
                    Kết quả tổ hợp:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sortedCombinations.map((combo, i) => (
                      <div
                        key={combo.name}
                        className={`flex flex-col items-center px-4 py-1.5 rounded-xl min-w-[62px] ${
                          i === 0
                            ? "bg-slate-900 shadow-md shadow-slate-200"
                            : "bg-slate-100"
                        }`}
                      >
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            i === 0 ? "text-slate-400" : "text-slate-400"
                          }`}
                        >
                          {combo.name}
                        </span>
                        <span
                          className={`text-base font-black ${
                            i === 0 ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {combo.score.toFixed(1)}
                        </span>
                      </div>
                    ))}
                    {!result && (
                      <span className="text-xs text-slate-400 italic self-center">
                        Nhập điểm để xem tổ hợp...
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-stretch md:items-end gap-2 w-full md:w-auto">
                  {!getUser() && (
                    <p className="text-[10px] font-medium text-slate-500 text-center md:text-right max-w-[240px] md:self-end leading-relaxed">
                      Bạn có <b>1 lượt</b> thử miễn phí. Đăng ký để mở khóa{" "}
                      <b>3 lượt/ngày</b> (FREE) hoặc nhiều hơn.
                    </p>
                  )}
                  <button
                    onClick={() => handleRecommend()}
                    className="w-full md:w-auto px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition shadow-lg shadow-orange-200 active:scale-95"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.291z"
                          />
                        </svg>
                        Đang xử lý...
                      </span>
                    ) : (
                      "Tìm kiếm ngay"
                    )}
                  </button>
                  <div className="text-center md:text-right">
                    {renderQuotaBadge()}
                  </div>
                </div>
              </div>
              {error && (
                <p className="mt-4 text-sm text-red-500 font-medium text-center">
                  {error}
                </p>
              )}
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-900">
                  Ngành học & Trường phù hợp{" "}
                  {result && `(${totalResults} kết quả)`}
                </h3>
                <div className="flex bg-white border border-slate-200 rounded-lg p-1">
                  <button className="p-1.5 bg-slate-100 rounded-md text-slate-600">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5 4h3v3H5V4zm7 0h3v3h-3V4zM5 11h3v3H5v-3zm7 0h3v3h-3v-3z" />
                    </svg>
                  </button>
                  <button className="p-1.5 bg-slate-900 text-white rounded-md">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 4h14v12H3V4zm2 2v8h10V6H5z" />
                    </svg>
                  </button>
                </div>
              </div>

              {result?.recommendations?.length > 0 ? (
                <div
                  className={`relative grid gap-4 transition-opacity duration-200 ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}
                >
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-slate-200 flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-blue-600"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.291z"
                          />
                        </svg>
                        <span className="text-xs font-bold text-blue-600">
                          Đang cập nhật kết quả...
                        </span>
                      </div>
                    </div>
                  )}
                  {result.recommendations.map((item, idx) => {
                    const prob = getProbability(item);
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (idx % 5) * 0.05 }}
                        key={`${item._id}_${idx}`}
                        className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col md:flex-row gap-5 hover:shadow-lg hover:border-slate-200 transition group"
                      >
                        {/* University Image */}
                        <div className="w-full md:w-44 h-32 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={
                              item.university?.image ||
                              getUniversityImage(item.university?.name)
                            }
                            alt={item.university?.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            onError={(e) => {
                              e.target.src = getUniversityImage(
                                item.university?.name,
                              );
                            }}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                                    item.university?.type === "Public"
                                      ? "bg-blue-100 text-blue-600"
                                      : item.university?.type === "Private"
                                        ? "bg-orange-100 text-orange-600"
                                        : "bg-purple-100 text-purple-600"
                                  }`}
                                >
                                  {item.university?.type === "Public"
                                    ? "Công lập"
                                    : item.university?.type === "Private"
                                      ? "Dân lập"
                                      : "Quốc tế"}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                  {item.university?.location || "Việt Nam"}
                                </span>
                              </div>
                              <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition">
                                {item.university?.name}
                              </h4>
                              <p className="text-md font-bold text-slate-700">
                                {item.major?.name}
                              </p>
                            </div>

                            {/* Điểm chuẩn */}
                            <div className="text-right flex-shrink-0">
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                Điểm chuẩn 2023
                              </span>
                              <span className="block text-2xl font-black text-orange-500 leading-tight">
                                {item.admissionScore}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-sm text-slate-500 font-medium mt-3">
                            <div className="flex items-center gap-1.5">
                              <span>💰</span>
                              <span>
                                {item.tuitionFee
                                  ? `~${(item.tuitionFee / 1000000).toFixed(0)} Triệu / năm`
                                  : "Đang cập nhật"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span>🎯</span>
                              <span className="text-slate-900 font-bold">
                                Xác suất đậu:
                                <span className={prob.color}>
                                  {" "}
                                  {prob.label}
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-end mt-auto pt-3">
                            <button
                              onClick={() =>
                                navigate(`/university/${item.university._id}`)
                              }
                              className="text-blue-600 text-sm font-bold hover:underline flex items-center gap-1"
                            >
                              Chi tiết <span className="text-lg">›</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                !loading &&
                result && (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-500 font-medium">
                      Không tìm thấy trường phù hợp với mức điểm này.
                    </p>
                  </div>
                )
              )}

              {result && result.page < result.totalPages && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => handleRecommend(true)}
                    disabled={loadingMore}
                    className="px-8 py-3 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-50 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {loadingMore
                      ? "Đang tải..."
                      : `Xem thêm ${remainingResults} trường khác`}
                    {!loadingMore && <span className="text-base">▾</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="mt-10 rounded-2xl border border-slate-200 bg-white px-5 py-4 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-500 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xs text-slate-500 leading-relaxed">
                <span className="font-bold text-slate-700">Lưu ý:</span> Mọi kết
                quả và gợi ý từ <span className="font-bold">caZup</span> đều dựa
                trên dữ liệu phân tích và mang tính chất tham khảo khách quan.
                Kết quả có thể không phản ánh đầy đủ thực tế tuyển sinh. Quyết
                định cuối cùng nên dựa trên sự cân nhắc kỹ lưỡng của bạn, gia
                đình và các chuyên gia tư vấn giáo dục.
              </p>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default RecommendPage;
