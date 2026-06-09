import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getHollandQuestions,
  submitHollandTest,
} from "../../services/hollandService";

const LIKERT_OPTIONS = [
  { value: 1, label: "Rất không đúng" },
  { value: 2, label: "Không đúng" },
  { value: 3, label: "Trung tính" },
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
    const minRequired = totalQuestions;

    if (answeredCount < minRequired) {
      setError(`Vui lòng trả lời tất cả ${minRequired} câu hỏi.`);
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const formattedAnswers = Object.values(answers);
      const res = await submitHollandTest(formattedAnswers);
      const testResult = res.data;

      // Redirect to analysis result page with the result data in state
      localStorage.setItem(
        "guestResult",
        JSON.stringify({ type: "holland", result: testResult }),
      );
      navigate("/test-result", {
        state: {
          type: "holland",
          result: testResult,
        },
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Có lỗi khi phân tích kết quả, vui lòng thử lại.";
      setError(errorMessage);
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
            Đang nạp bộ câu hỏi...
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isStarted = questions.length > 0;
  const isAllAnswered = Object.keys(answers).length === totalQuestions;

  return (
    <div className="min-h-screen bg-slate-50 px-4 md:px-6 pt-32 pb-20 text-slate-900 flex flex-col">
      <div className="mx-auto w-full max-w-4xl flex-grow flex flex-col">
        {!isStarted ? (
          <div className="text-center bg-white p-12 rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100">
            <h1 className="text-4xl font-black text-slate-900">
              Không tìm thấy bộ câu hỏi
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
                  Câu hỏi {currentIndex + 1} / {totalQuestions}
                </span>
                <span className="text-blue-600">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200 shadow-inner">
                <div
                  style={{ width: `${progress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500 ease-out shadow-lg shadow-blue-200"
                ></div>
              </div>
            </div>

            <div className="flex-grow flex flex-col justify-center mb-12">
              <div className="bg-white p-10 md:p-16 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
                <div className="text-center mb-16">
                  <span className="inline-block px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest mb-6">
                    Câu hỏi hiện tại
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                    {currentQuestion?.content}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  {LIKERT_OPTIONS.map((option) => {
                    const isSelected =
                      answers[currentQuestion._id]?.score === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={`group relative rounded-3xl py-6 px-2 transition-all duration-300 border-2 
                        ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200 scale-105"
                            : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-slate-100"
                        }
                      `}
                      >
                        <div
                          className={`text-2xl font-black mb-2 ${isSelected ? "text-white" : "text-slate-900 group-hover:text-blue-600"}`}
                        >
                          {option.value}
                        </div>
                        <div
                          className={`text-[10px] font-bold uppercase tracking-tighter ${isSelected ? "text-blue-100" : "text-slate-400"}`}
                        >
                          {option.label}
                        </div>
                      </button>
                    );
                  })}
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

              {isAllAnswered ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-8 md:px-10 py-4 rounded-full bg-blue-600 text-white font-black text-base md:text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50"
                >
                  {submitting ? "Đang phân tích..." : "Xem Kết Quả"}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex((curr) => curr + 1)}
                  disabled={currentIndex === totalQuestions - 1}
                  className="px-6 md:px-8 py-4 rounded-full bg-white text-blue-600 font-bold border border-blue-100 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm md:text-base"
                >
                  Bỏ qua
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

export default HollandTestPage;
