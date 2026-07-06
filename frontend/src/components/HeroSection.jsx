import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import LogoAssemblyHero from "./LogoAssemblyHero";

const WALK_RANGE = 55; // px fox travels to each side inside the card
const WALK_TIMES = [0, 0.46, 0.5, 0.96, 1]; // walk right, quick turn, walk left, quick turn

const HeroSection = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white px-6 pt-16 pb-24 md:pt-24 md:pb-32">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-200/30 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <LogoAssemblyHero />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:items-center">
        {/* Text Content */}
        <div className="text-center lg:text-left">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-600">
            🚀 Nền tảng định hướng ngành học bằng AI
          </span>

          <h1 className="mb-6 text-4xl font-black leading-tight text-slate-900 text-balance md:text-5xl xl:text-6xl">
            Định hướng tương lai,
            <span className="block text-orange-500">Chạm tới ước mơ</span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-slate-500 lg:mx-0">
            Khám phá lộ trình học tập tối ưu cùng caZup. Chúng tôi giúp bạn lựa
            chọn ngành học và trường đại học phù hợp nhất dựa trên tính cách,
            năng lực và đam mê của bản thân.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
            <Link
              to="/tests"
              className="w-full rounded-full bg-orange-500 px-8 py-4 text-center font-bold text-white shadow-lg shadow-orange-200 transition hover:scale-105 hover:bg-orange-600 sm:w-auto"
            >
              Khám phá ngay →
            </Link>
            <Link
              to="/recommend"
              className="w-full rounded-full bg-blue-50 px-8 py-4 text-center font-bold text-blue-600 transition hover:bg-blue-100 sm:w-auto"
            >
              Khám phá ngành học
            </Link>
          </div>
        </div>

        {/* Visual */}
        <div className="relative mx-auto max-w-md lg:max-w-none">
          <div className="overflow-hidden rounded-[32px] border border-blue-100 bg-gradient-to-br from-blue-50 to-orange-50 p-10 shadow-2xl shadow-blue-100 md:p-14">
            <div className="relative flex h-56 items-end justify-center sm:h-64">
              {/* Fox walking back and forth across the card */}
              <motion.div
                className="relative"
                animate={
                  prefersReducedMotion
                    ? {}
                    : { x: [-WALK_RANGE, WALK_RANGE, WALK_RANGE, -WALK_RANGE, -WALK_RANGE] }
                }
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: WALK_TIMES,
                }}
              >
                {/* Ground shadow, squashes with each footstep */}
                <motion.div
                  className="absolute -bottom-1 left-1/2 h-3 w-24 -translate-x-1/2 rounded-full bg-slate-900/15 blur-sm"
                  animate={
                    prefersReducedMotion
                      ? {}
                      : { scaleX: [1, 0.75, 1], opacity: [0.45, 0.25, 0.45] }
                  }
                  transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Flips to face its walking direction */}
                <motion.div
                  animate={
                    prefersReducedMotion
                      ? {}
                      : { scaleX: [1, 1, -1, -1, 1] }
                  }
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: WALK_TIMES,
                  }}
                >
                  {/* Footstep bob */}
                  <motion.img
                    src="/logoCazup.png"
                    alt="caZup - Nền tảng định hướng ngành học AI"
                    className="h-auto max-h-56 w-auto object-contain drop-shadow-xl sm:max-h-64"
                    animate={prefersReducedMotion ? {} : { y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              </motion.div>
            </div>
            <p className="mt-4 text-center text-3xl font-black tracking-tight text-slate-900">
              ca<span className="text-orange-500">Z</span>up
            </p>
          </div>

          {/* Floating stat badge */}
          <div className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-3 shadow-xl shadow-slate-200/60 sm:-left-8">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-500 text-lg text-white">
              🎓
            </div>
            <div>
              <p className="text-sm font-black leading-none text-slate-900">
                10.000+
              </p>
              <p className="text-[11px] font-medium text-slate-500">
                học sinh tin dùng
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
