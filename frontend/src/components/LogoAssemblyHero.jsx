import { motion, useReducedMotion } from "framer-motion";

// --- Doodle icons (thin sketch style, matches brand's blue line-art) ---

const Star = (props) => (
  <svg viewBox="0 0 40 40" fill="none" {...props}>
    <path
      d="M20 3l3.2 9.6L33 16l-9.8 3.4L20 29l-3.2-9.6L7 16l9.8-3.4L20 3z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

const Planet = (props) => (
  <svg viewBox="0 0 48 48" fill="none" {...props}>
    <circle cx="22" cy="22" r="9" stroke="currentColor" strokeWidth="1.6" />
    <ellipse
      cx="22"
      cy="24"
      rx="19"
      ry="6"
      stroke="currentColor"
      strokeWidth="1.6"
      transform="rotate(-14 22 24)"
    />
    <circle cx="38" cy="10" r="1.4" fill="currentColor" />
    <circle cx="6" cy="36" r="1" fill="currentColor" />
  </svg>
);

const Orbit = (props) => (
  <svg viewBox="0 0 44 44" fill="none" {...props}>
    <circle cx="22" cy="22" r="15" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="22" cy="22" r="15" stroke="currentColor" strokeWidth="1.4" transform="rotate(60 22 22)" />
    <circle cx="22" cy="7" r="1.8" fill="currentColor" />
    <circle cx="34" cy="29" r="1.4" fill="currentColor" />
    <circle cx="10" cy="29" r="1.2" fill="currentColor" />
  </svg>
);

const Notebook = (props) => (
  <svg viewBox="0 0 40 44" fill="none" {...props}>
    <rect x="6" y="4" width="28" height="36" rx="4" stroke="currentColor" strokeWidth="1.6" />
    <path d="M13 14h14M13 21h14M13 28h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="20" cy="4" r="2.2" fill="currentColor" />
  </svg>
);

const Wallet = (props) => (
  <svg viewBox="0 0 46 36" fill="none" {...props}>
    <rect x="2" y="6" width="42" height="26" rx="5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M2 14h42" stroke="currentColor" strokeWidth="1.6" />
    <rect x="28" y="18" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

const PaperPlane = (props) => (
  <svg viewBox="0 0 48 40" fill="none" {...props}>
    <path
      d="M2 20l44-17-13 34-8-13-13 8 2-12z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M25 21L46 3" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

// Scattered decorative pieces: [Icon, className (position + size), fromX, fromY, fromRotate, delay]
const DOODLES = [
  { Icon: Star, cls: "top-[16%] left-[30%] h-7 w-7 text-blue-400", from: { x: -60, y: -60, rotate: -90 }, delay: 0.15 },
  { Icon: Planet, cls: "top-[20%] left-[41%] h-9 w-9 text-blue-400", from: { x: 40, y: -70, rotate: 60 }, delay: 0.3 },
  { Icon: Orbit, cls: "top-[18%] left-[54%] h-8 w-8 text-blue-400", from: { x: 80, y: -50, rotate: 120 }, delay: 0.45 },
  { Icon: Notebook, cls: "top-[24%] left-[65%] h-8 w-8 text-blue-400", from: { x: 90, y: -30, rotate: -60 }, delay: 0.6 },
  { Icon: PaperPlane, cls: "top-[32%] left-[19%] h-8 w-8 text-blue-400 -rotate-6", from: { x: -100, y: -20, rotate: -140 }, delay: 0.25 },
  { Icon: PaperPlane, cls: "top-[46%] left-[70%] h-7 w-7 text-blue-300 rotate-12", from: { x: 100, y: 40, rotate: 140 }, delay: 0.75 },
  { Icon: Wallet, cls: "top-[48%] left-[26%] h-8 w-9 text-blue-400", from: { x: -90, y: 50, rotate: -40 }, delay: 0.5 },
];

const BUILDING_HEIGHTS_LEFT = [26, 46, 34, 62, 40];
const BUILDING_HEIGHTS_RIGHT = [36, 58, 30, 50, 24];

const Skyline = ({ side, heights, delay }) => (
  <motion.div
    className={`pointer-events-none absolute inset-y-0 z-10 hidden sm:flex ${side === "left" ? "left-0" : "right-0"} items-end gap-1.5 ${
      side === "left" ? "" : "flex-row-reverse"
    }`}
    initial={{ x: side === "left" ? -120 : 120, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ type: "spring", stiffness: 90, damping: 16, delay }}
  >
    {heights.map((h, i) => (
      <div
        key={i}
        className="w-6 rounded-t-sm bg-gradient-to-b from-blue-300/80 to-blue-500/90 shadow-inner sm:w-8"
        style={{ height: `${h}%` }}
      />
    ))}
  </motion.div>
);

const LogoAssemblyHero = () => {
  const prefersReducedMotion = useReducedMotion();

  // With reduced motion: skip flight paths, just fade everything into place.
  const flight = (from) =>
    prefersReducedMotion
      ? { x: 0, y: 0, rotate: 0 }
      : { x: from.x, y: from.y, rotate: from.rotate };

  return (
    <div className="relative mx-auto mb-14 h-[400px] w-full max-w-7xl overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-b from-sky-50 via-blue-50 to-blue-100 shadow-xl shadow-blue-100/70 sm:h-[440px] md:aspect-[21/9] md:h-auto md:mb-20">
      {/* Ambient glow blobs */}
      <div className="absolute -top-10 left-1/4 h-40 w-40 rounded-full bg-white/50 blur-3xl" />
      <div className="absolute top-10 right-10 h-32 w-32 rounded-full bg-orange-100/60 blur-3xl" />

      {/* Skyline silhouettes assembling from left/right */}
      <Skyline side="left" heights={BUILDING_HEIGHTS_LEFT} delay={0.05} />
      <Skyline side="right" heights={BUILDING_HEIGHTS_RIGHT} delay={0.05} />

      {/* Bottom wave rising into place */}
      <motion.div
        className="absolute inset-x-[-5%] bottom-0 h-[38%] rounded-t-[100%] bg-gradient-to-b from-blue-400 to-blue-600"
        initial={{ y: "60%" }}
        animate={{ y: "0%" }}
        transition={{ type: "spring", stiffness: 70, damping: 18, delay: 0.1 }}
      />

      {/* Floating doodle pieces flying in from off-frame */}
      {DOODLES.map(({ Icon, cls, from, delay }, i) => (
        <motion.div
          key={i}
          className={`absolute ${cls}`}
          initial={{ opacity: 0, scale: 0.4, ...flight(from) }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 110, damping: 13, delay }}
        >
          <motion.div
            animate={
              prefersReducedMotion
                ? {}
                : { y: [0, -8, 0], rotate: [0, 3, 0] }
            }
            transition={{
              duration: 3 + (i % 3) * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: delay + 0.9,
            }}
          >
            <Icon />
          </motion.div>
        </motion.div>
      ))}

      {/* Wordmark assembly: "c" + fox mascot (as the "a") + "Zup" = brand name "caZup" */}
      <div className="absolute left-1/2 top-[44%] z-20 flex -translate-x-1/2 -translate-y-1/2 items-center">
        <motion.span
          className="text-3xl font-black text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -140, rotate: prefersReducedMotion ? 0 : -20 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 14, delay: 0.55 }}
        >
          c
        </motion.span>

        <motion.div
          className="relative -mx-1 h-9 w-9 sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-20 lg:w-20"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -160, rotate: prefersReducedMotion ? 0 : -180, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 90, damping: 11, delay: 0.85 }}
        >
          <motion.img
            src="/logoCazup.png"
            alt="caZup"
            className="h-full w-full object-contain drop-shadow-lg"
            animate={prefersReducedMotion ? {} : { y: [0, -5, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 1.7 }}
          />
        </motion.div>

        <motion.span
          className="text-3xl font-black text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 140, rotate: prefersReducedMotion ? 0 : 20 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 14, delay: 0.55 }}
        >
          Zup
        </motion.span>
      </div>

      {/* Tagline pill sliding up after the wordmark settles */}
      <motion.p
        className="absolute left-1/2 top-[68%] z-20 w-[88%] max-w-md -translate-x-1/2 rounded-full border-2 border-white bg-orange-500 px-4 py-2 text-center text-xs font-black leading-snug text-white shadow-lg shadow-orange-500/30 sm:w-auto sm:max-w-none sm:whitespace-nowrap sm:px-6 sm:text-lg md:text-2xl"
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 16, delay: 1.25 }}
      >
        Giải pháp định hướng ngành học toàn diện
      </motion.p>
    </div>
  );
};

export default LogoAssemblyHero;
