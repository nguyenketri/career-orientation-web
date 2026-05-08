const features = [
  {
    title: "AI Career Recommendation",
    description:
      "Get personalized major and career suggestions based on your academic performance and interests.",
    icon: "🤖",
  },
  {
    title: "Holland Personality Test",
    description:
      "Discover your personality type and explore careers that truly fit your strengths.",
    icon: "🧠",
  },
  {
    title: "University Matching",
    description:
      "Find universities and majors that match your scores and future goals.",
    icon: "🎓",
  },
];

const FeatureSection = () => {
  return (
    <section className="bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-purple-400">
            Features
          </p>

          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            Everything You Need To
            <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              {" "}
              Choose Your Future
            </span>
          </h2>

          <p className="mx-auto max-w-2xl text-gray-400">
            Our platform helps students discover suitable majors, universities,
            and career paths with AI-powered guidance.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg transition hover:-translate-y-2 hover:border-purple-500/30"
            >
              {/* Icon */}
              <div className="mb-6 text-5xl">{feature.icon}</div>

              {/* Title */}
              <h3 className="mb-4 text-2xl font-semibold">{feature.title}</h3>

              {/* Description */}
              <p className="leading-relaxed text-gray-400">
                {feature.description}
              </p>

              {/* Hover line */}
              <div className="mt-6 h-1 w-0 bg-gradient-to-r from-purple-400 to-blue-500 transition-all duration-300 group-hover:w-full"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
