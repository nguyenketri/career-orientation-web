import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { hollandMaps } from "../../utils/hollandMap";
import { mbtiMaps } from "../../utils/mbtiMap";
import { getUser } from "../../utils/auth";

const RecommendationCard = ({ major, matchPercent, navigate }) => (
  <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
    <div className="relative h-40 overflow-hidden">
      <img
        src={
          major.universities?.[0]?.image ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(major.name)}&background=random&size=400`
        }
        alt={major.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(major.name)}&background=random&size=400`;
        }}
      />
      <div className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
        {matchPercent}% Phù hợp
      </div>
    </div>
    <div className="p-5">
      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
        Ngành học
      </div>
      <h4 className="text-lg font-black text-slate-900 mb-1">{major.name}</h4>
      <div className="flex items-center gap-1 text-slate-500 text-xs mb-4">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-bold text-slate-700">
          {major.universities?.[0]?.name || "Đại học gợi ý"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase">
            Điểm chuẩn
          </div>
          <div className="text-sm font-bold text-slate-700">
            {major.benchmarkScore || "Đang cập nhật"}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase">
            Học phí năm
          </div>
          <div className="text-sm font-bold text-slate-700">
            {major.tuitionFee
              ? `${(major.tuitionFee / 1000000).toFixed(0)} Triệu`
              : "Đang cập nhật"}
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          const university = major.universities?.[0];
          if (university?.website) {
            window.open(university.website, "_blank");
          } else if (university?._id) {
            navigate(`/university/${university._id}`);
          }
        }}
        className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
      >
        Xem chi tiết
      </button>
    </div>
  </div>
);

