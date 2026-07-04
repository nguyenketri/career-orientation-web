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
    <section className="relative overflow-hidden bg-slate-50 px-4 py-20 text-slate-900 md:px-6 md:py-28">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-blue-100/30 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-orange-100/30 blur-3xl"></div>

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200/40 md:grid-cols-2 md:gap-8 md:rounded-4xl md:p-12 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group rounded-2xl p-4 text-center transition hover:bg-blue-50"
            >
              <div className="mb-4 text-5xl md:text-6xl">{stat.icon}</div>
              <h3 className="mb-3 text-4xl font-black text-blue-600 transition duration-300 group-hover:scale-110 md:text-5xl">
                {stat.number}
              </h3>
              <p className="text-lg font-bold text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
