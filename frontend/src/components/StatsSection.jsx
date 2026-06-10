import { Link } from "react-router-dom";

const stats = [
  {
    number: "10K+",
    label: "Học sinh hài lòng",
    icon: "👥",
  },
  {
    number: "95%",
    label: "Độ chính xác gợi ý",
    icon: "🎯",
  },
  {
    number: "200+",
    label: "Trường đại học",
    icon: "🏫",
  },
  {
    number: "50+",
    label: "Ngành học được phân tích",
    icon: "📚",
  },
];

const StatsSection = () => {
  return (
    <section className="relative bg-slate-50 px-4 md:px-6 py-20 md:py-32 text-slate-900 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl -z-10"></div>

      <div className="mx-auto max-w-7xl">
        {/* Stats Grid */}
        <div className="mb-20 md:mb-32 grid gap-6 md:gap-8 rounded-3xl md:rounded-4xl border border-slate-100 bg-white p-8 md:p-12 shadow-2xl shadow-slate-200/40 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group text-center p-4 rounded-2xl transition hover:bg-blue-50"
            >
              <div className="mb-4 text-4xl md:text-6xl">{stat.icon}</div>
              <h3 className="mb-3 text-3xl md:text-5xl font-black text-blue-600 group-hover:scale-110 transition duration-300">
                {stat.number}
              </h3>
              <p className="text-slate-600 font-bold text-base md:text-lg">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="relative overflow-hidden rounded-3xl md:rounded-4xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-6 md:px-12 py-16 md:py-24 text-center text-white shadow-2xl shadow-slate-900/50">
          {/* Animated Background Elements */}
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>

          {/* Content */}
          <div className="relative z-10">
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-blue-200 font-bold">
              ⚡ Bước tiếp theo của bạn
            </p>

            <h2 className="mb-6 text-3xl md:text-5xl lg:text-6xl font-black leading-tight">
              Khám phá ngành học phù hợp
              <span className="block mt-2 bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                với năng lực của bạn
              </span>
            </h2>

            <p className="mx-auto mb-10 max-w-3xl text-base md:text-lg text-blue-100 font-medium leading-relaxed">
              Thực hiện bài trắc nghiệm Holland và MBTI để hiểu rõ hơn về bản
              thân. Nhận gợi ý từ AI về các ngành học, trường đại học, và con
              đường học tập tương lai phù hợp nhất với bạn.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/tests"
                className="inline-block w-full sm:w-auto text-center rounded-full bg-white px-8 md:px-10 py-4 font-bold text-blue-900 transition hover:scale-105 hover:shadow-2xl shadow-lg"
              >
                Bắt đầu trắc nghiệm
              </Link>
              <Link
                to="/mentor"
                className="inline-block w-full sm:w-auto text-center rounded-full bg-blue-500/20 border-2 border-blue-300 px-8 md:px-10 py-4 font-bold text-white transition hover:bg-blue-500/40 hover:border-blue-200"
              >
                Tư vấn với AI
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
