import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMbtiQuestions, submitMbtiTest } from "../../services/mbtiService";
import { getUser } from "../../utils/auth";

const DRAFT_KEY = "mbti_draft";

const loadDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (!draft?.answers || Object.keys(draft.answers).length === 0) return null;
    return draft;
  } catch {
    return null;
  }
};

const saveDraft = (answers, currentIndex) => {
  localStorage.setItem(DRAFT_KEY, JSON.stringify({ answers, currentIndex }));
};

const clearDraft = () => {
  localStorage.removeItem(DRAFT_KEY);
};

const MbtiTestPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState(null); // draft detected on mount
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    // Detect draft trước khi fetch questions
    const saved = loadDraft();
    if (saved) setDraft(saved);

    getMbtiQuestions()
      .then((res) => {
        if (res.data) setQuestions(res.data);
      })
      .catch(() => setError("Không thể tải câu hỏi, vui lòng thử lại."))
      .finally(() => setLoading(false));
  }, []);

  const handleResume = () => {
    if (!draft) return;
    setAnswers(draft.answers);
    setCurrentIndex(
      Math.min(draft.currentIndex ?? 0, questions.length > 0 ? questions.length - 1 : 0),
    );
    setDraft(null);
  };

  const handleRestart = () => {
    clearDraft();
    setAnswers({});
    setCurrentIndex(0);
    setDraft(null);
  };

  const totalQuestions = questions.length;
  const answeredCount = questions.filter((q) => answers[q._id]).length;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  const safeIndex = questions.length > 0 ? Math.min(currentIndex, questions.length - 1) : 0;
  const currentQuestion = questions[safeIndex];
  const isAllAnswered = answeredCount === totalQuestions && totalQuestions > 0;

  const handleSelect = (typeValue) => {
    if (!currentQuestion) return;
    const newAnswers = {
      ...answers,
      [currentQuestion._id]: { typeValue },
    };
    setAnswers(newAnswers);
    saveDraft(newAnswers, currentIndex);

    if (currentIndex < totalQuestions - 1) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const next = Math.min(currentIndex + 1, totalQuestions - 1);
        setCurrentIndex(next);
        saveDraft(newAnswers, next);
      }, 400);
    }
  };

  const handleSubmit = async () => {
    if (answeredCount < totalQuestions) {
      const firstUnanswered = questions.findIndex((q) => !answers[q._id]);
      if (firstUnanswered !== -1) setCurrentIndex(firstUnanswered);
      setError("Vui lòng trả lời tất cả câu hỏi trước khi nộp bài.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      const res = await submitMbtiTest(Object.values(answers));
      clearDraft();
      if (!getUser()) {
        localStorage.setItem(
          "guestResult",
          JSON.stringify({ type: "mbti", result: res.data }),
        );
        navigate("/register");
      } else {
        navigate("/test-result", { state: { type: "mbti", result: res.data } });
      }
    } catch {
      setError("Có lỗi khi phân tích kết quả, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Screens ---

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 font-medium">Đang nạp bộ câu hỏi MBTI...</p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-700">Không tìm thấy bộ câu hỏi</h2>
          <p className="text-slate-500 mt-2">Vui lòng quay lại sau.</p>
          <button
            onClick={() => navigate("/tests")}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Draft resume screen
  if (draft) {
    const draftAnsweredCount = Object.keys(draft.answers).length;
    const draftIndex = (draft.currentIndex ?? 0) + 1;
    return (
      <div className="min-h-screen bg-slate-100 pt-24 pb-10 px-4 flex items-center justify-center">
        <div className="max-w-sm w-full bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">📋</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Bạn có bài làm dang dở
          </h2>
          <p className="text-slate-500 text-sm mb-1">
            Đã hoàn thành{" "}
            <span className="font-bold text-indigo-600">
              {draftAnsweredCount}/{totalQuestions}
            </span>{" "}
            câu hỏi
          </p>
          <p className="text-slate-400 text-xs mb-8">
            Đang dừng ở câu {Math.min(draftIndex, totalQuestions)}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleResume}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
            >
              Tiếp tục bài làm
            </button>
            <button
              onClick={handleRestart}
              className="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
            >
              Làm lại từ đầu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main test screen
  const selectedTypeValue = answers[currentQuestion?._id]?.typeValue;

  return (
    <div className="min-h-screen bg-slate-100 pt-24 pb-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress */}
        <div className="mb-5">
          <div className="flex justify-between text-sm font-semibold text-slate-600 mb-2">
            <span>Câu hỏi {safeIndex + 1} / {totalQuestions}</span>
            <span className="text-indigo-500">{Math.round(progress)}% hoàn thành</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            />
          </div>
        </div>

        <div className="flex gap-5 items-start">
          {/* Left: question + A/B options + nav buttons */}
          <div className="flex-1 min-w-0 space-y-4">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Câu hỏi {safeIndex + 1}
              </p>
              <p className="text-xl font-bold text-slate-800 leading-relaxed mb-8">
                {currentQuestion?.question}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleSelect(currentQuestion?.optionA?.typeValue)}
                  className={`group relative rounded-2xl p-6 text-left border-2 transition-all duration-200
                    ${
                      selectedTypeValue === currentQuestion?.optionA?.typeValue
                        ? "bg-indigo-50 border-indigo-500 shadow-md"
                        : "bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-white hover:shadow-sm"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full border-2 shrink-0 flex items-center justify-center transition-all
                        ${
                          selectedTypeValue === currentQuestion?.optionA?.typeValue
                            ? "border-indigo-500 bg-indigo-600"
                            : "border-slate-300 group-hover:border-indigo-400"
                        }`}
                    >
                      {selectedTypeValue === currentQuestion?.optionA?.typeValue && (
                        <div className="w-3 h-3 rounded-full bg-white" />
                      )}
                    </div>
                    <span
                      className={`font-semibold text-base leading-snug ${
                        selectedTypeValue === currentQuestion?.optionA?.typeValue
                          ? "text-indigo-800"
                          : "text-slate-700"
                      }`}
                    >
                      {currentQuestion?.optionA?.text}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => handleSelect(currentQuestion?.optionB?.typeValue)}
                  className={`group relative rounded-2xl p-6 text-left border-2 transition-all duration-200
                    ${
                      selectedTypeValue === currentQuestion?.optionB?.typeValue
                        ? "bg-indigo-50 border-indigo-500 shadow-md"
                        : "bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-white hover:shadow-sm"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full border-2 shrink-0 flex items-center justify-center transition-all
                        ${
                          selectedTypeValue === currentQuestion?.optionB?.typeValue
                            ? "border-indigo-500 bg-indigo-600"
                            : "border-slate-300 group-hover:border-indigo-400"
                        }`}
                    >
                      {selectedTypeValue === currentQuestion?.optionB?.typeValue && (
                        <div className="w-3 h-3 rounded-full bg-white" />
                      )}
                    </div>
                    <span
                      className={`font-semibold text-base leading-snug ${
                        selectedTypeValue === currentQuestion?.optionB?.typeValue
                          ? "text-indigo-800"
                          : "text-slate-700"
                      }`}
                    >
                      {currentQuestion?.optionB?.text}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-center text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center">
              <button
                onClick={() =>
                  safeIndex > 0
                    ? setCurrentIndex((i) => i - 1)
                    : navigate("/tests")
                }
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
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
                {safeIndex === 0 ? "Quay lại" : "Câu trước"}
              </button>

              {isAllAnswered || safeIndex === totalQuestions - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                >
                  {submitting ? "Đang xử lý..." : "Xem Kết Quả"}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-all shadow-md"
                >
                  Tiếp theo
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
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
          </div>

          {/* Right sidebar */}
          <div className="w-56 shrink-0 space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-3 text-sm">
                📋 Bảng điều hướng
              </h3>
              <div className="grid grid-cols-5 gap-1.5">
                {questions.map((q, idx) => {
                  const isCurrent = idx === safeIndex;
                  const isDone = !!answers[q._id];
                  return (
                    <button
                      key={q._id}
                      onClick={() => setCurrentIndex(idx)}
                      title={`Câu ${idx + 1}`}
                      className={`h-8 w-full rounded text-xs font-bold transition-all
                        ${
                          isCurrent
                            ? "bg-indigo-600 text-white shadow-sm"
                            : isDone
                              ? "bg-orange-400 text-white"
                              : "bg-white border border-slate-200 text-slate-500 hover:border-indigo-300"
                        }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-slate-500 border-t pt-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-indigo-600 shrink-0" />
                  <span>Đang làm</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-orange-400 shrink-0" />
                  <span>Đã làm</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border border-slate-300 shrink-0" />
                  <span>Chưa làm</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-3 text-sm">
                🔔 Hướng dẫn
              </h3>
              <ol className="text-xs text-slate-500 space-y-2 list-decimal list-inside leading-relaxed">
                <li>Đọc kỹ câu hỏi và chọn phương án phù hợp nhất với bạn.</li>
                <li>Không có câu trả lời đúng hay sai, hãy chọn theo bản năng tự nhiên của bạn.</li>
                <li>Thời gian hoàn thành dự kiến: 5 - 10 phút.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MbtiTestPage;
