import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { hollandMaps } from "../../utils/hollandMap";

const HollandPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(null);

  // Get user subscription plan
  const userPlan = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.subscriptionPlan || "FREE";
    } catch {
      return "FREE";
    }
  })();

  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result);
    }
  }, [location.state?.result]);

  const handleRetake = () => {
    window.open("/holland-test", "_blank");
  };

  // RESULT VIEW
  if (result) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 pt-32 pb-20 text-slate-900">
        {userPlan === "FREE" && (
          <div className="mx-auto max-w-7xl mb-6 p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center">
            <p className="text-blue-600 text-sm">
              Bạn đang xem kết quả từ <b>Bản rút gọn (15 câu)</b>. Nâng cấp lên
              gói <b>Trả Phí</b> hoặc <b>Cao Cấp</b> để có kết quả chính xác hơn
              với bộ câu hỏi đầy đủ!
            </p>
            <button
              onClick={() => navigate("/pricing")}
              className="text-blue-700 font-bold text-sm underline mt-2 hover:text-blue-800"
            >
              Nâng cấp ngay →
            </button>
          </div>
        )}
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black mb-4 text-slate-900">
              Kết Quả Holland Của Bạn
            </h1>
            <p className="text-slate-600 text-lg">
              Hệ thống đã phân tích và lưu kết quả vào hồ sơ của bạn.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Top 3 Types Box */}
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-100">
              <h2 className="text-xl text-blue-600 uppercase tracking-widest mb-6 font-bold">
                Đặc Trưng Nổi Bật Nhất
              </h2>

              {result.topTypes.map((type, idx) => (
                <div key={type} className="mb-6 last:mb-0">
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="text-3xl font-bold text-slate-900">
                      <span className="text-blue-600 mr-2">Top {idx + 1}:</span>
                      {hollandMaps[type]?.name || type}
                    </h3>
                    <span className="text-slate-500 text-sm font-medium">
                      Điểm: {result.hollandScores[type]}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-3 leading-relaxed">
                    {hollandMaps[type]?.desc}
                  </p>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(result.hollandScores[type] / 300) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Radar/Scores */}
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-100">
              <h2 className="text-xl text-slate-800 uppercase tracking-widest mb-6 font-bold">
                Điểm Các Nhóm
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(result.hollandScores).map(([t, score]) => (
                  <div
                    key={t}
                    className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-100"
                  >
                    <span className="font-black text-slate-700 text-lg">
                      {t}
                    </span>
                    <span className="text-blue-600 font-bold text-xl">
                      {score}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleRetake}
                className="mt-8 w-full rounded-2xl bg-blue-600 px-6 py-4 text-white transition hover:bg-blue-700 font-bold text-lg shadow-lg shadow-blue-200"
              >
                Làm Lại Bài Test
              </button>
            </div>
          </div>

          {/* Recommended Majors */}
          {result.recommendedMajors?.length > 0 && (
            <div className="mt-20">
              <h3 className="mb-10 text-4xl font-black text-slate-900 text-center">
                Ngành Học Phù Hợp Đề Xuất
              </h3>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {result.recommendedMajors.map((major) => (
                  <div
                    key={major._id}
                    className="rounded-3xl border border-slate-100 bg-white p-8 shadow-lg shadow-slate-100 transition hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="mb-6 flex flex-col gap-2">
                      <h4 className="text-2xl font-bold text-slate-900">
                        {major.name}
                      </h4>
                      <span className="inline-block w-fit rounded-full bg-blue-50 px-4 py-1 text-sm text-blue-600 font-bold border border-blue-100">
                        Điểm chuẩn: {major.benchmarkScore}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-6">
                      {major.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {major.hollandTypes?.map((t) => (
                        <span
                          key={t}
                          className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-600 font-bold border border-slate-200"
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

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pt-32 pb-20">
        {/* Hero Section */}
        <div className="bg-white border border-blue-50 rounded-[40px] mx-auto max-w-7xl p-8 md:p-20 mb-20 flex flex-col md:flex-row items-center gap-16 shadow-2xl shadow-blue-100/50">
          <div className="flex-1 text-left">
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 leading-[1.1]">
              Khám phá ngành học
              <br />
              <span className="text-blue-600">Phù hợp với bạn</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
              Trắc nghiệm sở thích Holland giúp bạn tìm ra nhóm tính cách ngành
              học của mình, từ đó định hướng con đường học tập một cách khoa học
              nhất.
            </p>
            <button
              onClick={() => window.open("/holland-test", "_blank")}
              className="bg-blue-600 text-white px-12 py-5 rounded-full font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:scale-105"
            >
              Bắt đầu khám phá
            </button>
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            <img
              src="https://cdn-icons-png.flaticon.com/512/1904/1904425.png"
              alt="Holland Illustration"
              className="w-full max-w-md mx-auto relative z-10"
            />
          </div>
        </div>

        {/* What is Holland Section */}
        <div className="mx-auto max-w-7xl px-6 mb-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-8">
                Mô hình Holland là gì?
              </h2>
              <p className="text-slate-600 text-xl mb-10 leading-relaxed">
                Được phát triển bởi tiến sĩ tâm lý học John Holland, đây là mô
                hình lý thuyết về chọn ngành được sử dụng rộng rãi nhất trên thế
                giới hiện nay.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 text-center shadow-lg shadow-slate-100">
                  <div className="text-5xl font-black text-blue-600 mb-2">
                    6
                  </div>
                  <div className="text-slate-500 font-bold">
                    Nhóm sở thích ngành học
                  </div>
                </div>
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 text-center shadow-lg shadow-slate-100">
                  <div className="text-5xl font-black text-blue-600 mb-2">
                    RIASEC
                  </div>
                  <div className="text-slate-500 font-bold">
                    Tên gọi viết tắt của mô hình
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-blue-600 p-10 md:p-12 rounded-[40px] shadow-2xl shadow-blue-200 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <h3 className="text-2xl font-black mb-8">
                Lợi ích khi làm bài test
              </h3>
              <ul className="space-y-6 mb-10">
                {[
                  "Xác định rõ đam mê và sở thích ngành học thực sự.",
                  "Tìm ra môi trường học tập lý tưởng cho bản thân.",
                  "Kết nối sở thích với các ngành học cụ thể.",
                  "Tăng khả năng thành công và hài lòng trong học tập tương lai.",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 text-blue-50 text-lg"
                  >
                    <div className="mt-1 bg-white/20 rounded-full p-1 flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => window.open("/holland-test", "_blank")}
                className="w-full bg-white text-blue-600 py-5 rounded-2xl font-black text-xl hover:bg-blue-50 transition-all shadow-lg"
              >
                Test miễn phí 100%
              </button>
            </div>
          </div>
        </div>

        {/* 6 Groups Section */}
        <div className="bg-white rounded-[50px] py-20 px-8 md:px-16 shadow-xl shadow-slate-100 border border-slate-50 mb-24">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-6">
              6 Nhóm tính cách theo Holland
            </h2>
            <p className="text-slate-500 text-lg max-w-3xl mx-auto">
              Mỗi người thường là sự kết hợp của 2-3 nhóm, trong đó có một nhóm
              nổi trội nhất.
            </p>
          </div>

          <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.keys(hollandMaps).map((type) => (
              <div
                key={type}
                className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-50 transition-all group"
              >
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-6 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                  {type}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  {hollandMaps[type]?.name}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {hollandMaps[type]?.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <button
              onClick={() => window.open("/holland-test", "_blank")}
              className="bg-blue-600 text-white px-12 py-5 rounded-full font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:scale-105"
            >
              Bắt đầu làm bài ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default HollandPage;
