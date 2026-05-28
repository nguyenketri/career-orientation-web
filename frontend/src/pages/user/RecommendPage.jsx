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
    civicEducation: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleScoreChange = (e) => {
    const { name, value } = e.target;
    // Allow empty string or numbers 0-10
    if (value === "" || (Number(value) >= 0 && Number(value) <= 10)) {
      setScores((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRecommend = async () => {
    try {
      setError("");
      setResult(null);

      // Check if at least 3 subjects have scores
      const validScores = Object.values(scores).filter(
        (s) => s !== "" && !isNaN(Number(s)),
      );
      if (validScores.length < 3) {
        return setError("Vui lòng nhập tối thiểu 3 môn học để tính tổ hợp.");
      }

      setLoading(true);

      // Convert format for API
      const formattedScores = {};
      Object.keys(scores).forEach((key) => {
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
    <div className="min-h-screen bg-slate-50 px-6 pt-32 pb-20 text-slate-900">
      {/* Hero */}
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-6 text-slate-900">
            Gợi Ý Ngành Học & Trường
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-slate-600 leading-relaxed">
            Nhập điểm trung bình môn của bạn để hệ thống AI tính toán tổ hợp và
            đề xuất các trường, ngành phù hợp nhất với năng lực học tập.
          </p>
        </div>

        {/* Input Section */}
        <div className="mx-auto max-w-7xl rounded-[40px] border border-slate-100 bg-white p-8 lg:p-16 mb-16 shadow-2xl shadow-blue-100/50">
          <h2 className="text-3xl font-black mb-10 border-b border-slate-100 pb-6 text-slate-900">
            Nhập Điểm Học Tập
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
            {subjectInputs.map((subj) => (
              <div key={subj.name}>
                <label className="mb-3 block text-sm text-slate-700 font-bold uppercase tracking-wider">
                  {subj.label}
                </label>
                <input
                  type="number"
                  name={subj.name}
                  value={scores[subj.name]}
                  onChange={handleScoreChange}
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="0.0"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-bold text-lg"
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-8 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          <button
            onClick={handleRecommend}
            disabled={loading}
            className="w-full md:w-1/2 mx-auto block rounded-full bg-blue-600 py-5 font-black text-white text-xl transition hover:bg-blue-700 disabled:opacity-50 shadow-xl shadow-blue-200 hover:scale-105"
          >
            {loading ? "Đang Phân Tích..." : "Xem Phân Tích & Gợi Ý"}
          </button>
        </div>

        {/* Results Level */}
        {result && (
          <div className="animate-fade-in-up">
            {/* Top Combinations */}
            <div className="mb-20">
              <h3 className="text-3xl font-black mb-8 text-slate-900">
                Tổ Hợp Điểm Tốt Nhất
              </h3>
              <div className="flex flex-wrap gap-6">
                {result.combinations?.slice(0, 5).map((combo) => (
                  <div
                    key={combo.name}
                    className="px-8 py-6 bg-white border border-slate-100 rounded-3xl text-center flex-1 min-w-[180px] shadow-lg shadow-slate-100"
                  >
                    <div className="text-slate-500 font-bold text-sm mb-2 uppercase tracking-widest">
                      {combo.name}
                    </div>
                    <div className="text-4xl font-black text-blue-600">
                      {combo.score.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* University Recommendations */}
            <h3 className="text-3xl font-black mb-8 text-slate-900">
              Trường Đại Học & Ngành Đề Xuất
            </h3>
            {result.recommendations?.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2">
                {result.recommendations.map((item, idx) => (
                  <div
                    key={`${item._id}_${idx}`}
                    className={`rounded-[32px] border p-8 shadow-xl transition-all hover:-translate-y-1
                      ${
                        item.level === "SAFE"
                          ? "bg-green-50 border-green-100 hover:border-green-300 shadow-green-100/50"
                          : "bg-orange-50 border-orange-100 hover:border-orange-300 shadow-orange-100/50"
                      }
                    `}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-2xl font-black text-slate-900 leading-tight">
                          {item.major?.name || "Ngành chưa cập nhật"}
                        </h4>
                        <p className="text-slate-600 font-bold text-lg mt-2">
                          {item.university?.name || "Trường chưa cập nhật"}
                        </p>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap uppercase tracking-widest
                        ${item.level === "SAFE" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}
                      `}
                      >
                        {item.level === "SAFE" ? "An Toàn" : "Thử Thách"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="bg-white/60 px-4 py-2 rounded-xl border border-white/20 shadow-sm">
                        <span className="text-slate-500 text-xs font-bold uppercase mr-2">
                          Tổ hợp:
                        </span>
                        <span className="text-blue-600 font-black">
                          {item.matchCombination}
                        </span>
                      </div>
                      <div className="bg-white/60 px-4 py-2 rounded-xl border border-white/20 shadow-sm">
                        <span className="text-slate-500 text-xs font-bold uppercase mr-2">
                          Điểm chuẩn:
                        </span>
                        <span className="font-black text-slate-900">
                          {item.admissionScore}
                        </span>
                      </div>
                      <div className="bg-white/60 px-4 py-2 rounded-xl border border-white/20 shadow-sm">
                        <span
                          className={`text-xs font-bold uppercase mr-2 ${
                            item.userScoreForCombination >= item.admissionScore
                              ? "text-green-600"
                              : "text-orange-600"
                          }`}
                        >
                          Điểm của bạn:
                        </span>
                        <span
                          className={`font-black ${
                            item.userScoreForCombination >= item.admissionScore
                              ? "text-green-700"
                              : "text-orange-700"
                          }`}
                        >
                          {item.userScoreForCombination.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center rounded-[40px] border border-slate-100 bg-white p-20 shadow-xl shadow-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-slate-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-slate-500 text-xl font-medium">
                  Rất tiếc bộ máy AI chưa tìm thấy dữ liệu trường phù hợp với
                  mức điểm của bạn.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendPage;
