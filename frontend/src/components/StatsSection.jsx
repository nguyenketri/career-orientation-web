const stats = [
  {
    number: "10K+",
    label: "Students Guided",
  },
  {
    number: "95%",
    label: "Recommendation Accuracy",
  },
  {
    number: "200+",
    label: "Universities Supported",
  },
  {
    number: "50+",
    label: "Career Categories",
  },
];

const StatsSection = () => {
  return (
    <section className="bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Stats */}
        <div className="mb-24 grid gap-8 rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-lg md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <h3 className="mb-2 text-4xl font-bold text-purple-400 md:text-5xl">
                {stat.number}
              </h3>

              <p className="text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="relative overflow-hidden rounded-[40px] border border-purple-500/20 bg-gradient-to-r from-purple-600/20 to-blue-600/20 px-8 py-20 text-center">
          {/* Glow */}
          <div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl"></div>

          <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl"></div>

          {/* Content */}
          <div className="relative z-10">
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-purple-300">
              Start Your Journey
            </p>

            <h2 className="mb-6 text-4xl font-bold md:text-6xl">
              Discover Your Future Career Today
            </h2>

            <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-300">
              Take the Holland Test and receive AI-powered recommendations for
              majors and universities that match your strengths.
            </p>

            <button className="rounded-full bg-white px-8 py-4 font-semibold text-black transition hover:scale-105">
              Get Started Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
