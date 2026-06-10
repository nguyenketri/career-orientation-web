import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { hollandMaps } from "../../utils/hollandMap";
import { mbtiMaps } from "../../utils/mbtiMap";
import { getUser } from "../../utils/auth";

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

const ResultDetailPage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result);

  useEffect(() => {
    if (location.state?.result) {
      return;
    }

    const fetchResult = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const endpoint = type === "holland" ? "holland-results" : type;
        const url = `/api/${endpoint}/${id}`;
        console.log("Fetching result from:", url);
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Server responded with status ${res.status}`);
        }

        const json = await res.json();
        setResult(json.data);
      } catch (err) {
        console.error("Error fetching result detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [type, id, location.state]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">
            Không tìm thấy kết quả trắc nghiệm.
          </p>
          <button
            onClick={() => navigate("/history")}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            Quay lại lịch sử
          </button>
        </div>
      </div>
    );
  }

  const getHollandChartData = () => {
    return Object.entries(result.hollandScores || {}).map(([type, score]) => ({
      subject: hollandMaps[type]?.name || type,
      score: score,
      fullMark: 300,
    }));
  };

  const getTop3Holland = () => {
    return Object.entries(result.hollandScores || {})
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
    const scores = result.scores || {};
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
              Chi Tiết Kết Quả {type === "holland" ? "Holland" : "MBTI"}
            </h1>
            <p className="text-slate-500 text-sm">
              Phân tích chi tiết kết quả trắc nghiệm của bạn
            </p>
          </div>
          <button
            onClick={() => navigate("/history")}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            ← Quay lại lịch sử
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          {type === "holland" ? (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                  Top 3 Nhóm Mã
                </h3>
                <div className="space-y-4">
                  {getTop3Holland().map((item, idx) => (
                    <div
                      key={`${item.type}-${idx}`}
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
          ) : (
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
                    {result?.mbtiType}
                  </h3>
                  <h4 className="text-xl font-bold text-blue-400 mb-4">
                    {mbtiMaps[result?.mbtiType]?.name}
                  </h4>
                  <p className="text-slate-300 leading-relaxed opacity-90">
                    {mbtiMaps[result?.mbtiType]?.desc}
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
              </div>
            </div>
          )}
        </motion.div>

        {getUser()?.subscriptionPlan !== "FREE" && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-slate-900 mb-8 text-center md:text-left">
              Gợi Ý Ngành & Trường Phù Hợp
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {result?.recommendedMajors?.map((major, idx) => (
                <RecommendationCard
                  key={`${major._id}-${idx}`}
                  major={major}
                  matchPercent={90 + idx}
                  navigate={navigate}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultDetailPage;
