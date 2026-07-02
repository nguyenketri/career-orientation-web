// Metadata & tiện ích cho 6 nhóm sở thích Holland (RIASEC)
// Dùng cho trang Lịch sử Holland và Báo cáo chi tiết (Career Compass).

export const HOLLAND_META = {
  R: {
    short: "Realistic",
    vi: "Kỹ thuật",
    role: "Người Thực Thi — ưa thích công việc thực hành, cụ thể với công cụ.",
    strength: "Tư duy Kỹ thuật",
    color: "#2563eb",
    icon: "🔧",
  },
  I: {
    short: "Investigative",
    vi: "Nghiên cứu",
    role: "Người Nghiên Cứu — thích phân tích, quan sát và giải quyết vấn đề.",
    strength: "Tư duy Phân tích",
    color: "#0d9488",
    icon: "🔬",
  },
  A: {
    short: "Artistic",
    vi: "Nghệ thuật",
    role: "Người Sáng Tạo — đề cao trực giác, sự độc đáo và thể hiện bản thân.",
    strength: "Óc Sáng tạo",
    color: "#f97316",
    icon: "🎨",
  },
  S: {
    short: "Social",
    vi: "Xã hội",
    role: "Người Trợ Giúp — thiên về giảng dạy, chăm sóc và giao tiếp.",
    strength: "Đồng cảm cao",
    color: "#16a34a",
    icon: "🤝",
  },
  E: {
    short: "Enterprising",
    vi: "Quản lý",
    role: "Người Quản Lý — thích lãnh đạo, thuyết phục và hướng tới kết quả.",
    strength: "Khả năng Lãnh đạo",
    color: "#dc2626",
    icon: "📈",
  },
  C: {
    short: "Conventional",
    vi: "Nghiệp vụ",
    role: "Người Nghiệp Vụ — thích dữ liệu, con số, quy tắc và sự ngăn nắp.",
    strength: "Tính Tổ chức",
    color: "#4f46e5",
    icon: "📊",
  },
};

// Nghề tiêu biểu theo CẶP nhóm (2 chữ đầu, đã sắp xếp A→Z)
const COMBO_CAREERS = {
  AI: "Kiến trúc sư Sáng tạo",
  AR: "Nhà Thiết kế Công nghiệp",
  AS: "Chuyên viên Trị liệu Nghệ thuật",
  AE: "Giám đốc Sáng tạo",
  AC: "Chuyên viên Thiết kế Đồ họa",
  IR: "Kỹ sư Nghiên cứu (Bio-Engineer)",
  IS: "Chuyên viên Tâm lý học",
  IE: "Chuyên viên Phân tích Chiến lược",
  CI: "Nhà Khoa học Dữ liệu",
  ES: "Chuyên viên Truyền thông / PR",
  CE: "Chuyên viên Phân tích Kinh doanh",
  CS: "Chuyên viên Nhân sự",
  ER: "Quản lý Dự án Kỹ thuật",
  RS: "Kỹ thuật viên Y sinh",
  CR: "Chuyên viên Vận hành / Logistics",
};

const PRIMARY_CAREERS = {
  R: "Kỹ sư / Kỹ thuật viên",
  I: "Nhà Nghiên cứu / Nhà Khoa học",
  A: "Nhà Thiết kế / Sáng tạo",
  S: "Chuyên viên Tư vấn / Giáo dục",
  E: "Quản lý / Khởi nghiệp",
  C: "Chuyên viên Kế toán / Phân tích",
};

const comboKey = (a, b) => [a, b].filter(Boolean).sort().join("");

const comboCareer = (a, b) =>
  a && b ? COMBO_CAREERS[comboKey(a, b)] : null;

// "Social - Investigative - Artistic"
export const formatHollandCode = (topTypes = []) =>
  (topTypes || []).map((t) => HOLLAND_META[t]?.short || t).join(" - ") || "—";

// Mã ngắn "ASR"
export const hollandCodeLetters = (topTypes = []) =>
  (topTypes || []).slice(0, 3).join("") || "—";

// Nghề gợi ý chính (dùng cho danh sách "Past Attempts")
export const getPrimaryCareer = (topTypes = []) => {
  if (!topTypes?.length) return "Đang phân tích";
  return (
    comboCareer(topTypes[0], topTypes[1]) ||
    PRIMARY_CAREERS[topTypes[0]] ||
    "Chuyên viên"
  );
};

// Các thẻ thế mạnh (chip) từ top types
export const getStrengths = (topTypes = []) =>
  (topTypes || [])
    .slice(0, 2)
    .map((t) => HOLLAND_META[t]?.strength)
    .filter(Boolean);

// Mức độ đồng nhất (congruence) dựa trên tỉ trọng 3 nhóm cao nhất
export const getCongruence = (hollandScores = {}) => {
  const vals = Object.values(hollandScores || {})
    .map(Number)
    .filter((v) => !isNaN(v));
  if (!vals.length) return { label: "Đang phân tích", level: "low" };
  const sorted = [...vals].sort((a, b) => b - a);
  const total = sorted.reduce((a, b) => a + b, 0) || 1;
  const top3Share = (sorted.slice(0, 3).reduce((a, b) => a + b, 0) / total) * 100;
  if (top3Share >= 62) return { label: "Đồng nhất cao", level: "high" };
  if (top3Share >= 52) return { label: "Đồng nhất khá", level: "mid" };
  return { label: "Đa dạng", level: "low" };
};

// 3 gợi ý nghề nghiệp kèm % phù hợp (cho phần AI Mentorship Recommendations)
export const getCareerRecommendations = (topTypes = [], hollandScores = {}) => {
  const t0 = topTypes[0];
  const t1 = topTypes[1];
  const t2 = topTypes[2];
  const total =
    Object.values(hollandScores || {}).reduce(
      (a, b) => a + Number(b || 0),
      0,
    ) || 1;
  const share = (t) => Number(hollandScores?.[t] || 0) / total;
  const base = 86 + Math.round(share(t0) * 30); // ~86–98

  const build = (title, involved, offset, tag, tagColor) => ({
    title,
    involved: involved.filter(Boolean),
    desc: `Kết hợp thế mạnh ${involved
      .filter(Boolean)
      .map((t) => HOLLAND_META[t]?.vi)
      .join(" & ")} — hướng phát triển phù hợp với hồ sơ tính cách của bạn.`,
    match: Math.max(70, Math.min(98, base - offset)),
    tag,
    tagColor,
  });

  return [
    build(getPrimaryCareer(topTypes), [t0, t1], 0, "Phù hợp nhất", "green"),
    build(
      comboCareer(t1, t2) || PRIMARY_CAREERS[t1] || PRIMARY_CAREERS[t0],
      [t1, t2],
      6,
      "Nhu cầu cao",
      "blue",
    ),
    build(
      comboCareer(t0, t2) || PRIMARY_CAREERS[t2] || PRIMARY_CAREERS[t0],
      [t0, t2],
      11,
      "Tiềm năng",
      "purple",
    ),
  ];
};
