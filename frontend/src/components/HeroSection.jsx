import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-gradient-to-b from-blue-50 to-white px-6 pt-20 pb-20 text-slate-900">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/30 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-200/30 blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl text-center">
        {/* Banner Image */}
        <div className="mb-10 overflow-hidden rounded-2xl shadow-2xl shadow-blue-100 border border-blue-50">
          <img
            src="/banner.png"
            alt="caZup - Giải pháp hướng ngành học toàn diện"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Simplified Text (Optional, keeping it subtle for SEO and context) */}
        <p className="mx-auto mb-10 max-w-2xl text-lg md:text-xl text-slate-600 leading-relaxed px-4">
          Nền tảng AI giúp bạn tìm kiếm ngành học và trường đại học phù hợp nhất
          dựa trên tính cách và năng lực bản thân.
        </p>

        {/* Buttons */}
        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
          <Link
            to="/tests"
            className="rounded-full bg-blue-600 px-10 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 hover:scale-105"
          >
            Bắt đầu ngay
          </Link>

          <Link
            to="/recommend"
            className="rounded-full bg-white border-2 border-blue-100 px-10 py-4 font-bold text-blue-600 transition hover:bg-blue-50 hover:border-blue-200"
          >
            Khám phá ngành học
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
