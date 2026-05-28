import { Link } from "react-router-dom";

const stats = [
  {
    number: "10K+",
    label: "Học sinh được hướng dẫn",
  },
  {
    number: "95%",
    label: "Độ chính xác gợi ý",
  },
  {
    number: "200+",
    label: "Trường đại học hỗ trợ",
  },
  {
    number: "50+",
    label: "Nhóm ngành nghề",
  },
];

const StatsSection = () => {
  return (
    <section className="bg-slate-50 px-6 py-24 text-slate-900">
      <div className="mx-auto max-w-7xl">
        {/* Stats */}
        <div className="mb-24 grid gap-8 rounded-[40px] border border-slate-100 bg-white p-10 shadow-xl shadow-slate-200/50 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <h3 className="mb-2 text-4xl font-black text-blue-600 md:text-5xl">
                {stat.number}
              </h3>

              <p className="text-slate-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-20 text-center text-white shadow-2xl shadow-blue-200">
          {/* Glow */}
          <div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-white/20 blur-3xl"></div>

          <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-indigo-400/20 blur-3xl"></div>

          {/* Content */}
          <div className="relative z-10">
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-blue-100 font-bold">
              Bắt đầu hành trình của bạn
            </p>

            <h2 className="mb-6 text-4xl font-black md:text-6xl">
              Khám phá sự nghiệp tương lai ngay hôm nay
            </h2>

            <p className="mx-auto mb-10 max-w-2xl text-lg text-blue-50 font-medium">
              Thực hiện bài trắc nghiệm Holland và nhận gợi ý từ AI về các ngành
              học và trường đại học phù hợp với thế mạnh của bạn.
            </p>

            <Link
              to="/holland"
              className="inline-block rounded-full bg-white px-8 py-4 font-black text-blue-600 transition hover:scale-105 shadow-lg"
            >
              Bắt đầu ngay
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
