import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { getMyHollandResults } from "../../services/hollandResult.service";
import { getMyMbtiResults } from "../../services/mbtiService";

const RecommendationCard = ({ major, matchPercent, navigate }) => (
  <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
    <div className="relative h-40 overflow-hidden">
      <img
        src={`https://source.unsplash.com/featured/?university,education,${major.name}`}
        alt={major.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
          {major.university?.name || "Đại học gợi ý"}
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
          if (major.university?.website) {
            window.open(major.university.website, "_blank");
          } else {
            navigate(`/university/${major.universityId}`);
          }
        }}
        className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
      >
        {major.university?.website ? "Truy cập website" : "Xem chi tiết"}
      </button>
    </div>
  </div>
);

const AiMentorSection = ({ holland, mbti }) => {
  const hollandType = holland?.hollandType || "N/A";
  const mbtiType = mbti?.mbtiType || "N/A";

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
        <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.72 1.72a2 2 0 01-2.828 0L3 12.//" />
          </svg>
          Hỏi thêm Mentor về ngành học
        </button>
        <button className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
          Tải báo cáo chi tiết (PDF)
        </button>
      </div>
    </div>
  );
};

const TestResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(
    location.pathname.includes("mbti") ? "mbti" : "holland",
  );
  const [hollandResult, setHollandResult] = useState(
    location.state?.result && activeTab === "holland"
      ? location.state.result
      : null,
  );
  const [mbtiResult, setMbtiResult] = useState(
    location.state?.result && activeTab === "mbti"
      ? location.state.result
      : null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMissingResults = async () => {
      setLoading(true);
      try {
        const [hRes, mRes] = await Promise.all([
          !hollandResult
            ? getMyHollandResults().catch(() => ({ data: { data: [] } }))
            : Promise.resolve({ data: { data: [hollandResult] } }),
          !mbtiResult
            ? getMyMbtiResults().catch(() => ({ data: { data: [] } }))
            : Promise.resolve({ data: { data: [mbtiResult] } }),
        ]);

        const hData = hRes.data?.data?.[0] || hRes.data?.[0];
        const mData = mRes.data?.data?.[0] || mRes.data?.[0];

        if (hData) setHollandResult(hData);
        if (mData) setMbtiResult(mData);
      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMissingResults();
  }, []);

  if (!hollandResult && !mbtiResult) {
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
              onClick={() => navigate("/history")}
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

        <div className="mt-16">
          <h2 className="text-2xl font-black text-slate-900 mb-8 text-center md:text-left">
            Gợi Ý Ngành & Trường Phù Hợp
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === "holland"
              ? hollandResult?.recommendedMajors
              : mbtiResult?.recommendedMajors
            )?.map((major, idx) => (
              <RecommendationCard
                key={major._id}
                major={major}
                matchPercent={90 + idx}
                navigate={navigate}
              />
            ))}
          </div>
        </div>

        <AiMentorSection holland={hollandResult} mbti={mbtiResult} />
      </div>
    </div>
  );
};

export default TestResultPage;
