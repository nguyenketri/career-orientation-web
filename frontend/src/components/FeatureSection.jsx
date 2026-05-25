import { Link } from "react-router-dom";

const features = [
  {
    title: "AI Career Mentor",
    description:
      "Chat with our intelligent AI advisor to get instant answers about universities, majors, and career paths.",
    icon: "🤖",
    link: "/mentor",
  },
  {
    title: "Holland & MBTI Tests",
    description:
      "Deep dive into your personality with professional Holland and MBTI assessments mapped to real careers.",
    icon: "🧠",
    links: ["/holland", "/mbti"],
  },
  {
    title: "University Matching",
    description:
      "Calculate your subject combination scores and find the perfect match among hundreds of universities.",
    icon: "🎓",
    link: "/recommend",
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
          {features.map((feature, index) => {
            const links = feature.links || [feature.link];
            return (
              <Link
                key={index}
                to={links[0]}
                className="group rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg transition hover:-translate-y-2 hover:border-purple-500/30 cursor-pointer"
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
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
