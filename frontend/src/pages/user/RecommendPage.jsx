import { useState } from "react";
import { recommendBySubjects } from "../../services/recommendService";
import { useNavigate } from "react-router-dom";

const RecommendPage = () => {
  const [scores, setScores] = useState({
    math: "",
    literature: "",
    english: "",
    physics: "",
    chemistry: "",
    biology: "",
    history: "",
    geography: "",
    civicEducation: ""
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleScoreChange = (e) => {
    const { name, value } = e.target;
    // Allow empty string or numbers 0-10
    if (value === "" || (Number(value) >= 0 && Number(value) <= 10)) {
      setScores(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRecommend = async () => {
    try {
      setError("");
      setResult(null);

      // Check if at least 3 subjects have scores
      const validScores = Object.values(scores).filter(s => s !== "" && !isNaN(Number(s)));
      if (validScores.length < 3) {
        return setError("Vui lòng nhập tối thiểu 3 môn học để tính tổ hợp.");
      }

      setLoading(true);

      // Convert format for API
      const formattedScores = {};
      Object.keys(scores).forEach(key => {
        if (scores[key] !== "") {
          formattedScores[key] = Number(scores[key]);
        }
      });

      const response = await recommendBySubjects(formattedScores);
      setResult(response.data);
    } catch (error) {
      setError("Có lỗi xảy ra, vui lòng thử lại sau.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const subjectInputs = [
    { name: "math", label: "Toán học" },
    { name: "literature", label: "Ngữ văn" },
    { name: "english", label: "Tiếng Anh" },
    { name: "physics", label: "Vật lý" },
    { name: "chemistry", label: "Hóa học" },
    { name: "biology", label: "Sinh học" },
    { name: "history", label: "Lịch sử" },
    { name: "geography", label: "Địa lý" },
    { name: "civicEducation", label: "GDCD" },
  ];

  return (
    <div className="min-h-screen bg-black px-6 py-20 text-white">
      {/* Hero */}
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="hover:text-purple-400 transition">← Trở về</button>
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-purple-400">
            Phân Tích Tổ Hợp Xét Tuyển
          </p>
        </div>

        <div className="text-center mb-12">
          <h1 className="mb-6 text-5xl font-bold leading-tight bg-gradient-to-r text-transparent bg-clip-text pb-2 from-white to-gray-400">
            Tra Cứu Khả Năng Đỗ
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Nhập điểm trung bình môn của bạn để hệ thống tính toán tổ hợp và đề xuất các trường, ngành phù hợp.
          </p>
        </div>

        {/* Input Section */}
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8 lg:p-12 mb-16 shadow-2xl">
          <h2 className="text-2xl font-semibold mb-8 border-b border-white/10 pb-4">Nhập Điểm Học Tập</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
            {subjectInputs.map((subj) => (
              <div key={subj.name}>
                <label className="mb-2 block text-sm text-gray-300 font-medium">
                  {subj.label}
                </label>
                <input
                  type="number"
                  name={subj.name}
                  value={scores[subj.name]}
                  onChange={handleScoreChange}
                  min="0" max="10" step="0.1"
                  placeholder="0.0"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition focus:border-purple-500 focus:bg-white/5 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            ))}
          </div>
          
          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}
          
          <button
            onClick={handleRecommend}
            disabled={loading}
            className="w-full md:w-1/2 mx-auto block rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 py-4 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Đang Phân Tích..." : "Xem Phân Tích & Gợi Ý"}
          </button>
        </div>

        {/* Results Level */}
        {result && (
          <div className="animate-fade-in-up">
            {/* Top Combinations */}
            <div className="mb-16">
              <h3 className="text-2xl font-bold mb-6">Tổ Hợp Điểm Tốt Nhất</h3>
              <div className="flex flex-wrap gap-4">
                {result.combinations?.slice(0, 5).map((combo) => (
                  <div key={combo.name} className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-center flex-1 min-w-[150px]">
                    <div className="text-gray-400 text-sm mb-1">{combo.name}</div>
                    <div className="text-3xl font-bold text-purple-400">{combo.score.toFixed(1)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* University Recommendations */}
            <h3 className="text-2xl font-bold mb-6">Trường Đại Học & Ngành Đề Xuất</h3>
            {result.recommendations?.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {result.recommendations.map((item, idx) => (
                  <div
                    key={`${item._id}_${idx}`}
                    className={`rounded-3xl border border-white/10 p-6 shadow-xl
                      ${item.level === "SAFE" ? "bg-green-900/10 hover:border-green-500/50" : "bg-orange-900/10 hover:border-orange-500/50"}
                      transition-all
                    `}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-bold">{item.major?.name || "Ngành chưa cập nhật"}</h4>
                        <p className="text-gray-300 font-medium text-sm mt-1">{item.university?.name || "Trường chưa cập nhật"}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap
                        ${item.level === "SAFE" ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"}
                      `}>
                        {item.level === "SAFE" ? "An Toàn" : "Thử Thách"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                        Tổ hợp: <span className="text-purple-300 font-bold">{item.matchCombination}</span>
                      </div>
                      <div className="bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                        Điểm chuẩn: <span className="font-bold">{item.admissionScore}</span>
                      </div>
                      <div className="bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                        <span className={item.userScoreForCombination >= item.admissionScore ? "text-green-400" : "text-orange-400"}>
                          Điểm của bạn: <span className="font-bold">{item.userScoreForCombination.toFixed(1)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center rounded-3xl border border-white/10 bg-white/5 p-12">
                <p className="text-gray-400">Rất tiếc bộ máy AI chưa tìm thấy dữ liệu trường phù hợp với mức điểm của bạn.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendPage;
