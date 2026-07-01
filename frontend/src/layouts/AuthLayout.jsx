import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import mascot from "../assets/Mascot1.png";

const FLOATING_SHAPES = [
  { size: 18, top: "12%", left: "18%", duration: 5, delay: 0, shape: "circle" },
  { size: 12, top: "22%", left: "78%", duration: 6, delay: 0.6, shape: "star" },
  { size: 14, top: "68%", left: "14%", duration: 7, delay: 1.2, shape: "circle" },
  { size: 20, top: "78%", left: "72%", duration: 5.5, delay: 0.3, shape: "star" },
  { size: 10, top: "42%", left: "8%", duration: 4.5, delay: 0.9, shape: "circle" },
  { size: 16, top: "8%", left: "62%", duration: 6.5, delay: 1.5, shape: "star" },
];

const Star = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2-6.3-4.5-6.3 4.5 2.3-7.2-6-4.6h7.6z" />
  </svg>
);

const AuthLayout = ({ children }) => {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-4xl overflow-hidden rounded-[32px] shadow-2xl flex flex-col lg:flex-row bg-white">
        {/* Left: illustration panel */}
        <div className="relative hidden lg:flex lg:w-1/2 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#132347] to-orange-600 px-10 py-16">
          {/* Decorative floating shapes */}
          {FLOATING_SHAPES.map((s, i) => (
            <motion.div
              key={i}
              className="absolute text-white/40"
              style={{ top: s.top, left: s.left }}
              animate={{
                y: [0, -16, 0],
                opacity: [0.3, 0.7, 0.3],
                rotate: s.shape === "star" ? [0, 15, 0] : 0,
              }}
              transition={{
                duration: s.duration,
                delay: s.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {s.shape === "star" ? (
                <Star size={s.size} />
              ) : (
                <div
                  className="rounded-full bg-white/40"
                  style={{ width: s.size, height: s.size }}
                />
              )}
            </motion.div>
          ))}

          {/* Mascot with gentle floating motion */}
          <motion.img
            src={mascot}
            alt="caZup mascot"
            className="relative z-10 w-56 md:w-64 drop-shadow-2xl"
            animate={{ y: [0, -18, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10 mt-8 text-center">
            <h2 className="text-2xl font-black text-white leading-snug">
              Định hướng ngành học
              <br />
              cùng caZup AI
            </h2>
            <p className="mt-3 text-sm text-white/60 max-w-xs mx-auto leading-relaxed">
              Khám phá sở thích, tính cách và lộ trình học tập phù hợp nhất
              với bạn.
            </p>
          </div>
        </div>

        {/* Right: form panel */}
        <div className="w-full min-w-0 lg:w-1/2 px-6 py-10 sm:px-10 sm:py-12">
          {/* Tab header */}
          <div className="mb-8 flex items-center justify-center gap-6 text-lg">
            <Link
              to="/login"
              className={`font-bold pb-1 border-b-2 transition-colors ${
                isLogin
                  ? "text-slate-900 border-orange-500"
                  : "text-slate-300 border-transparent hover:text-slate-400"
              }`}
            >
              Đăng nhập
            </Link>
            <span className="text-slate-300">hoặc</span>
            <Link
              to="/register"
              className={`font-bold pb-1 border-b-2 transition-colors ${
                !isLogin
                  ? "text-slate-900 border-orange-500"
                  : "text-slate-300 border-transparent hover:text-slate-400"
              }`}
            >
              Đăng ký
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
