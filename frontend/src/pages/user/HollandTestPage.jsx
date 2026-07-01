import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getHollandQuestions,
  submitHollandTest,
} from "../../services/hollandService";
import { getUser } from "../../utils/auth";

const LIKERT_OPTIONS = [
  { value: 1, label: "Hoàn toàn không" },
  { value: 2, label: "Không đúng" },
  { value: 3, label: "Trung tính" },
  { value: 4, label: "Khá đúng" },
  { value: 5, label: "Rắt chính xác" },
];

const HollandTestPage = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  // Key riêng theo user — tránh share draft giữa các tài khoản trên cùng thiết bị
  const DRAFT_KEY = `holland_draft_${currentUser?._id || "guest"}`;

  const loadDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      const d = JSON.parse(raw);
      if (!d?.answers || Object.keys(d.answers).length === 0) return null;
      return d;
    } catch {
      return null;
    }
  };
  const saveDraft = (answers, idx, questionIds) => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ answers, currentIndex: idx, questionIds }));
  };
  const clearDraft = () => localStorage.removeItem(DRAFT_KEY);

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
    // Dọn key cũ (không có userId) tránh nhầm lẫn
    localStorage.removeItem("holland_draft");

    const saved = loadDraft();
    if (saved) setDraft(saved);

    getHollandQuestions()
      .then((res) => {
        if (res.data) setQuestions(res.data);
      })
      .catch(() => setError("Không thể tải câu hỏi, vui lòng thử lại."))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResume = () => {
    if (!draft) return;
    if (draft.questionIds?.length > 0 && questions.length > 0) {
      const idMap = {};
      questions.forEach((q) => { idMap[q._id] = q; });
      const savedIdSet = new Set(draft.questionIds);
      // Khôi phục đúng thứ tự câu đã lưu
      const ordered = draft.questionIds.map((id) => idMap[id]).filter(Boolean);
      // Thêm các câu mới (chưa có trong draft) vào cuối để đủ số câu
      const extras = questions.filter((q) => !savedIdSet.has(q._id));
      const fullSet = [...ordered, ...extras];
      if (fullSet.length > 0) setQuestions(fullSet);
    }
    setAnswers(draft.answers);
    const maxIdx = draft.questionIds?.length > 0
      ? draft.questionIds.length - 1
      : questions.length > 0
        ? questions.length - 1
        : 0;
    setCurrentIndex(Math.min(draft.currentIndex ?? 0, maxIdx));
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
  const progress =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  const safeIndex =
    questions.length > 0 ? Math.min(currentIndex, questions.length - 1) : 0;
  const currentQuestion = questions[safeIndex];
  const isAllAnswered = answeredCount === totalQuestions && totalQuestions > 0;

  const handleSelect = (value) => {
    if (!currentQuestion) return;
    const newAnswers = {
      ...answers,
      [currentQuestion._id]: { type: currentQuestion.type, score: value },
    };
    setAnswers(newAnswers);
    const qIds = questions.map((q) => q._id);
    saveDraft(newAnswers, currentIndex, qIds);

    if (currentIndex < totalQuestions - 1) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const next = Math.min(currentIndex + 1, totalQuestions - 1);
        setCurrentIndex(next);
        saveDraft(newAnswers, next, qIds);
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
      const res = await submitHollandTest(Object.values(answers));
      clearDraft();
      if (!getUser()) {
        localStorage.setItem(
          "guestResult",
          JSON.stringify({ type: "holland", result: res.data }),
        );
        navigate("/register");
      } else {
        navigate("/test-result", {
          state: { type: "holland", result: res.data },
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Có lỗi khi phân tích kết quả, vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --- Screens ---

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 font-medium">
            Đang nạp bộ câu hỏi Holland...
          </p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-700">
            Không tìm thấy bộ câu hỏi
          </h2>
          <p className="text-slate-500 mt-2">Vui lòng quay lại sau.</p>
          <button
            onClick={() => navigate("/tests")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold"
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
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">📋</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Bạn có bài làm dang dở
          </h2>
          <p className="text-slate-500 text-sm mb-1">
            Đã hoàn thành{" "}
            <span className="font-bold text-blue-600">
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
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
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
  return (
    <div className="min-h-screen bg-slate-100 pt-24 pb-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress */}
        <div className="mb-5">
          <div className="flex justify-between text-sm font-semibold text-slate-600 mb-2">
            <span>
              Câu hỏi {safeIndex + 1} / {totalQuestions}
            </span>
            <span className="text-orange-500">
              {Math.round(progress)}% hoàn thành
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-orange-400 rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3 mb-5">
          <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-amber-700 leading-relaxed">
            <span className="font-bold">Lưu ý:</span> Kết quả trắc nghiệm Holland chỉ mang tính chất tham khảo về xu hướng sở thích nghề nghiệp. Đây không phải đánh giá tâm lý chuyên sâu và chưa được xác thực hoàn toàn về mặt khoa học. Hãy xem kết quả như một gợi ý định hướng, không phải quyết định cuối cùng.
          </p>
        </div>

        <div className="flex gap-5 items-start">
          {/* Left: question + answers + nav buttons */}
          <div className="flex-1 min-w-0 space-y-4">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <p className="text-lg font-semibold text-slate-800 leading-relaxed mb-6">
                {currentQuestion?.content}
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">
                Mức độ phù hợp với bạn:
              </p>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-400 shrink-0 text-center leading-tight">
                  HOÀN TOÀN
                  <br />
                  KHÔNG
                </span>
                <div className="flex gap-3 justify-center flex-1">
                  {LIKERT_OPTIONS.map((option) => {
                    const isSelected =
                      answers[currentQuestion?._id]?.score === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-all duration-200
                          ${
                            isSelected
                              ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-110"
                              : "bg-white border-slate-300 text-slate-700 hover:border-blue-400 hover:shadow-md"
                          }`}
                      >
                        {option.value}
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-bold text-slate-400 shrink-0 text-center leading-tight">
                  RẤT
                  <br />
                  CHÍNH XÁC
                </span>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-center text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
                  safeIndex > 0 ? setCurrentIndex((i) => i - 1) : navigate("/tests");
                }}
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
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                >
                  {submitting ? "Đang phân tích..." : "Nộp bài"}
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
                    setCurrentIndex((i) => i + 1);
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all shadow-md"
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
                      onClick={() => {
                        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
                        setCurrentIndex(idx);
                      }}
                      title={`Câu ${idx + 1}`}
                      className={`h-8 w-full rounded text-xs font-bold transition-all
                        ${
                          isCurrent
                            ? "bg-blue-600 text-white shadow-sm"
                            : isDone
                              ? "bg-orange-400 text-white"
                              : "bg-white border border-slate-200 text-slate-500 hover:border-blue-300"
                        }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-slate-500 border-t pt-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-600 shrink-0" />
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
                <li>Đọc kỹ từng câu hỏi và chọn mức độ phù hợp từ 1 đến 5.</li>
                <li>
                  Không có câu trả lời đúng hay sai, chỉ có câu phù hợp với bạn
                  nhất.
                </li>
                <li>Thời gian hoàn thành dự kiến: 5 - 10 phút.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HollandTestPage;
