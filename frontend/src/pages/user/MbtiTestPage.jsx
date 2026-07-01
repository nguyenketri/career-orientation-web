import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMbtiQuestions, submitMbtiTest } from "../../services/mbtiService";
import { getUser } from "../../utils/auth";

// Fallback nếu API cũ chưa trả timeLimitSec (draft cũ trước khi có tính năng đếm giờ)
const FALLBACK_SEC_PER_QUESTION = 15;

const formatTime = (sec) => {
  const safeSec = Math.max(0, sec);
  const m = Math.floor(safeSec / 60);
  const s = safeSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const MbtiTestPage = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  const DRAFT_KEY = `mbti_draft_${currentUser?._id || "guest"}`;

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
  const saveDraft = (answers, idx, questionsList) => {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        answers,
        currentIndex: idx,
        questions: questionsList,
        startedAt: startedAtRef.current,
        timeLimitSec: timeLimitRef.current,
      }),
    );
  };
  const clearDraft = () => localStorage.removeItem(DRAFT_KEY);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState(null); // draft detected on mount
  const [timeLeft, setTimeLeft] = useState(null);
  const [timeLimitSec, setTimeLimitSec] = useState(0);
  const timerRef = useRef(null);
  const answersRef = useRef(answers);
  const startedAtRef = useRef(null);
  const timeLimitRef = useRef(0);
  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const fetchFreshQuestions = () => {
    setLoading(true);
    autoSubmittedRef.current = false;
    getMbtiQuestions()
      .then((res) => {
        if (res.data) {
          setQuestions(res.data);
          startedAtRef.current = Date.now();
          timeLimitRef.current =
            res.timeLimitSec || res.data.length * FALLBACK_SEC_PER_QUESTION;
          setTimeLimitSec(timeLimitRef.current);
          setTimeLeft(timeLimitRef.current);
        }
      })
      .catch(() => setError("Không thể tải câu hỏi, vui lòng thử lại."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Dọn key cũ (không có userId) tránh nhầm lẫn
    localStorage.removeItem("mbti_draft");

    // Nếu đã có bài làm dang dở, dùng đúng bộ câu hỏi đã lưu (tránh bị random lại)
    const saved = loadDraft();
    if (saved?.questions?.length > 0) {
      startedAtRef.current = saved.startedAt || Date.now();
      timeLimitRef.current =
        saved.timeLimitSec || saved.questions.length * FALLBACK_SEC_PER_QUESTION;
      setTimeLimitSec(timeLimitRef.current);

      // Tính thời gian còn lại ngay khi phát hiện draft (tránh gọi Date.now() lúc render)
      const hasTimerInfo = !!(saved.startedAt && saved.timeLimitSec);
      const now = Date.now();
      const remainingAtLoad = hasTimerInfo
        ? Math.max(0, timeLimitRef.current - Math.floor((now - startedAtRef.current) / 1000))
        : null;

      setDraft({ ...saved, hasTimerInfo, remainingAtLoad });
      setQuestions(saved.questions);
      setLoading(false);
      return;
    }

    fetchFreshQuestions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doSubmit = async (answersToSubmit) => {
    try {
      setSubmitting(true);
      setError("");
      const res = await submitMbtiTest(Object.values(answersToSubmit));
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

  const handleTimeUp = () => {
    if (autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;
    const currentAnswers = answersRef.current;
    if (Object.keys(currentAnswers).length === 0) {
      clearDraft();
      navigate("/tests");
      return;
    }
    doSubmit(currentAnswers);
  };

  // Đếm ngược thời gian làm bài, tự động nộp bài khi hết giờ
  useEffect(() => {
    if (loading || draft || timeLimitRef.current <= 0) return undefined;

    const tick = () => {
      const remaining = Math.max(
        0,
        timeLimitRef.current -
          Math.floor((Date.now() - startedAtRef.current) / 1000),
      );
      setTimeLeft(remaining);
      if (remaining <= 0) handleTimeUp();
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, draft]);

  const handleResume = () => {
    if (!draft) return;
    setAnswers(draft.answers);
    setCurrentIndex(
      Math.min(draft.currentIndex ?? 0, questions.length > 0 ? questions.length - 1 : 0),
    );
    setDraft(null);
  };

  // Hết giờ trong lúc rời trang: nộp luôn bài với các câu đã trả lời
  const handleResumeExpired = () => {
    if (!draft) return;
    autoSubmittedRef.current = true;
    setAnswers(draft.answers);
    setDraft(null);
    doSubmit(draft.answers);
  };

  const handleRestart = () => {
    clearDraft();
    setAnswers({});
    setCurrentIndex(0);
    setDraft(null);
    // Chỉ random bộ câu hỏi mới khi thực sự bắt đầu lại từ đầu
    fetchFreshQuestions();
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
    saveDraft(newAnswers, currentIndex, questions);

    if (currentIndex < totalQuestions - 1) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const next = Math.min(currentIndex + 1, totalQuestions - 1);
        setCurrentIndex(next);
        saveDraft(newAnswers, next, questions);
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
    autoSubmittedRef.current = true;
    await doSubmit(answers);
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
    const hasTimerInfo = draft.hasTimerInfo;
    const draftRemaining = draft.remainingAtLoad;
    const isExpired = hasTimerInfo && draftRemaining <= 0;

    return (
      <div className="min-h-screen bg-slate-100 pt-24 pb-10 px-4 flex items-center justify-center">
        <div className="max-w-sm w-full bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${isExpired ? "bg-red-100" : "bg-indigo-100"}`}
          >
            <span className="text-3xl">{isExpired ? "⏰" : "📋"}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {isExpired ? "Đã hết thời gian làm bài" : "Bạn có bài làm dang dở"}
          </h2>
          <p className="text-slate-500 text-sm mb-1">
            Đã hoàn thành{" "}
            <span className="font-bold text-indigo-600">
              {draftAnsweredCount}/{totalQuestions}
            </span>{" "}
            câu hỏi
          </p>
          {isExpired ? (
            <p className="text-red-500 text-xs font-semibold mb-8">
              Bài làm sẽ được nộp với các câu bạn đã trả lời.
            </p>
          ) : (
            <p className="text-slate-400 text-xs mb-8">
              Đang dừng ở câu {Math.min(draftIndex, totalQuestions)}
              {hasTimerInfo && <> · Còn lại {formatTime(draftRemaining)}</>}
            </p>
          )}
          <div className="flex flex-col gap-3">
            {isExpired ? (
              <button
                onClick={handleResumeExpired}
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
              >
                {submitting ? "Đang nộp bài..." : "Nộp bài ngay"}
              </button>
            ) : (
              <button
                onClick={handleResume}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
              >
                Tiếp tục bài làm
              </button>
            )}
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
          <div className="flex justify-between items-center text-sm font-semibold text-slate-600 mb-2">
            <span>Câu hỏi {safeIndex + 1} / {totalQuestions}</span>
            <div className="flex items-center gap-3">
              {timeLeft !== null && (
                <span
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tabular-nums transition-colors ${
                    timeLeft <= 120
                      ? "bg-red-50 text-red-600 animate-pulse"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatTime(timeLeft)}
                </span>
              )}
              <span className="text-indigo-500">{Math.round(progress)}% hoàn thành</span>
            </div>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3 mb-5">
          <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-amber-700 leading-relaxed">
            <span className="font-bold">Lưu ý:</span> Kết quả trắc nghiệm MBTI chỉ mang tính chất tham khảo về xu hướng tính cách cá nhân. Phân loại MBTI là mô hình phổ biến nhưng chưa được cộng đồng khoa học xác thực hoàn toàn. Sử dụng kết quả để hiểu thêm bản thân, không nên dùng để đưa ra quyết định quan trọng.
          </p>
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
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                >
                  {submitting ? "Đang xử lý..." : "Xem Kết Quả"}
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
                    setCurrentIndex((i) => i + 1);
                  }}
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
                      onClick={() => {
                        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
                        setCurrentIndex(idx);
                      }}
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
                <li>
                  Thời gian làm bài: {Math.round(timeLimitSec / 60)} phút. Hết
                  giờ hệ thống sẽ tự động nộp bài.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MbtiTestPage;
