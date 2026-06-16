import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMbtiQuestions, submitMbtiTest } from "../../services/mbtiService";
import { getUser } from "../../utils/auth";

const MbtiTestPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
  const answeredCount = questions.filter((q) => answers[q._id]).length;
  const progress =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const handleSelect = (typeValue) => {
    const currentQ = questions[currentIndex];
    const newAnswers = {
      ...answers,
      [currentQ._id]: { typeValue },
    };
    setAnswers(newAnswers);
    localStorage.setItem("mbti_answers", JSON.stringify(newAnswers));

    if (currentIndex < totalQuestions - 1) {
      setTimeout(() => setCurrentIndex((curr) => curr + 1), 300);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex((curr) => curr - 1);
  };

  const handleSubmit = async () => {
    const currentAnsweredCount = questions.filter((q) => answers[q._id]).length;
    const minRequired = totalQuestions;

    if (currentAnsweredCount < minRequired) {
      const firstUnansweredIndex = questions.findIndex((q) => !answers[q._id]);
      if (firstUnansweredIndex !== -1) {
        setCurrentIndex(firstUnansweredIndex);
        setError(
          "Vui lòng hoàn thành các câu hỏi bị bỏ qua trước khi nộp bài.",
        );
      } else {
        setError(
          `Vui lòng trả lời tất cả ${minRequired} câu hỏi để xem kết quả.`,
        );
      }
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const formattedAnswers = Object.values(answers);
      const res = await submitMbtiTest(formattedAnswers);
      const testResult = res.data;

      localStorage.removeItem("mbti_answers");
      if (!getUser()) {
        localStorage.setItem(
          "guestResult",
          JSON.stringify({ type: "mbti", result: testResult }),
        );
        navigate("/register");
      } else {
        navigate("/test-result", {
          state: {
            type: "mbti",
            result: testResult,
          },
        });
      }
    } catch {
      setError("Có lỗi khi phân tích kết quả, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-bold text-slate-600 animate-pulse">
            Đang nạp bộ câu hỏi MBTI...
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isStarted = questions.length > 0;
  const isFreeLimitReached = false;
  const isAllAnswered = answeredCount === totalQuestions;

  return (
    <div className="min-h-screen bg-slate-50 px-4 md:px-6 pt-32 pb-20 text-slate-900 flex flex-col">
      <div className="mx-auto w-full max-w-4xl flex-grow flex flex-col">
        {!isStarted ? (
          <div className="text-center bg-white p-12 rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100">
            <h1 className="text-4xl font-black text-slate-900">
              Chưa có câu hỏi MBTI trong hệ thống
            </h1>
            <p className="text-slate-500 mt-4">
              Vui lòng quay lại sau hoặc liên hệ quản trị viên.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-12">
              <div className="mb-4 flex items-center justify-between text-sm font-bold uppercase tracking-widest text-slate-400">
                <span>
                  Đã trả lời: {answeredCount} / {totalQuestions}
                </span>
                <span className="text-blue-600">
                  {Math.min(100, Math.round(progress))}%
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200 shadow-inner">
                <div
                  style={{ width: `${Math.min(100, progress)}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500 ease-out shadow-lg shadow-blue-200"
                ></div>
              </div>
            </div>

            <div className="flex-grow flex flex-col justify-center mb-12 relative">
              <div className="bg-white p-10 md:p-16 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
                <div className="text-center mb-12">
                  <span className="inline-block px-4 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest mb-6">
                    Câu hỏi {currentIndex + 1}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                    {currentQuestion?.question}
                  </h2>
                </div>

                <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full">
                  <button
                    onClick={() =>
                      handleSelect(currentQuestion.optionA.typeValue)
                    }
                    className={`relative overflow-hidden group rounded-[24px] p-8 text-left border-2 transition-all duration-300
                        ${
                          answers[currentQuestion._id]?.typeValue ===
                          currentQuestion.optionA.typeValue
                            ? "bg-indigo-50 border-indigo-500 text-indigo-900 shadow-lg shadow-indigo-100"
                            : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-100"
                        }
                      `}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full border-2 mr-6 flex-shrink-0 flex items-center justify-center transition-all
                          ${
                            answers[currentQuestion._id]?.typeValue ===
                            currentQuestion.optionA.typeValue
                              ? "border-indigo-500 bg-indigo-600 scale-110"
                              : "border-slate-300 group-hover:border-indigo-400"
                          }`}
                      >
                        {answers[currentQuestion._id]?.typeValue ===
                          currentQuestion.optionA.typeValue && (
                          <div className="w-3 h-3 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="text-xl font-bold">
                        {currentQuestion.optionA.text}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      handleSelect(currentQuestion.optionB.typeValue)
                    }
                    className={`relative overflow-hidden group rounded-[24px] p-8 text-left border-2 transition-all duration-300
                        ${
                          answers[currentQuestion._id]?.typeValue ===
                          currentQuestion.optionB.typeValue
                            ? "bg-indigo-50 border-indigo-500 text-indigo-900 shadow-lg shadow-indigo-100"
                            : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-100"
                        }
                      `}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full border-2 mr-6 flex-shrink-0 flex items-center justify-center transition-all
                          ${
                            answers[currentQuestion._id]?.typeValue ===
                            currentQuestion.optionB.typeValue
                              ? "border-indigo-500 bg-indigo-600 scale-110"
                              : "border-slate-300 group-hover:border-indigo-400"
                          }`}
                      >
                        {answers[currentQuestion._id]?.typeValue ===
                          currentQuestion.optionB.typeValue && (
                          <div className="w-3 h-3 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="text-xl font-bold">
                        {currentQuestion.optionB.text}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-8 rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-red-600 font-bold animate-shake">
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 pt-8">
              <button
                onClick={handleBack}
                disabled={currentIndex === 0}
                className="px-6 md:px-8 py-4 rounded-full bg-white text-slate-600 font-bold border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm md:text-base"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Câu trước
              </button>

              {isAllAnswered ||
              isFreeLimitReached ||
              currentIndex === totalQuestions - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-8 md:px-10 py-4 rounded-full bg-indigo-600 text-white font-black text-base md:text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50"
                >
                  {submitting ? "Đang xử lý..." : "Xem Kết Quả"}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex((curr) => curr + 1)}
                  className="px-6 md:px-8 py-4 rounded-full bg-white text-indigo-600 font-bold border border-indigo-100 hover:bg-indigo-50 transition-all flex items-center gap-2 text-sm md:text-base"
                >
                  Tiếp theo
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
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
