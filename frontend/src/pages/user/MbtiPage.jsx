import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mbtiMaps } from "../../utils/mbtiMap";
import { getMbtiQuestions, submitMbtiTest } from "../../services/mbtiService";
import UpgradePrompt from "../../components/UpgradePrompt";

const MbtiPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Get user subscription plan from localStorage/token
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
      } catch (err) {
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

    // Lưu kết quả của tuỳ chọn A hoặc B
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
    if (Object.keys(answers).length < totalQuestions) {
      setError("Vui lòng trả lời tất cả các câu hỏi.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const formattedAnswers = Object.values(answers);

      const res = await submitMbtiTest(formattedAnswers);
      setResult(res.data);
    } catch (err) {
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

  // MBTI full test requires PAID or PREMIUM, FREE can try 10 questions
  if (!loading && userPlan === "FREE" && currentIndex >= 10) {
    return (
      <UpgradePrompt
        feature="MBTI Personality Test (Bản đầy đủ)"
        requiredPlan={["PAID", "PREMIUM"]}
        currentPlan={userPlan}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <p className="text-xl animate-pulse">Đang nạp bộ câu hỏi MBTI...</p>
      </div>
    );
  }

  if (result) {
    const mbtiData = mbtiMaps[result.mbtiType] || {
      name: result.mbtiType,
      desc: "",
      color: "from-gray-500 to-gray-400",
    };
    return (
      <div className="min-h-screen bg-black px-6 py-20 text-white">
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
            <p className="mb-2 text-sm uppercase tracking-[0.3em] text-purple-400">
              Kết Quả Bài Đánh Giá MBTI
            </p>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r text-transparent bg-clip-text pb-2 from-white to-gray-400">
              Khám Phá Bản Thân
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Type Focus */}
            <div
              className={`rounded-3xl p-8 bg-gradient-to-br ${mbtiData.color} bg-opacity-20 backdrop-blur`}
            >
              <h2 className="text-6xl font-bold mb-2 text-white drop-shadow-md">
                {result.mbtiType}
              </h2>
              <h3 className="text-2xl font-semibold mb-4 text-white/90">
                {mbtiData.name}
              </h3>
              <p className="text-white/80 leading-relaxed text-lg">
                {mbtiData.desc}
              </p>
            </div>

            {/* Radar summary */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 flex flex-col justify-between">
              <div>
                <h2 className="text-xl text-gray-300 uppercase tracking-widest mb-6">
                  Thành phần tính cách
                </h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {Object.entries(result.scores).map(([t, score]) => (
                    <div
                      key={t}
                      className="bg-white/5 p-3 rounded-lg flex items-center justify-between"
                    >
                      <span className="font-bold">{t}</span>
                      <span className="text-purple-400 font-mono text-lg">
                        {score}
                      </span>
                    </div>
                  ))}
                </div>
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
                Ngành Học Đề Xuất Theo MBTI
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {result.recommendedMajors.map((major) => (
                  <div
                    key={major._id}
                    className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-purple-500/50 hover:bg-white/10"
                  >
                    <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
                      <h4 className="text-xl font-bold">{major.name}</h4>
                      <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-300 font-medium">
                        Điểm chuẩn: {major.benchmarkScore}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-3">
                      {major.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isStarted = questions.length > 0;
  const isAllAnswered = Object.keys(answers).length === totalQuestions;

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
            MBTI Personality Test
          </p>
        </div>

        {!isStarted ? (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-400">
              Chưa có câu hỏi MBTI trong hệ thống
            </h1>
          </div>
        ) : (
          <>
            {/* Progress */}
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

            {/* Question */}
            <div className="flex-grow flex flex-col justify-center mb-12 relative">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-normal leading-tight text-white/90">
                  {currentQuestion?.question}
                </h2>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-4 max-w-xl mx-auto w-full">
                {/* Option A */}
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

                {/* Option B */}
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
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center text-red-400">
                {error}
              </div>
            )}

            {/* Nav */}
            <div className="flex items-center justify-between border-t border-white/10 pt-6">
              <button
                onClick={handleBack}
                disabled={currentIndex === 0}
                className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Câu trước
              </button>

              {isAllAnswered ? (
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

export default MbtiPage;
