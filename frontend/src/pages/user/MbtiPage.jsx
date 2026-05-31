import { useState } from "react";
import { useLocation } from "react-router-dom";
import { mbtiMaps } from "../../utils/mbtiMap";

const MbtiPage = () => {
  const location = useLocation();
  const [result] = useState(() => location.state?.result || null);

  const handleRetake = () => {
    window.open("/mbti-test", "_blank");
  };

  if (result) {
    const mbtiData = mbtiMaps[result.mbtiType] || {
      name: result.mbtiType,
      desc: "",
      color: "from-blue-500 to-blue-400",
    };
    return (
      <div className="min-h-screen bg-slate-50 px-4 md:px-6 pt-24 md:pt-32 pb-10 md:pb-20 text-slate-900">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8 md:mb-12">
            <p className="mb-2 text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-blue-600">
              Kết Quả Bài Đánh Giá MBTI
            </p>
            <h1 className="text-3xl md:text-5xl font-black mb-4 text-slate-900">
              Khám Phá Bản Thân
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-12">
            {/* Type Focus */}
            <div
              className={`rounded-2xl md:rounded-3xl p-6 md:p-8 bg-gradient-to-br ${mbtiData.color} text-white shadow-xl shadow-blue-100`}
            >
              <h2 className="text-5xl md:text-7xl font-black mb-2 drop-shadow-md">
                {result.mbtiType}
              </h2>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 opacity-90">
                {mbtiData.name}
              </h3>
              <p className="leading-relaxed text-base md:text-lg opacity-90">
                {mbtiData.desc}
              </p>
            </div>

            {/* Radar summary */}
            <div className="rounded-2xl md:rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xl shadow-slate-100 flex flex-col justify-between">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-slate-800 uppercase tracking-widest mb-6 md:mb-8">
                  Thành phần tính cách
                </h2>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {Object.entries(result.scores).map(([t, score]) => (
                    <div
                      key={t}
                      className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100"
                    >
                      <span className="font-black text-slate-700 text-xl">
                        {t}
                      </span>
                      <span className="text-blue-600 font-mono text-2xl font-bold">
                        {score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleRetake}
                className="mt-10 w-full rounded-2xl bg-blue-600 px-6 py-4 text-white transition hover:bg-blue-700 font-bold text-lg shadow-lg shadow-blue-200"
              >
                Làm Lại Bài Test
              </button>
            </div>
          </div>

          {/* Recommended Majors */}
          {result.recommendedMajors?.length > 0 && (
            <div className="mt-12 md:mt-20">
              <h3 className="mb-6 md:mb-10 text-2xl md:text-4xl font-black text-slate-900 text-center">
                Ngành Học Đề Xuất Cho Bạn
              </h3>
              <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
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
                    <p className="text-slate-600 leading-relaxed">
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-24 md:pt-32 pb-10 md:pb-20 px-4 md:px-0">
      <div className="mx-auto max-w-7xl px-0 md:px-6">
        {/* Hero Section */}
        <div className="bg-white border border-blue-50 rounded-[30px] md:rounded-[40px] p-6 md:p-20 mb-12 md:mb-20 flex flex-col md:flex-row items-center gap-10 md:gap-16 shadow-2xl shadow-blue-100/50">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-6xl font-black text-slate-900 mb-6 md:mb-8 leading-[1.1]">
              Hiểu rõ chính mình
              <br />
              <span className="text-blue-600">Chọn ngành học đúng cách</span>
            </h1>
            <p className="text-base md:text-xl text-slate-600 mb-8 md:mb-10 leading-relaxed max-w-xl">
              Bài trắc nghiệm tính cách (MBTI) giúp bạn hiểu rõ về bản thân mình
              hơn, từ đó đưa ra cho bạn những định hướng về ngành học phù hợp
              nhất.
            </p>
            <button
              onClick={() => window.open("/mbti-test", "_blank")}
              className="w-full md:w-fit bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 md:px-12 py-4 md:py-5 rounded-full font-black text-lg md:text-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
            >
              Làm bài test
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            <img
              src="https://cdn-icons-png.flaticon.com/512/3534/3534139.png"
              alt="MBTI Illustration"
              className="w-full max-w-md mx-auto relative z-10"
            />
          </div>
        </div>

        {/* What is MBTI Section */}
        <div className="mb-16 md:mb-24">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 md:mb-8">
                Trắc nghiệm tính cách MBTI là gì?
              </h2>
              <p className="text-lg md:text-xl text-slate-600 mb-8 md:mb-10 leading-relaxed">
                Bài trắc nghiệm sử dụng bộ câu hỏi chia làm 74 câu trắc nghiệm,
                giúp người trả lời định hướng bản thân rõ ràng dựa trên học
                thuyết MBTI (Myers-Briggs Type Indicator)
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 text-center shadow-lg shadow-slate-100">
                  <div className="text-5xl font-black text-blue-600 mb-2">
                    4
                  </div>
                  <div className="text-slate-500 font-bold">
                    Cặp đối lập cơ bản
                  </div>
                </div>
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 text-center shadow-lg shadow-slate-100">
                  <div className="text-5xl font-black text-blue-600 mb-2">
                    16
                  </div>
                  <div className="text-slate-500 font-bold">
                    Nhóm tính cách riêng biệt
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-blue-600 p-10 md:p-12 rounded-[40px] shadow-2xl shadow-blue-200 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <h3 className="text-2xl font-black mb-8">
                Bài test MBTI giúp bạn
              </h3>
              <ul className="space-y-6 mb-10">
                {[
                  "Hiểu rõ bản thân: Nhận ra điểm mạnh, điểm yếu và sở thích tự nhiên.",
                  "Định hướng ngành học: Chọn ngành học và trường học phù hợp năng lực.",
                  "Thấu hiểu người khác: Xây dựng mối quan hệ tốt hơn thông qua sự đồng cảm.",
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
              <p className="text-sm text-blue-200 mb-8 italic opacity-80">
                * Đặc biệt: Dựa trên kết quả bài test, caZup sẽ cung cấp gợi ý
                về các ngành học & các trường đại học đào tạo phù hợp với bạn!
              </p>
              <button
                onClick={() => window.open("/mbti-test", "_blank")}
                className="w-full bg-white text-blue-600 py-5 rounded-2xl font-black text-xl hover:bg-blue-50 transition-all shadow-lg border border-blue-100 flex items-center justify-center gap-2 group"
              >
                Test miễn phí 100%
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Dimensions Section */}
        <div className="bg-white rounded-[30px] md:rounded-[50px] py-12 md:py-20 px-4 md:px-16 shadow-xl shadow-slate-100 border border-slate-50 mb-16 md:mb-24">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 md:mb-6">
              Cách MBTI phân loại 16 nhóm tính cách
            </h2>
            <p className="text-slate-500 text-base md:text-lg max-w-3xl mx-auto">
              Kết quả MBTI xây dựng dựa trên sự kết hợp của 4 cặp yếu tố. Hãy
              tưởng tượng mỗi cặp như một chiếc cân, nơi bạn nghiêng về một
              phía.
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-10">
            {[
              {
                left: {
                  label: "E",
                  name: "Extroverts",
                  sub: "Hướng ngoại",
                  color: "bg-yellow-400 text-white",
                },
                right: {
                  label: "I",
                  name: "Introverts",
                  sub: "Hướng nội",
                  color: "bg-blue-600 text-white",
                },
                title: "TƯƠNG TÁC & NĂNG LƯỢNG",
                desc: "Hướng ngoại (nạp năng lượng từ bên ngoài) so với Hướng nội (nạp năng lượng khi một mình).",
              },
              {
                left: {
                  label: "S",
                  name: "Sensors",
                  sub: "Cảm giác",
                  color: "bg-blue-500 text-white",
                },
                right: {
                  label: "N",
                  name: "Intuitives",
                  sub: "Trực giác",
                  color: "bg-yellow-400 text-white",
                },
                title: "TIẾP NHẬN THÔNG TIN",
                desc: "Cảm giác (thực tế, chi tiết) so với Trực giác (tổng thể, lý thuyết).",
              },
              {
                left: {
                  label: "T",
                  name: "Thinkers",
                  sub: "Lý trí",
                  color: "bg-yellow-400 text-white",
                },
                right: {
                  label: "F",
                  name: "Feelers",
                  sub: "Cảm xúc",
                  color: "bg-blue-500 text-white",
                },
                title: "RA QUYẾT ĐỊNH",
                desc: "Lý trí (logic, nguyên tắc) so với Cảm xúc (giá trị cá nhân, sự hài hòa).",
              },
              {
                left: {
                  label: "J",
                  name: "Judgers",
                  sub: "Nguyên tắc",
                  color: "bg-blue-600 text-white",
                },
                right: {
                  label: "P",
                  name: "Perceivers",
                  sub: "Linh hoạt",
                  color: "bg-yellow-400 text-white",
                },
                title: "PHONG CÁCH SỐNG",
                desc: "Nguyên tắc (kế hoạch, quy tắc) so với Linh hoạt (tùy cơ ứng biến, tự do).",
              },
            ].map((dim, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row items-center gap-6 md:gap-12"
              >
                <div
                  className={`${dim.left.color} w-full md:w-40 p-6 rounded-3xl text-center shadow-lg shadow-slate-100`}
                >
                  <div className="text-4xl font-black">{dim.left.label}</div>
                  <div className="text-xs font-black uppercase tracking-tighter">
                    {dim.left.name}
                  </div>
                  <div className="text-sm font-medium">{dim.left.sub}</div>
                </div>
                <div className="flex-1 text-center px-4">
                  <div className="text-sm font-black text-blue-600 mb-2 tracking-widest">
                    {dim.title}
                  </div>
                  <div className="text-slate-600 font-medium">{dim.desc}</div>
                </div>
                <div
                  className={`${dim.right.color} w-full md:w-40 p-6 rounded-3xl text-center shadow-lg shadow-slate-100`}
                >
                  <div className="text-4xl font-black">{dim.right.label}</div>
                  <div className="text-xs font-black uppercase tracking-tighter">
                    {dim.right.name}
                  </div>
                  <div className="text-sm font-medium">{dim.right.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto mt-12 md:mt-16 p-6 md:p-8 bg-blue-50 border border-blue-100 rounded-[24px] md:rounded-[32px] text-center text-blue-800">
            <p className="text-base md:text-lg italic leading-relaxed">
              <strong>Lưu ý:</strong> Trong MBTI không có điểm tính cách nào
              được coi là tốt hơn hay xấu hơn nhưng những đặc điểm khác. MBTI
              chỉ giúp nhận ra thiếu sót trong bản thân để hoàn thiện mình.
            </p>
          </div>
          <div className="text-center mt-10 md:mt-12">
            <button
              onClick={() => window.open("/mbti-test", "_blank")}
              className="w-full md:w-fit bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 md:px-12 py-4 md:py-5 rounded-full font-black text-lg md:text-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group mx-auto"
            >
              Tôi đã sẵn sàng!
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 16 Types Grid */}
        <div className="mb-12 md:mb-20">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              16 nhóm tính cách <span className="text-blue-600">MBTI</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
            {Object.keys(mbtiMaps).map((type) => (
              <div
                key={type}
                className="bg-white p-6 rounded-3xl border border-slate-100 text-center hover:border-blue-400 hover:shadow-xl hover:shadow-blue-50 transition-all cursor-default group"
              >
                <div className="text-2xl font-black text-blue-600 group-hover:scale-110 transition-transform">
                  {type}
                </div>
                <div className="text-[10px] font-bold text-slate-400 leading-tight mt-2 uppercase">
                  {mbtiMaps[type]?.name}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12 md:mt-20">
            <button
              onClick={() => window.open("/mbti-test", "_blank")}
              className="w-full md:w-fit bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 md:px-16 py-4 md:py-6 rounded-full font-black text-lg md:text-2xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-2xl shadow-blue-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 group mx-auto"
            >
              Khám phá tính cách của tôi
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 md:w-8 h-6 md:h-8 group-hover:translate-x-2 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MbtiPage;
