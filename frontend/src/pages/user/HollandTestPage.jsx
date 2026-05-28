import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const HollandTestPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const userPlan = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.subscriptionPlan || "FREE";
    } catch {
      return "FREE";
    }
  })();

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
    setAnswers({
      ...answers,
      [currentQ._id]: { type: currentQ.type, score: value },
    });

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
      const formattedAnswers = Object.values(answers);
      const res = await submitHollandTest(formattedAnswers);
      const testResult = res.data;

      await saveHollandResult({
        hollandType: testResult.topType,
        topTypes: testResult.topTypes,
        hollandScores: testResult.hollandScores,
        recommendedMajors:
          testResult.recommendedMajors?.map((m) => m._id) || [],
      });

      // Redirect back to HollandPage to show results
      navigate("/holland", { state: { result: testResult } });
    } catch {
      setError("Có lỗi khi phân tích kết quả, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <p className="text-xl animate-pulse">Đang nạp bộ câu hỏi...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isStarted = questions.length > 0;
  const isFreeLimitReached = userPlan === "FREE" && currentIndex >= 15;
  const isAllAnswered =
    Object.keys(answers).length === (userPlan === "FREE" ? 15 : totalQuestions);

  return (
    <div className="min-h-screen bg-black px-6 pt-32 pb-20 text-white flex flex-col">
      <div className="mx-auto w-full max-w-7xl flex-grow flex flex-col">
        {!isStarted ? (
          <div className="text-center">
            <h1 className="text-4xl font-bold">Không tìm thấy bộ câu hỏi</h1>
          </div>
        ) : (
          <>
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

export default HollandTestPage;
