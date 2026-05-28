import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMbtiQuestions, submitMbtiTest } from "../../services/mbtiService";

const MbtiTestPage = () => {
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
        const res = await getMbtiQuestions();
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

  const handleSelect = (typeValue) => {
    const currentQ = questions[currentIndex];
    setAnswers({
      ...answers,
      [currentQ._id]: { typeValue },
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
      setError(
        `Vui lòng trả lời ít nhất ${minRequired} câu hỏi để xem kết quả.`,
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const formattedAnswers = Object.values(answers);
      const res = await submitMbtiTest(formattedAnswers);

      // Redirect back to MbtiPage to show results
      navigate("/mbti", { state: { result: res.data } });
    } catch {
      setError("Có lỗi khi phân tích kết quả, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <p className="text-xl animate-pulse">Đang nạp bộ câu hỏi MBTI...</p>
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
            <h1 className="text-4xl font-bold text-gray-400">
              Chưa có câu hỏi MBTI trong hệ thống
            </h1>
          </div>
        ) : (
          <>
            <div className="mb-16">
              <div className="mb-3 flex items-center justify-between text-sm text-gray-400 font-medium">
                <span>
                  Câu {currentIndex + 1} / {totalQuestions}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  style={{ width: `${progress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                ></div>
              </div>
            </div>

            <div className="flex-grow flex flex-col justify-center mb-12 relative">
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
                    className="px-10 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
                  >
                    {submitting ? "Đang xử lý..." : "Xem Kết Quả Ngay"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-normal leading-tight text-white/90">
                      {currentQuestion?.question}
                    </h2>
                  </div>

                  <div className="flex flex-col gap-4 max-w-xl mx-auto w-full">
                    <button
                      onClick={() =>
                        handleSelect(currentQuestion.optionA.typeValue)
                      }
                      className={`relative overflow-hidden group rounded-2xl p-6 text-left border transition-all duration-300
                        ${
                          answers[currentQuestion._id]?.typeValue ===
                          currentQuestion.optionA.typeValue
                            ? "bg-indigo-600/20 border-indigo-500 text-white"
                            : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
                        }
                      `}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full border-2 mr-4 flex-shrink-0 flex items-center justify-center transition-colors
                          ${
                            answers[currentQuestion._id]?.typeValue ===
                            currentQuestion.optionA.typeValue
                              ? "border-indigo-400 bg-indigo-500"
                              : "border-gray-500 group-hover:border-gray-400"
                          }`}
                        >
                          {answers[currentQuestion._id]?.typeValue ===
                            currentQuestion.optionA.typeValue && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="text-lg">
                          {currentQuestion.optionA.text}
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() =>
                        handleSelect(currentQuestion.optionB.typeValue)
                      }
                      className={`relative overflow-hidden group rounded-2xl p-6 text-left border transition-all duration-300
                        ${
                          answers[currentQuestion._id]?.typeValue ===
                          currentQuestion.optionB.typeValue
                            ? "bg-indigo-600/20 border-indigo-500 text-white"
                            : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
                        }
                      `}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full border-2 mr-4 flex-shrink-0 flex items-center justify-center transition-colors
                          ${
                            answers[currentQuestion._id]?.typeValue ===
                            currentQuestion.optionB.typeValue
                              ? "border-indigo-400 bg-indigo-500"
                              : "border-gray-500 group-hover:border-gray-400"
                          }`}
                        >
                          {answers[currentQuestion._id]?.typeValue ===
                            currentQuestion.optionB.typeValue && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="text-lg">
                          {currentQuestion.optionB.text}
                        </span>
                      </div>
                    </button>
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
                  className="px-8 py-3 rounded-full bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition shadow-lg shadow-indigo-500/30 disabled:opacity-50"
                >
                  {submitting ? "Đang xử lý..." : "Xem Kết Quả"}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex((curr) => curr + 1)}
                  disabled={
                    currentIndex === totalQuestions - 1 ||
                    !answers[currentQuestion._id]
                  }
                  className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  Tiếp theo <span className="text-xs">→</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MbtiTestPage;
