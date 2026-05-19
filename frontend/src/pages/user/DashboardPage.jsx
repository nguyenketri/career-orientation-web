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

const DashboardPage = () => {
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
          getScoreAnalysisHistory().catch(() => ({ data: [] }))
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
    <div className="min-h-screen bg-black text-white px-6 py-20 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-6xl"
      >
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white transition"
          >
            ← Trở về
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r text-transparent bg-clip-text pb-2 from-white to-gray-400">Dashboard</h1>
        </div>
        {/* Loading */}
        {loading && <SkeletonLoader type="card" count={3} />}
        {!loading && (
          <>
            {/* Tabs */}
            <div className="flex space-x-2 border-b border-white/10 mb-8 pb-4 overflow-x-auto">
              <button 
                onClick={() => setActiveTab("holland")} 
                className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${activeTab === "holland" ? "bg-purple-600 font-semibold" : "bg-white/5 hover:bg-white/10 text-gray-300"}`}
              >
                Holland Profile
              </button>
              <button 
                onClick={() => setActiveTab("mbti")} 
                className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${activeTab === "mbti" ? "bg-indigo-600 font-semibold" : "bg-white/5 hover:bg-white/10 text-gray-300"}`}
              >
                MBTI Profile
              </button>
              <button 
                onClick={() => setActiveTab("academic")} 
                className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${activeTab === "academic" ? "bg-pink-600 font-semibold" : "bg-white/5 hover:bg-white/10 text-gray-300"}`}
              >
                Học Vấn & Gợi Ý
              </button>
            </div>

            {/* HOLLAND TAB */}
            {activeTab === "holland" && (
              hollandResults.length === 0 ? (
                <div className="text-center mt-20 border border-white/10 rounded-3xl py-20 bg-white/5">
                  <h2 className="text-2xl font-bold mb-2">Chưa có kết quả Holland</h2>
                  <p className="text-gray-400 mb-6">Hãy làm bài test Holland đầu tiên của bạn</p>
                  <button onClick={() => navigate("/holland")} className="rounded-xl bg-purple-500 px-6 py-3 font-semibold hover:bg-purple-600">Bắt Ðầu Test</button>
                </div>
              ) : (
                <>
                  <div className="mb-12 rounded-3xl bg-gradient-to-br from-purple-600/20 via-pink-500/10 to-transparent p-10 backdrop-blur-md border border-white/10">
                    <p className="text-sm uppercase tracking-widest text-purple-300">Nhóm Tính Cách Nổi Bật</p>
                    <h2 className="mt-2 text-5xl font-bold">
                      <span className="text-purple-400">{hollandMaps[latestHolland.hollandType]?.name || latestHolland.hollandType}</span>
                    </h2>
                    <p className="mt-4 max-w-xl text-gray-300">{hollandMaps[latestHolland.hollandType]?.desc}</p>
                  </div>

                  <div className="mb-12 rounded-3xl bg-white/5 p-8 border border-white/10 backdrop-blur-sm">
                    <h3 className="mb-6 text-2xl font-semibold">Bản Biểu Điểm (Personality Breakdown)</h3>
                    <HollandChart scores={latestHolland.hollandScores} />
                  </div>

                  <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(latestHolland.topTypes?.length ? latestHolland.topTypes : Object.entries(latestHolland.hollandScores).sort((a,b)=>b[1]-a[1]).map(x=>x[0]).slice(0,3)).map((type, index) => {
                      const score = latestHolland.hollandScores[type];
                      return (
                        <div key={type} className={`rounded-2xl p-6 border border-white/10 backdrop-blur-sm ${index === 0 ? "bg-purple-500/20 shadow-lg" : "bg-white/5"}`}>
                          <h4 className="text-lg font-bold">{hollandMaps[type]?.name || type}</h4>
                          <p className="text-sm text-gray-400">Score: {score}</p>
                          {index === 0 && <span className="mt-2 inline-block text-xs text-purple-300">Đặc Điểm Trội Nhất</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <h3 className="mb-6 text-2xl font-semibold">Lịch Sử Test Holland</h3>
                    <div className="space-y-4">
                      {hollandResults.map((r) => (
                        <div key={r._id} className="flex items-center justify-between rounded-xl bg-white/5 p-5 border border-white/10">
                          <div>
                            <p className="font-semibold">{hollandMaps[r.hollandType]?.name || r.hollandType}</p>
                            <p className="text-sm text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className="text-lg font-bold text-purple-400">{r.hollandType}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )
            )}

            {/* MBTI TAB */}
            {activeTab === "mbti" && (
              mbtiResults.length === 0 ? (
                <div className="text-center mt-20 border border-white/10 rounded-3xl py-20 bg-white/5">
                  <h2 className="text-2xl font-bold mb-2">Chưa có kết quả MBTI</h2>
                  <p className="text-gray-400 mb-6">Hãy làm bài test MBTI đầu tiên của bạn</p>
                  <button onClick={() => navigate("/mbti")} className="rounded-xl bg-indigo-500 px-6 py-3 font-semibold hover:bg-indigo-600">Bắt Ðầu Test</button>
                </div>
              ) : (
                <>
                  <div className="mb-12 rounded-3xl bg-gradient-to-br from-indigo-600/20 via-blue-500/10 to-transparent p-10 backdrop-blur-md border border-white/10">
                    <p className="text-sm uppercase tracking-widest text-indigo-300">Loại Hình MBTI</p>
                    <h2 className="mt-2 text-5xl font-bold">
                      <span className="text-indigo-400">{mbtiResults[0].mbtiType}</span>
                    </h2>
                    <h3 className="mt-2 text-2xl font-bold">{mbtiMaps[mbtiResults[0].mbtiType]?.name}</h3>
                    <p className="mt-4 max-w-xl text-gray-300">{mbtiMaps[mbtiResults[0].mbtiType]?.desc}</p>
                  </div>
                  
                  <div>
                    <h3 className="mb-6 text-2xl font-semibold">Lịch Sử Test MBTI</h3>
                    <div className="space-y-4">
                      {mbtiResults.map((r) => (
                        <div key={r._id} className="flex items-center justify-between rounded-xl bg-white/5 p-5 border border-white/10">
                          <div>
                            <p className="font-semibold">{mbtiMaps[r.mbtiType]?.name || r.mbtiType}</p>
                            <p className="text-sm text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className="text-lg font-bold text-indigo-400">{r.mbtiType}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )
            )}

            {/* ACADEMIC TAB */}
            {activeTab === "academic" && (
              scoreResults.length === 0 ? (
                <div className="text-center mt-20 border border-white/10 rounded-3xl py-20 bg-white/5">
                  <h2 className="text-2xl font-bold mb-2">Chưa phân tích kết quả học tập</h2>
                  <p className="text-gray-400 mb-6">Hãy phân tích điểm số của bạn để tìm tổ hợp và trường phù hợp</p>
                  <button onClick={() => navigate("/recommend")} className="rounded-xl bg-pink-500 px-6 py-3 font-semibold hover:bg-pink-600">Bắt Ðầu Nhập Điểm</button>
                </div>
              ) : (
                <>
                  <div className="mb-12 rounded-3xl bg-white/5 p-8 border border-white/10">
                    <h3 className="text-2xl font-semibold border-b border-white/10 pb-4 mb-6">Lịch Sử Dự Đoán Trường & Ngành (Gần Nhất)</h3>
                    <p className="text-gray-400 mb-6">Hệ thống ghi nhận vào ngày: {new Date(scoreResults[0].createdAt).toLocaleString()}</p>
                    
                    <h4 className="text-lg font-bold mb-4 text-pink-300">Top Tổ Hợp Môn</h4>
                    <div className="flex gap-4 mb-8 flex-wrap">
                       {scoreResults[0].topCombinations?.map(combo => (
                          <div key={combo._id || combo.combination} className="px-5 py-3 bg-white/5 border border-pink-500/30 rounded-xl">
                             <div className="text-pink-400 text-sm">{combo.combination}</div>
                             <div className="text-xl font-bold">{combo.totalScore.toFixed(1)}</div>
                          </div>
                       ))}
                    </div>

                    <h4 className="text-lg font-bold mb-4 text-pink-300">Ngành Học Lưu Trữ</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                       {scoreResults[0].recommendedUniversityMajors?.map(um => (
                          <div key={um._id} className="bg-black/40 border border-white/10 p-4 rounded-xl">
                            <p className="font-bold">{um.major?.name}</p>
                            <p className="text-sm text-gray-400">{um.university?.name}</p>
                          </div>
                       ))}
                       {(!scoreResults[0].recommendedUniversityMajors || scoreResults[0].recommendedUniversityMajors.length === 0) && (
                          <p className="text-gray-500">Không có trường lưu trữ phù hợp trong phiên phân tích này.</p>
                       )}
                    </div>
                    
                    <button onClick={() => navigate("/recommend")} className="mt-8 rounded-xl bg-white/10 px-6 py-3 font-semibold hover:bg-white/20 transition">Phân tích lại kết quả mới</button>
                  </div>
                </>
              )
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default DashboardPage;
