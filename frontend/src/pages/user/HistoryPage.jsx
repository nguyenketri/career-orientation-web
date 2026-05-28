import { useEffect, useState } from "react";
import { getMyHollandResults } from "../../services/hollandResult.service";
import { getMyMbtiResults } from "../../services/mbtiService";
import { getScoreAnalysisHistory } from "../../services/recommendService";
import { hollandMaps } from "../../utils/hollandMap";
import { mbtiMaps } from "../../utils/mbtiMap";
import HollandChart from "../../components/HollandChart";
import SkeletonLoader from "../../components/SkeletonLoader";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const HistoryPage = () => {
  const [hollandResults, setHollandResults] = useState([]);
  const [mbtiResults, setMbtiResults] = useState([]);
  const [scoreResults, setScoreResults] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("holland");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hollandRes, mbtiRes, scoreRes] = await Promise.all([
          getMyHollandResults().catch(() => ({ data: [] })),
          getMyMbtiResults().catch(() => ({ data: [] })),
          getScoreAnalysisHistory().catch(() => ({ data: [] })),
        ]);

        setHollandResults(hollandRes.data || []);
        setMbtiResults(mbtiRes.data || []);
        setScoreResults(scoreRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const latestHolland = hollandResults[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-6 pt-32 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl"
      >
        {/* Loading */}
        {loading && <SkeletonLoader type="card" count={3} />}
        {!loading && (
          <>
            {/* Tabs */}
            <div className="flex space-x-2 border-b border-slate-200 mb-8 pb-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab("holland")}
                className={`px-6 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeTab === "holland"
                    ? "bg-blue-600 text-white font-bold shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                Holland Profile
              </button>
              <button
                onClick={() => setActiveTab("mbti")}
                className={`px-6 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeTab === "mbti"
                    ? "bg-blue-600 text-white font-bold shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                MBTI Profile
              </button>
              <button
                onClick={() => setActiveTab("academic")}
                className={`px-6 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeTab === "academic"
                    ? "bg-blue-600 text-white font-bold shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                Học Vấn & Gợi Ý
              </button>
            </div>

            {/* HOLLAND TAB */}
            {activeTab === "holland" &&
              (hollandResults.length === 0 ? (
                <div className="text-center mt-20 border border-slate-200 rounded-3xl py-20 bg-white shadow-sm">
                  <h2 className="text-2xl font-bold mb-2 text-slate-900">
                    Chưa có kết quả Holland
                  </h2>
                  <p className="text-slate-500 mb-6">
                    Hãy làm bài test Holland đầu tiên của bạn
                  </p>
                  <button
                    onClick={() => navigate("/holland")}
                    className="rounded-xl bg-blue-600 text-white px-6 py-3 font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    Bắt Ðầu Test
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-12 rounded-3xl bg-white p-10 shadow-xl shadow-blue-100 border border-blue-50">
                    <p className="text-sm uppercase tracking-widest text-blue-600 font-bold">
                      Nhóm Tính Cách Nổi Bật
                    </p>
                    <h2 className="mt-2 text-5xl font-black">
                      <span className="text-blue-600">
                        {hollandMaps[latestHolland.hollandType]?.name ||
                          latestHolland.hollandType}
                      </span>
                    </h2>
                    <p className="mt-4 max-w-xl text-slate-600 leading-relaxed">
                      {hollandMaps[latestHolland.hollandType]?.desc}
                    </p>
                  </div>

                  <div className="mb-12 rounded-3xl bg-white p-8 border border-slate-100 shadow-lg shadow-slate-100">
                    <h3 className="mb-6 text-2xl font-bold text-slate-900">
                      Bản Biểu Điểm (Personality Breakdown)
                    </h3>
                    <HollandChart scores={latestHolland.hollandScores} />
                  </div>

                  <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(latestHolland.topTypes?.length
                      ? latestHolland.topTypes
                      : Object.entries(latestHolland.hollandScores)
                          .sort((a, b) => b[1] - a[1])
                          .map((x) => x[0])
                          .slice(0, 3)
                    ).map((type, index) => {
                      const score = latestHolland.hollandScores[type];
                      return (
                        <div
                          key={type}
                          className={`rounded-2xl p-6 border transition-all ${
                            index === 0
                              ? "bg-blue-50 border-blue-200 shadow-md"
                              : "bg-white border-slate-100 shadow-sm"
                          }`}
                        >
                          <h4 className="text-lg font-bold text-slate-900">
                            {hollandMaps[type]?.name || type}
                          </h4>
                          <p className="text-sm text-slate-500">
                            Score: {score}
                          </p>
                          {index === 0 && (
                            <span className="mt-2 inline-block text-xs font-bold text-blue-600">
                              Đặc Điểm Trội Nhất
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <h3 className="mb-6 text-2xl font-bold text-slate-900">
                      Lịch Sử Test Holland
                    </h3>
                    <div className="space-y-4">
                      {hollandResults.map((r) => (
                        <div
                          key={r._id}
                          className="flex items-center justify-between rounded-xl bg-white p-5 border border-slate-100 shadow-sm"
                        >
                          <div>
                            <p className="font-bold text-slate-900">
                              {hollandMaps[r.hollandType]?.name ||
                                r.hollandType}
                            </p>
                            <p className="text-sm text-slate-500">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-lg font-black text-blue-600">
                            {r.hollandType}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ))}

            {/* MBTI TAB */}
            {activeTab === "mbti" &&
              (mbtiResults.length === 0 ? (
                <div className="text-center mt-20 border border-slate-200 rounded-3xl py-20 bg-white shadow-sm">
                  <h2 className="text-2xl font-bold mb-2 text-slate-900">
                    Chưa có kết quả MBTI
                  </h2>
                  <p className="text-slate-500 mb-6">
                    Hãy làm bài test MBTI đầu tiên của bạn
                  </p>
                  <button
                    onClick={() => navigate("/mbti")}
                    className="rounded-xl bg-blue-600 text-white px-6 py-3 font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    Bắt Ðầu Test
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-12 rounded-3xl bg-white p-10 shadow-xl shadow-blue-100 border border-blue-50">
                    <p className="text-sm uppercase tracking-widest text-blue-600 font-bold">
                      Loại Hình MBTI
                    </p>
                    <h2 className="mt-2 text-5xl font-black">
                      <span className="text-blue-600">
                        {mbtiResults[0].mbtiType}
                      </span>
                    </h2>
                    <h3 className="mt-2 text-2xl font-bold text-slate-900">
                      {mbtiMaps[mbtiResults[0].mbtiType]?.name}
                    </h3>
                    <p className="mt-4 max-w-xl text-slate-600 leading-relaxed">
                      {mbtiMaps[mbtiResults[0].mbtiType]?.desc}
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-6 text-2xl font-bold text-slate-900">
                      Lịch Sử Test MBTI
                    </h3>
                    <div className="space-y-4">
                      {mbtiResults.map((r) => (
                        <div
                          key={r._id}
                          className="flex items-center justify-between rounded-xl bg-white p-5 border border-slate-100 shadow-sm"
                        >
                          <div>
                            <p className="font-bold text-slate-900">
                              {mbtiMaps[r.mbtiType]?.name || r.mbtiType}
                            </p>
                            <p className="text-sm text-slate-500">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-lg font-black text-blue-600">
                            {r.mbtiType}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ))}

            {/* ACADEMIC TAB */}
            {activeTab === "academic" &&
              (scoreResults.length === 0 ? (
                <div className="text-center mt-20 border border-slate-200 rounded-3xl py-20 bg-white shadow-sm">
                  <h2 className="text-2xl font-bold mb-2 text-slate-900">
                    Chưa phân tích kết quả học tập
                  </h2>
                  <p className="text-slate-500 mb-6">
                    Hãy phân tích điểm số của bạn để tìm tổ hợp và trường phù
                    hợp
                  </p>
                  <button
                    onClick={() => navigate("/recommend")}
                    className="rounded-xl bg-blue-600 text-white px-6 py-3 font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    Bắt Ðầu Nhập Điểm
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-12 rounded-3xl bg-white p-8 border border-slate-100 shadow-lg shadow-slate-100">
                    <h3 className="text-2xl font-bold border-b border-slate-100 pb-4 mb-6 text-slate-900">
                      Lịch Sử Dự Đoán Trường & Ngành (Gần Nhất)
                    </h3>
                    <p className="text-slate-500 mb-6">
                      Hệ thống ghi nhận vào ngày:{" "}
                      {new Date(scoreResults[0].createdAt).toLocaleString()}
                    </p>

                    <h4 className="text-lg font-bold mb-4 text-blue-600">
                      Top Tổ Hợp Môn
                    </h4>
                    <div className="flex gap-4 mb-8 flex-wrap">
                      {scoreResults[0].topCombinations?.map((combo) => (
                        <div
                          key={combo._id || combo.combination}
                          className="px-5 py-3 bg-blue-50 border border-blue-100 rounded-xl"
                        >
                          <div className="text-blue-600 text-sm font-bold">
                            {combo.combination}
                          </div>
                          <div className="text-xl font-black text-slate-900">
                            {combo.totalScore.toFixed(1)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <h4 className="text-lg font-bold mb-4 text-blue-600">
                      Ngành Học Lưu Trữ
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {scoreResults[0].recommendedUniversityMajors?.map(
                        (um) => (
                          <div
                            key={um._id}
                            className="bg-slate-50 border border-slate-100 p-4 rounded-xl"
                          >
                            <p className="font-bold text-slate-900">
                              {um.major?.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              {um.university?.name}
                            </p>
                          </div>
                        ),
                      )}
                      {(!scoreResults[0].recommendedUniversityMajors ||
                        scoreResults[0].recommendedUniversityMajors.length ===
                          0) && (
                        <p className="text-slate-500">
                          Không có trường lưu trữ phù hợp trong phiên phân tích
                          này.
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => navigate("/recommend")}
                      className="mt-8 rounded-xl bg-blue-600 text-white px-6 py-3 font-semibold hover:bg-blue-700 transition shadow-md"
                    >
                      Phân tích lại kết quả mới
                    </button>
                  </div>
                </>
              ))}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default HistoryPage;
