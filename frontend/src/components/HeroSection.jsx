import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-white">
      {/* Glow Effect */}
      <div className="absolute top-[-100px] h-[300px] w-[300px] rounded-full bg-purple-500/30 blur-3xl"></div>

      <div className="absolute bottom-[-100px] right-0 h-[300px] w-[300px] rounded-full bg-blue-500/20 blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-purple-400">
          AI Career Guidance Platform
        </p>

        <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl">
          Find Your
          <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            {" "}
            Perfect Career Path
          </span>
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-400">
          Discover the right major, university, and future career based on your
          personality, strengths, and academic performance.
        </p>

        {/* Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/holland"
            className="rounded-full bg-white px-8 py-4 font-semibold text-black transition hover:scale-105"
          >
            Start Holland Test
          </Link>

          <Link
            to="/recommend"
            className="rounded-full border border-white/20 px-8 py-4 font-semibold text-white transition hover:bg-white/10"
          >
            Explore Majors
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
