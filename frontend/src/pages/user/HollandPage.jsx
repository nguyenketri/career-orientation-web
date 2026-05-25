import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { hollandMaps } from "../../utils/hollandMap";
import {
  getHollandQuestions,
  submitHollandTest,
  saveHollandResult,
} from "../../services/hollandService";

const LIKERT_OPTIONS = [
  { value: 1, label: "Rất không đúng" },
  { value: 2, label: "Không đúng" },
  { value: 3, label: "Phân vân" },
  { value: 4, label: "Khá đúng" },
  { value: 5, label: "Rất đúng" },
];

const HollandPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Get user subscription plan
  const userPlan = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.subscriptionPlan || "FREE";
    } catch {
      return "FREE";
    }
  })();

  // Fetch questions on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await getHollandQuestions();
        if (res.data) setQuestions(res.data);
      } catch {
        setError("Không thể tải hệ thống câu hỏi, vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const totalQuestions = questions.length;
  const progress =
    totalQuestions > 0 ? (currentIndex / totalQuestions) * 100 : 0;

  const handleSelect = (value) => {
    const currentQ = questions[currentIndex];

    // Save answer
    setAnswers({
      ...answers,
      [currentQ._id]: { type: currentQ.type, score: value },
    });

    // Auto-next or suggest submit
    if (currentIndex < totalQuestions - 1) {
      setTimeout(() => setCurrentIndex((curr) => curr + 1), 300);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex((curr) => curr - 1);
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    const minRequired = userPlan === "FREE" ? 15 : totalQuestions;

    if (answeredCount < minRequired) {
      setError(`Vui lòng trả lời ít nhất ${minRequired} câu hỏi.`);
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // format answers for API
      const formattedAnswers = Object.values(answers);

      // Call analyze API
      const res = await submitHollandTest(formattedAnswers);
      const testResult = res.data;

      // Set to display
      setResult(testResult);

      // Save to history automatically
      await saveHollandResult({
        hollandType: testResult.topType,
        topTypes: testResult.topTypes,
        hollandScores: testResult.hollandScores,
        recommendedMajors:
          testResult.recommendedMajors?.map((m) => m._id) || [],
      });
    } catch {
      setError("Có lỗi khi phân tích kết quả, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
    setCurrentIndex(0);
    setError("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <p className="text-xl animate-pulse">Đang nạp bộ câu hỏi...</p>
      </div>
    );
  }

  // RESULT VIEW
  if (result) {
    return (
      <div className="min-h-screen bg-black px-6 py-20 text-white">
        {userPlan === "FREE" && (
          <div className="mx-auto max-w-4xl mb-6 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-center">
            <p className="text-purple-300 text-sm">
              Bạn đang xem kết quả từ <b>Bản rút gọn (15 câu)</b>. Nâng cấp lên
              gói <b>Trả Phí</b> hoặc <b>Cao Cấp</b> để có kết quả chính xác hơn
              với bộ câu hỏi đầy đủ!
            </p>
            <button
              onClick={() => navigate("/pricing")}
              className="text-white font-bold text-sm underline mt-2 hover:text-purple-400"
            >
              Nâng cấp ngay →
            </button>
          </div>
        )}
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex justify-between">
            <button
              onClick={() => navigate(-1)}
              className="hover:text-purple-400 transition"
            >
              ← Back to Dashboard
            </button>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">Kết Quả Holland Của Bạn</h1>
            <p className="text-gray-400 text-lg">
              Hệ thống đã phân tích và lưu kết quả vào hồ sơ của bạn.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Top 3 Types Box */}
            <div className="rounded-3xl border border-purple-500/20 bg-purple-500/10 p-8">
              <h2 className="text-xl text-purple-300 uppercase tracking-widest mb-6">
                Đặc Trưng Nổi Bật Nhất
              </h2>

              {result.topTypes.map((type, idx) => (
                <div key={type} className="mb-6 last:mb-0">
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="text-3xl font-bold">
                      <span className="text-purple-400 mr-2">
                        Top {idx + 1}:
                      </span>
                      {hollandMaps[type]?.name || type}
                    </h3>
                    <span className="text-gray-400 text-sm">
                      Điểm: {result.hollandScores[type]}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    {hollandMaps[type]?.desc}
                  </p>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{
                        width: `${(result.hollandScores[type] / (totalQuestions * 5)) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Radar/Scores (simplified as text for now) */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-xl text-gray-300 uppercase tracking-widest mb-6">
                Điểm Các Nhóm
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(result.hollandScores).map(([t, score]) => (
                  <div
                    key={t}
                    className="bg-white/5 p-4 rounded-xl flex items-center justify-between"
                  >
                    <span className="font-bold text-lg">{t}</span>
                    <span className="text-purple-400">{score}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleRetake}
                className="mt-8 w-full rounded-2xl border border-white/10 px-6 py-4 text-white transition hover:bg-white hover:text-black font-semibold"
              >
                Làm Lại Bài Test
              </button>
            </div>
          </div>

          {/* Recommended Majors */}
          {result.recommendedMajors?.length > 0 && (
            <div>
              <h3 className="mb-6 text-3xl font-bold">
                Ngành Học Phù Hợp Đề Xuất
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {result.recommendedMajors.map((major) => (
                  <div
                    key={major._id}
                    className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-purple-500/50"
                  >
                    <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
                      <h4 className="text-xl font-bold">{major.name}</h4>
                      <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-300 font-medium">
                        Điểm chuẩn: {major.benchmarkScore}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{major.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {major.hollandTypes?.map((t) => (
                        <span
                          key={t}
                          className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // WIZARD VIEW
  const currentQuestion = questions[currentIndex];
  const isStarted = questions.length > 0;
  const isFreeLimitReached = userPlan === "FREE" && currentIndex >= 15;
  const isAllAnswered =
    Object.keys(answers).length === (userPlan === "FREE" ? 15 : totalQuestions);

  return (
    <div className="min-h-screen bg-black px-6 py-20 text-white flex flex-col">
      <div className="mx-auto w-full max-w-3xl flex-grow flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => navigate(-1)}
            className="hover:text-purple-400"
          >
            ← Trở về
          </button>
          <p className="text-sm uppercase tracking-[0.3em] text-purple-400">
            Holland Test
          </p>
        </div>

        {!isStarted ? (
          <div className="text-center">
            <h1 className="text-4xl font-bold">Không tìm thấy bộ câu hỏi</h1>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="mb-16">
              <div className="mb-3 flex items-center justify-between text-sm text-gray-400 font-medium">
                <span>
                  Câu hỏi {currentIndex + 1} / {totalQuestions}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  style={{ width: `${progress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-300"
                ></div>
              </div>
            </div>

            {/* Question Box */}
            <div className="flex-grow flex flex-col justify-center mb-12">
              {isFreeLimitReached ? (
                <div className="text-center p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <h2 className="text-3xl font-bold mb-4 text-purple-400">
                    Bạn đã hoàn thành 15 câu hỏi thử nghiệm!
                  </h2>
                  <p className="text-gray-300 mb-8 text-lg">
                    Gói Miễn Phí cho phép bạn xem kết quả sơ bộ sau 15 câu hỏi.
                    Để có kết quả chính xác nhất, hãy nâng cấp lên gói Trả Phí.
                  </p>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-10 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
                  >
                    {submitting ? "Đang phân tích..." : "Xem Kết Quả Ngay"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-semibold leading-relaxed">
                      "{currentQuestion?.content}"
                    </h2>
                  </div>

                  {/* Likert Scale */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {LIKERT_OPTIONS.map((option) => {
                      const isSelected =
                        answers[currentQuestion._id]?.score === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleSelect(option.value)}
                          className={`flex-1 rounded-2xl py-4 px-2 transition-all duration-200 border border-transparent 
                        ${
                          isSelected
                            ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25 scale-105"
                            : "bg-white/5 hover:bg-white/10 text-gray-300 hover:border-white/20"
                        }
                      `}
                        >
                          <div className="text-lg font-bold mb-1">
                            {option.value}
                          </div>
                          <div className="text-xs">{option.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center text-red-400">
                {error}
              </div>
            )}

            {/* Footer Navigation */}
            <div className="flex items-center justify-between border-t border-white/10 pt-6">
              <button
                onClick={handleBack}
                disabled={currentIndex === 0}
                className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Câu trước
              </button>

              {isAllAnswered || isFreeLimitReached ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-8 py-3 rounded-full bg-purple-500 text-white font-bold hover:bg-purple-600 transition shadow-lg shadow-purple-500/30 disabled:opacity-50"
                >
                  {submitting ? "Đang phân tích..." : "Xem Kết Quả"}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex((curr) => curr + 1)}
                  disabled={currentIndex === totalQuestions - 1}
                  className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  Bỏ qua <span className="text-xs">→</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HollandPage;