const AiMentorSection = ({ holland, mbti, plan, navigate }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [notice, setNotice] = useState(null); // { type: 'error' | 'upgrade', message }
  const hollandType = holland?.hollandType || "N/A";
  const mbtiType = mbti?.mbtiType || "N/A";

  const handleDownloadPdf = async () => {
    if (plan !== "PREMIUM") {
      setNotice({
        type: "upgrade",
        message:
          "Xuất báo cáo PDF chi tiết là tính năng dành riêng cho gói Cao Cấp (PREMIUM).",
      });
      return;
    }

    try {
      setIsDownloading(true);
      setNotice(null);
      const response = await axios.get("/pdf/export", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `BaoCaoChiTiet_${new Date().getTime()}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      setNotice({
        type: "error",
        message: "Có lỗi xảy ra khi tải báo cáo. Vui lòng thử lại sau.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm mt-12">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shrink-0">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.387 2.618a1 1 0 001.766 0l1.387-2.618a1 1 0 00-.788-1.838l-4-1.714a.999.999 0 01-.356.257L3 11.24l7-3a1 1 0 000-1.84l-7-3a1 1 0 00-.788 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900">
            Lời khuyên từ AI Mentor
          </h3>
          <p className="text-slate-600 leading-relaxed mt-2">
            Dựa trên nhóm mã Holland{" "}
            <span className="font-bold text-orange-600">{hollandType}</span> và
            MBTI <span className="font-bold text-orange-600">{mbtiType}</span>,
            bạn là người có thiên hướng sáng tạo mạnh mẽ kết hợp với khả năng
            kết nối con người tuyệt vời. Bạn sẽ tỏa sáng nhất trong những môi
            trường làm việc không quá gò bó, nơi bạn có thể tự do thử nghiệm các
            ý tưởng mới.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Gợi ý phát triển
          </div>
          <p className="text-sm text-slate-600">
            Hãy thử tham gia các dự án thiết kế vì cộng đồng hoặc tổ chức sự
            kiện sáng tạo để rèn luyện kỹ năng thực tế.
          </p>
        </div>
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-sm mb-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Lưu ý nhỏ
          </div>
          <p className="text-sm text-slate-600">
            Bạn dễ cảm thấy chán nản với các công việc lặp đi lặp lại hoặc quá
            nhiều quy tắc hành chính.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-8">
        <button
          onClick={() => navigate("/mentor")}
          className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.72 1.72a2 2 0 01-2.828 0L3 12" />
          </svg>
          Hỏi thêm Mentor về ngành học
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className={`px-6 py-3 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${
            isDownloading
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {isDownloading && (
            <svg
              className="animate-spin h-4 w-4 text-slate-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          {isDownloading ? "Đang tạo báo cáo..." : "Tải báo cáo chi tiết (PDF)"}
        </button>
      </div>

      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className={`mt-4 flex items-start gap-3 rounded-2xl border p-4 ${
                notice.type === "upgrade"
                  ? "bg-blue-50 border-blue-100"
                  : "bg-red-50 border-red-100"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  notice.type === "upgrade"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {notice.type === "upgrade" ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.387 2.618a1 1 0 001.766 0l1.387-2.618a1 1 0 00-.788-1.838l-4-1.714a.999.999 0 01-.356.257L3 11.24l7-3a1 1 0 000-1.84l-7-3a1 1 0 00-.788 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-bold ${
                    notice.type === "upgrade" ? "text-blue-900" : "text-red-900"
                  }`}
                >
                  {notice.message}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  {notice.type === "upgrade" ? (
                    <button
                      onClick={() => navigate("/pricing")}
                      className="text-sm font-bold text-blue-600 hover:underline"
                    >
                      Nâng cấp Premium ›
                    </button>
                  ) : (
                    <button
                      onClick={handleDownloadPdf}
                      className="text-sm font-bold text-red-600 hover:underline"
                    >
                      Thử lại
                    </button>
                  )}
                  <button
                    onClick={() => setNotice(null)}
                    className="text-sm font-medium text-slate-400 hover:text-slate-600"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TestResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const extractResult = (res) => {
    if (!res) return null;
    return res.data ? res.data : res;
  };

  const [activeTab, setActiveTab] = useState(
    location.state?.type === "mbti" ? "mbti" : "holland",
  );
  const [hollandResult, setHollandResult] = useState(
    location.state?.type === "holland"
      ? extractResult(location.state.result)
      : null,
  );
  const [mbtiResult, setMbtiResult] = useState(
    location.state?.type === "mbti"
      ? extractResult(location.state.result)
      : null,
  );
  const [loading, setLoading] = useState(!hollandResult && !mbtiResult);

  useEffect(() => {
    let isMounted = true;
    const fetchResults = async () => {
      try {
        setLoading(true);
        const [hollandRes, mbtiRes] = await Promise.all([
          axios.get("/holland-results/me"),
          axios.get("/mbti/history"),
        ]);

        if (isMounted) {
          if (hollandRes.data.data && hollandRes.data.data.length > 0) {
            setHollandResult(hollandRes.data.data[0]);
          }
          if (mbtiRes.data.data && mbtiRes.data.data.length > 0) {
            setMbtiResult(mbtiRes.data.data[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (!hollandResult || !mbtiResult) {
      fetchResults();
    }

    return () => {
      isMounted = false;
    };
  }, []); // Only run once on mount

  if (!loading && !hollandResult && !mbtiResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">
            Không tìm thấy kết quả trắc nghiệm.
          </p>
          <button
            onClick={() => navigate("/tests")}
            className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold"
          >
            Quay lại trang Test
          </button>
        </div>
      </div>
    );
  }

  const getHollandChartData = () => {
    if (!hollandResult) return [];
    return Object.entries(hollandResult.hollandScores || {}).map(
      ([type, score]) => ({
        subject: hollandMaps[type]?.name || type,
        score: score,
        fullMark: 300,
      }),
    );
  };

  const getTop3Holland = () => {
    if (!hollandResult) return [];
    return Object.entries(hollandResult.hollandScores || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type, score]) => ({
        type,
        name: hollandMaps[type]?.name || type,
        score,
        percentage: Math.round((score / 300) * 100),
        desc: hollandMaps[type]?.desc,
      }));
  };

  const getMbtiComponents = () => {
    if (!mbtiResult) return [];
    const scores = mbtiResult.scores || {};
    const pairs = [
      { left: "E", right: "I", label: "Hướng ngoại / Hướng nội" },
      { left: "S", right: "N", label: "Cảm giác / Trực giác" },
      { left: "T", right: "F", label: "Lý trí / Cảm xúc" },
      { left: "J", right: "P", label: "Nguyên tắc / Linh hoạt" },
    ];

    return pairs.map(({ left, right, label }) => {
      const leftScore = scores[left] || 0;
      const rightScore = scores[right] || 0;
      const total = leftScore + rightScore || 1;
      return {
        label,
        left,
        right,
        leftPercent: Math.round((leftScore / total) * 100),
        rightPercent: Math.round((rightScore / total) * 100),
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 md:px-6 pt-24 md:pt-32 pb-20 text-slate-900">
      <div className="mx-auto max-w-7xl">
        {!getUser() && (
          <div className="mb-8 bg-blue-600 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-blue-600/20">
            <div>
              <h3 className="text-xl font-black mb-2">
                Bạn đang xem kết quả dưới dạng Khách
              </h3>
              <p className="text-blue-100 text-sm">
                Đăng ký tài khoản ngay để lưu kết quả, nhận gợi ý chuyên sâu và
                mở khóa các tính năng Premium!
              </p>
            </div>
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors whitespace-nowrap"
            >
              Đăng ký ngay
            </button>
          </div>
        )}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">
              Phân Tích Kết Quả Trắc Nghiệm
            </h1>
            <p className="text-slate-500 text-sm">
              Khám phá tiềm năng và định hướng nghề nghiệp của bạn
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-xs font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
              Hoàn thành lúc: {new Date().toLocaleString()}
            </div>
            <button
              onClick={() => navigate("/history?tab=holland")}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Xem toàn bộ lịch sử →
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-10">
          <div className="flex p-1 bg-slate-200/50 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab("holland")}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "holland" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Holland (RIASEC)
            </button>
            <button
              onClick={() => setActiveTab("mbti")}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "mbti" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              MBTI Personality
            </button>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Kết quả mới nhất
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "holland" ? (
              !hollandResult ? (
                <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-4">
                  <p className="text-slate-500">
                    Bạn chưa thực hiện bài test Holland.
                  </p>
                  <button
                    onClick={() => navigate("/tests")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors"
                  >
                    Làm test ngay →
                  </button>
                </div>
              ) : (
                <motion.div
                  key="holland"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-10"
                >
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
                      <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                        Top 3 Nhóm Mã
                      </h3>
                      <div className="space-y-4">
                        {getTop3Holland().map((item) => (
                          <div
                            key={item.type}
                            className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-blue-300 shadow-sm transition-all"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-black text-slate-900">
                                {item.name} ({item.type})
                              </span>
                              <span className="text-blue-600 font-black">
                                {item.percentage}%
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                      <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart
                            cx="50%"
                            cy="50%"
                            outerRadius="80%"
                            data={getHollandChartData()}
                          >
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis
                              dataKey="subject"
                              tick={{
                                fill: "#64748b",
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            />
                            <Radar
                              name="Score"
                              dataKey="score"
                              stroke="#2563eb"
                              fill="#3b82f6"
                              fillOpacity={0.6}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            ) : !mbtiResult ? (
              <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-4">
                <p className="text-slate-500">
                  Bạn chưa thực hiện bài test MBTI.
                </p>
                <button
                  onClick={() => navigate("/tests")}
                  className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors"
                >
                  Làm test ngay →
                </button>
              </div>
            ) : (
              <motion.div
                key="mbti"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                        </svg>
                      </div>
                      <h3 className="text-5xl font-black mb-2">
                        {mbtiResult?.mbtiType}
                      </h3>
                      <h4 className="text-xl font-bold text-blue-400 mb-4">
                        {mbtiMaps[mbtiResult?.mbtiType]?.name}
                      </h4>
                      <p className="text-slate-300 leading-relaxed opacity-90">
                        {mbtiMaps[mbtiResult?.mbtiType]?.desc}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                      <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                      Chỉ Số Thành Phần Tính Cách
                    </h3>
                    <div className="space-y-6">
                      {getMbtiComponents().map((comp, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-slate-700">
                              {comp.left} ({comp.leftPercent}%)
                            </span>
                            <span className="text-slate-400">{comp.label}</span>
                            <span className="text-slate-700">
                              ({comp.rightPercent}%) {comp.right}
                            </span>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                            <div
                              className="h-full bg-blue-600 transition-all duration-1000"
                              style={{ width: `${comp.leftPercent}%` }}
                            />
                            <div
                              className="h-full bg-slate-300 transition-all duration-1000"
                              style={{ width: `${comp.rightPercent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <div className="text-xs font-bold text-blue-600 uppercase mb-1">
                        Điểm nổi bật
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Bạn có khả năng thấu hiểu cảm xúc của người khác và có
                        khả năng thích nghi cao với các tình huống mới.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {(() => {
          const plan = getUser()?.subscriptionPlan || "FREE";
          const majors =
            (activeTab === "holland"
              ? hollandResult?.recommendedMajors
              : mbtiResult?.recommendedMajors) || [];
          return (
            <div className="mt-16">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
                <h2 className="text-2xl font-black text-slate-900 text-center md:text-left">
                  Gợi Ý Ngành & Trường Phù Hợp
                </h2>
                {plan !== "PREMIUM" && (
                  <button
                    onClick={() => navigate("/pricing")}
                    className="text-xs font-bold text-blue-600 hover:underline whitespace-nowrap"
                  >
                    {plan === "FREE"
                      ? "Gói Cơ Bản: chưa mở khoá — Nâng cấp ngay ›"
                      : "Gói Tiêu Chuẩn: tối đa 6 gợi ý — Nâng cấp Cao Cấp để xem không giới hạn ›"}
                  </button>
                )}
              </div>
              {majors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {majors.map((major, idx) => (
                    <RecommendationCard
                      key={major._id}
                      major={major}
                      matchPercent={Math.min(100, 90 + idx)}
                      navigate={navigate}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8 text-center">
                  <p className="text-blue-900 font-bold mb-1">
                    Mở khoá gợi ý trường & ngành theo kết quả trắc nghiệm
                  </p>
                  <p className="text-blue-700 text-sm mb-5">
                    Gói Cơ Bản (FREE) chưa bao gồm gợi ý trường/ngành. Nâng cấp Tiêu Chuẩn (PAID) để xem tối đa 6 gợi ý, hoặc Cao Cấp (PREMIUM) để xem không giới hạn.
                  </p>
                  <button
                    onClick={() => navigate("/pricing")}
                    className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition"
                  >
                    Nâng cấp ngay
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        <AiMentorSection
          holland={hollandResult}
          mbti={mbtiResult}
          plan={getUser()?.subscriptionPlan || "FREE"}
          navigate={navigate}
        />
      </div>
    </div>
  );
};

export default TestResultPage;
