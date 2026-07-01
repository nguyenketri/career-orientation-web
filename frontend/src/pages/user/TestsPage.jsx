import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { hollandMaps } from "../../utils/hollandMap";

const TestsPage = () => {
  const navigate = useNavigate();
  const [activeTest, setActiveTest] = useState("holland");

  const hollandInfo = {
    title: "Mô hình Holland là gì?",
    description:
      "Được phát triển bởi tiến sĩ tâm lý học John Holland, đây là mô hình lý thuyết về chọn ngành được sử dụng rộng rãi nhất trên thế giới hiện nay.",
    stats: [
      { number: "6", label: "Nhóm sở thích ngành học" },
      { number: "RIASEC", label: "Tên gọi viết tắt của mô hình" },
    ],
    benefits: [
      "Xác định rõ đam mê và sở thích ngành học thực sự.",
      "Tìm ra môi trường học tập lý tưởng cho bản thân.",
      "Kết nối sở thích với các ngành học cụ thể.",
      "Tăng khả năng thành công và hài lòng trong học tập tương lai.",
    ],
    types: hollandMaps,
  };

  const mbtiInfo = {
    title: "MBTI là gì?",
    description:
      "Myers-Briggs Type Indicator (MBTI) là công cụ đánh giá tính cách dựa trên lý thuyết tâm lý của Carl Jung, giúp bạn hiểu rõ hơn về cách suy nghĩ, cảm xúc và hành động của mình.",
    stats: [
      { number: "16", label: "Loại tính cách" },
      { number: "4", label: "Chiều cơ bản của tính cách" },
    ],
    benefits: [
      "Hiểu rõ điểm mạnh và điểm yếu của bản thân.",
      "Nhận biết phong cách làm việc và học tập phù hợp.",
      "Cải thiện giao tiếp và mối quan hệ với người khác.",
      "Tìm công việc và ngành học phù hợp với tính cách của bạn.",
    ],
    dimensions: {
      E: {
        full: "Extroversion (Hướng ngoài)",
        desc: "Năng lượng từ thế giới bên ngoài",
      },
      I: {
        full: "Introversion (Hướng trong)",
        desc: "Năng lượng từ thế giới nội tâm",
      },
      S: {
        full: "Sensing (Cảm nhận)",
        desc: "Tập trung vào hiện tại và chi tiết",
      },
      N: {
        full: "Intuition (Trực giác)",
        desc: "Tập trung vào tương lai và khả năng",
      },
      T: { full: "Thinking (Tư duy)", desc: "Ra quyết định dựa trên logic" },
      F: { full: "Feeling (Cảm xúc)", desc: "Ra quyết định dựa trên giá trị" },
      J: {
        full: "Judging (Phán xét)",
        desc: "Ưa thích có kế hoạch và tổ chức",
      },
      P: {
        full: "Perceiving (Nhận thức)",
        desc: "Ưa thích linh hoạt và ứng biến",
      },
    },
  };

  const currentInfo = activeTest === "holland" ? hollandInfo : mbtiInfo;

  return (
    <div className="min-h-screen bg-slate-50 pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">
            Trắc nghiệm Tính cách
          </h2>
          <h1 className="text-4xl font-black text-slate-900 mb-4">
            Khám Phá Bản Thân
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Đây chỉ là dữ liệu tham khảo được tính theo sở thích và tính cách
            của bạn để đưa ra gợi ý ngành học và trường học phù hợp chứ chưa thể
            chắc chắn 100%.
          </p>
        </div>

        {/* Test Selection */}
        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={() => setActiveTest("holland")}
            className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${
              activeTest === "holland"
                ? "bg-[#0f172a] text-white shadow-lg"
                : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"
            }`}
          >
            <span className="text-lg">🎯</span> Trắc nghiệm Holland
          </button>
          <button
            onClick={() => setActiveTest("mbti")}
            className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${
              activeTest === "mbti"
                ? "bg-[#0f172a] text-white shadow-lg"
                : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
            }`}
          >
            <span className="text-lg">✨</span> Trắc nghiệm MBTI
          </button>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Test Info + Start Button */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 p-8">
              {activeTest === "holland" ? (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl">🎯</div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Trắc nghiệm Holland</h2>
                      <p className="text-sm text-slate-500">Khám phá nhóm sở thích nghề nghiệp của bạn</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-2xl text-center">
                      <div className="text-2xl font-black text-blue-600">42</div>
                      <div className="text-xs text-slate-500 mt-1">Câu hỏi</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl text-center">
                      <div className="text-2xl font-black text-blue-600">6</div>
                      <div className="text-xs text-slate-500 mt-1">Nhóm tính cách</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl text-center">
                      <div className="text-2xl font-black text-blue-600">10'</div>
                      <div className="text-xs text-slate-500 mt-1">Thời gian</div>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-8">
                    Bài trắc nghiệm Holland giúp bạn xác định nhóm sở thích nghề nghiệp theo mô hình RIASEC, từ đó gợi ý các ngành học và nghề nghiệp phù hợp nhất với tính cách và đam mê của bạn.
                  </p>
                  <button
                    onClick={() => navigate("/tests/holland")}
                    className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-3"
                  >
                    <span>🎯</span> Bắt đầu trắc nghiệm Holland
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl">✨</div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Trắc nghiệm MBTI</h2>
                      <p className="text-sm text-slate-500">Khám phá 16 loại tính cách của bạn</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-indigo-50 p-4 rounded-2xl text-center">
                      <div className="text-2xl font-black text-indigo-600">28</div>
                      <div className="text-xs text-slate-500 mt-1">Câu hỏi</div>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-2xl text-center">
                      <div className="text-2xl font-black text-indigo-600">16</div>
                      <div className="text-xs text-slate-500 mt-1">Loại tính cách</div>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-2xl text-center">
                      <div className="text-2xl font-black text-indigo-600">10'</div>
                      <div className="text-xs text-slate-500 mt-1">Thời gian</div>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-8">
                    Bài trắc nghiệm MBTI giúp bạn hiểu rõ hơn về cách suy nghĩ, cảm xúc và hành động của mình thông qua 4 chiều tính cách cơ bản, từ đó định hướng ngành học và môi trường làm việc phù hợp.
                  </p>
                  <button
                    onClick={() => navigate("/tests/mbti")}
                    className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-3"
                  >
                    <span>✨</span> Bắt đầu trắc nghiệm MBTI
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Hướng dẫn */}
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
              <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                <span className="text-orange-500">📖</span> Hướng dẫn
              </h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span>1.</span> Đọc kỹ từng câu hỏi và chọn câu trả lời phù
                  hợp nhất.
                </li>
                <li className="flex gap-2">
                  <span>2.</span> Hãy lựa chọn nơi làm bài Test thật yên tĩnh để
                  có thể trả lời 1 cách tập trung và chuẩn nhất.
                </li>
                <li className="flex gap-2">
                  <span>3.</span> Thời gian hoàn thành dự kiến: 5 - 10 phút.
                </li>
              </ul>
            </div>

            {/* Lợi ích */}
            <div className="bg-[#0f172a] p-6 rounded-[32px] text-white">
              <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                <span className="text-blue-400">🛡️</span> Lợi ích
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-bold">Hiểu rõ bản thân</p>
                  <p className="text-slate-400 text-xs">
                    Xác định các nhóm tính cách và sở thích cốt lõi.
                  </p>
                </div>
                <div>
                  <p className="font-bold">
                    Định hướng ngành và trường đại học
                  </p>
                  <p className="text-slate-400 text-xs">
                    Gợi ý các ngành học và trường đại học phù hợp với tiềm năng.
                  </p>
                </div>
                <div>
                  <p className="font-bold">Tư vấn từ AI Mentor</p>
                  <p className="text-slate-400 text-xs">
                    Nhận phân tích chuyên sâu từ AI dựa trên kết quả của bạn.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 text-center">
              <p className="text-xs text-slate-500 italic">
                "Hơn 10,000 học sinh đã tìm thấy hướng đi đúng đắn nhờ các bài
                trắc nghiệm này."
              </p>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-16 pt-16 border-t border-slate-200">
          {activeTest === "holland" ? (
            <div className="space-y-12">
              {/* What is Holland */}
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">
                    {currentInfo.title}
                  </h2>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    {currentInfo.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {currentInfo.stats.map((stat, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm text-center"
                      >
                        <div className="text-4xl font-black text-blue-600 mb-2">
                          {stat.number}
                        </div>
                        <div className="text-slate-600 font-semibold text-sm">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-blue-600 p-10 rounded-[32px] text-white">
                  <h3 className="text-2xl font-black mb-6">
                    Lợi ích khi làm bài test
                  </h3>
                  <ul className="space-y-4">
                    {currentInfo.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex gap-3 text-sm">
                        <svg
                          className="w-5 h-5 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 6 Holland Groups */}
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 text-center">
                  6 Nhóm Tính Cách Theo Holland
                </h2>
                <p className="text-slate-600 text-center mb-10 max-w-2xl mx-auto">
                  Mỗi người thường là sự kết hợp của 2-3 nhóm, trong đó có một
                  nhóm nổi trội nhất.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(currentInfo.types).map(([code, data]) => (
                    <div
                      key={code}
                      className="bg-white p-6 rounded-[24px] border border-slate-100 hover:border-blue-400 hover:shadow-lg transition-all"
                    >
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl mb-4">
                        {code}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {data.name}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {data.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              {/* What is MBTI */}
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">
                    {currentInfo.title}
                  </h2>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    {currentInfo.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {currentInfo.stats.map((stat, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm text-center"
                      >
                        <div className="text-4xl font-black text-indigo-600 mb-2">
                          {stat.number}
                        </div>
                        <div className="text-slate-600 font-semibold text-sm">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-indigo-600 p-10 rounded-[32px] text-white">
                  <h3 className="text-2xl font-black mb-6">
                    Lợi ích khi làm bài test
                  </h3>
                  <ul className="space-y-4">
                    {currentInfo.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex gap-3 text-sm">
                        <svg
                          className="w-5 h-5 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* MBTI 4 Dimensions */}
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 text-center">
                  4 Chiều Cơ Bản Của MBTI
                </h2>
                <p className="text-slate-600 text-center mb-10 max-w-2xl mx-auto">
                  Mỗi tính cách MBTI được hình thành từ sự kết hợp của 4 chiều,
                  mỗi chiều có 2 lựa chọn trái ngược nhau.
                </p>
                <div className="grid md:grid-cols-2 gap-6 mb-10">
                  {/* Dimension 1: E vs I */}
                  <div className="bg-white p-6 rounded-[24px] border border-slate-100">
                    <h3 className="text-xl font-black text-slate-900 mb-6 text-center border-b pb-4">
                      Chiều 1: Nguồn Năng Lượng
                    </h3>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center text-red-600 font-black text-lg flex-shrink-0">
                          E
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {currentInfo.dimensions.E.full}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            {currentInfo.dimensions.E.desc}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black text-lg flex-shrink-0">
                          I
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {currentInfo.dimensions.I.full}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            {currentInfo.dimensions.I.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dimension 2: S vs N */}
                  <div className="bg-white p-6 rounded-[24px] border border-slate-100">
                    <h3 className="text-xl font-black text-slate-900 mb-6 text-center border-b pb-4">
                      Chiều 2: Nhận Thức Thông Tin
                    </h3>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-green-600 font-black text-lg flex-shrink-0">
                          S
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {currentInfo.dimensions.S.full}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            {currentInfo.dimensions.S.desc}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-black text-lg flex-shrink-0">
                          N
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {currentInfo.dimensions.N.full}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            {currentInfo.dimensions.N.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dimension 3: T vs F */}
                  <div className="bg-white p-6 rounded-[24px] border border-slate-100">
                    <h3 className="text-xl font-black text-slate-900 mb-6 text-center border-b pb-4">
                      Chiều 3: Ra Quyết Định
                    </h3>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 font-black text-lg flex-shrink-0">
                          T
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {currentInfo.dimensions.T.full}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            {currentInfo.dimensions.T.desc}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 font-black text-lg flex-shrink-0">
                          F
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {currentInfo.dimensions.F.full}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            {currentInfo.dimensions.F.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dimension 4: J vs P */}
                  <div className="bg-white p-6 rounded-[24px] border border-slate-100">
                    <h3 className="text-xl font-black text-slate-900 mb-6 text-center border-b pb-4">
                      Chiều 4: Thái Độ Sống
                    </h3>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-black text-lg flex-shrink-0">
                          J
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {currentInfo.dimensions.J.full}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            {currentInfo.dimensions.J.desc}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 font-black text-lg flex-shrink-0">
                          P
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {currentInfo.dimensions.P.full}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            {currentInfo.dimensions.P.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Example Combinations */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-[24px] border border-indigo-100">
                  <h3 className="font-black text-slate-900 mb-4">
                    Ví Dụ Về Tổ Hợp MBTI
                  </h3>
                  <p className="text-slate-700 mb-4">
                    Mỗi loại MBTI là tổ hợp của 4 chữ cái (ví dụ: INFP, ESTJ,
                    ISFJ). Có tổng cộng 16 loại tính cách khác nhau:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-700">
                    <div>ISTJ, ISFJ, INFJ, INTJ</div>
                    <div>ISTP, ISFP, INFP, INTP</div>
                    <div>ESTP, ESFP, ENFP, ENTP</div>
                    <div>ESTJ, ESFJ, ENFJ, ENTJ</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestsPage;
