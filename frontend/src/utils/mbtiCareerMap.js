// Tiện ích cho trang Lịch sử MBTI và Báo cáo chi tiết tính cách.
import { mbtiMaps } from "./mbtiMap";

// Lấy biệt danh tiếng Anh từ tên VN: "Người Bênh Vực (Advocate)" -> "Advocate"
export const getNickname = (type) => {
  const name = mbtiMaps[type]?.name || "";
  const m = name.match(/\(([^)]+)\)/);
  return m ? m[1] : type || "";
};

// Tên tiếng Việt (bỏ phần trong ngoặc)
export const getViName = (type) =>
  (mbtiMaps[type]?.name || type || "").replace(/\s*\([^)]*\)\s*/, "").trim();

// 4 chiều MBTI + mô tả mặt trội
export const MBTI_DIMENSIONS = [
  {
    a: "E",
    b: "I",
    aLabel: "Hướng ngoại",
    bLabel: "Hướng nội",
    aDesc: "Bạn nạp năng lượng từ tương tác xã hội và môi trường bên ngoài.",
    bDesc: "Bạn nạp năng lượng từ thế giới nội tâm và những khoảng lặng.",
  },
  {
    a: "N",
    b: "S",
    aLabel: "Trực giác",
    bLabel: "Giác quan",
    aDesc: "Bạn tập trung vào ý tưởng, khả năng và bức tranh tương lai.",
    bDesc: "Bạn chú trọng chi tiết cụ thể, thực tế và hiện tại.",
  },
  {
    a: "F",
    b: "T",
    aLabel: "Cảm xúc",
    bLabel: "Lý trí",
    aDesc: "Bạn coi trọng sự hài hòa và tác động của quyết định tới con người.",
    bDesc: "Bạn ra quyết định dựa trên logic và tính khách quan.",
  },
  {
    a: "J",
    b: "P",
    aLabel: "Nguyên tắc",
    bLabel: "Linh hoạt",
    aDesc: "Bạn thích kế hoạch rõ ràng, có tổ chức và sự quyết đoán.",
    bDesc: "Bạn thích sự tự do, linh hoạt và giữ nhiều lựa chọn mở.",
  },
];

// Phân tích 4 chiều từ điểm số -> mặt trội, %, mô tả
export const getTraitBreakdown = (scores = {}) =>
  MBTI_DIMENSIONS.map((d) => {
    const av = Number(scores[d.a] || 0);
    const bv = Number(scores[d.b] || 0);
    const total = av + bv || 1;
    const aPct = Math.round((av / total) * 100);
    const bPct = 100 - aPct;
    const aDom = aPct >= bPct;
    return {
      domLetter: aDom ? d.a : d.b,
      domLabel: aDom ? d.aLabel : d.bLabel,
      domPct: aDom ? aPct : bPct,
      subLetter: aDom ? d.b : d.a,
      subLabel: aDom ? d.bLabel : d.aLabel,
      subPct: aDom ? bPct : aPct,
      desc: aDom ? d.aDesc : d.bDesc,
    };
  });

// Nghề nghiệp theo 2 chữ giữa của MBTI (NF/NT/SF/ST) — phủ đủ 16 nhóm
const GROUP_CAREERS = {
  NF: [
    { role: "Chuyên viên Tư vấn Tâm lý", comp: "VERY_HIGH", salary: "12–20 triệu", growth: 4 },
    { role: "Giám đốc Sáng tạo / Truyền thông", comp: "HIGH", salary: "25–45 triệu", growth: 5 },
    { role: "Doanh nhân Xã hội", comp: "VERY_HIGH", salary: "Linh hoạt", growth: 4 },
  ],
  NT: [
    { role: "Chuyên gia Chiến lược / Phân tích", comp: "VERY_HIGH", salary: "20–40 triệu", growth: 5 },
    { role: "Kỹ sư / Kiến trúc sư Hệ thống", comp: "HIGH", salary: "18–35 triệu", growth: 4 },
    { role: "Nhà Khoa học Dữ liệu", comp: "VERY_HIGH", salary: "20–45 triệu", growth: 5 },
  ],
  SF: [
    { role: "Chuyên viên Y tế / Chăm sóc", comp: "VERY_HIGH", salary: "12–25 triệu", growth: 4 },
    { role: "Giáo viên / Đào tạo", comp: "HIGH", salary: "10–20 triệu", growth: 3 },
    { role: "Chuyên viên Thiết kế Dịch vụ", comp: "HIGH", salary: "12–28 triệu", growth: 4 },
  ],
  ST: [
    { role: "Chuyên viên Tài chính / Kế toán", comp: "VERY_HIGH", salary: "15–30 triệu", growth: 4 },
    { role: "Quản lý Vận hành / Dự án", comp: "HIGH", salary: "20–40 triệu", growth: 4 },
    { role: "Kỹ thuật viên / Kỹ sư", comp: "HIGH", salary: "15–30 triệu", growth: 4 },
  ],
};

export const COMPAT_LABEL = {
  VERY_HIGH: { text: "Rất cao", cls: "bg-emerald-100 text-emerald-700" },
  HIGH: { text: "Cao", cls: "bg-blue-100 text-blue-700" },
  MEDIUM: { text: "Trung bình", cls: "bg-amber-100 text-amber-700" },
};

export const getMbtiCareers = (type = "") => {
  const g = (type[1] || "N") + (type[2] || "F");
  return GROUP_CAREERS[g] || GROUP_CAREERS.NF;
};

// Lời khuyên AI (ưu tiên aiAnalysis đã lưu, nếu không thì sinh mẫu)
export const getMbtiInsight = (type, result) => {
  if (result?.aiAnalysis) return result.aiAnalysis;
  const nick = getNickname(type);
  const t = getTraitBreakdown(result?.scores || {});
  const strong = t[1]?.domLabel || "Trực giác";
  return `Là một ${nick} (${type}), bạn có tiềm năng lớn ở những vai trò cần ${t[0]?.domLabel?.toLowerCase()} và ${strong.toLowerCase()}. Hãy chọn ngành cho phép khám phá nhiều lĩnh vực và tạo tác động tới con người — đó là nơi bạn tỏa sáng nhất.`;
};

export const getMbtiNextSteps = (type = "") => [
  `Khám phá các ngành phù hợp với nhóm ${getNickname(type)}.`,
  "Làm bài trắc nghiệm sở thích Holland để thu hẹp lựa chọn ngành.",
  "Trò chuyện với caZup AI Mentor để lên lộ trình học tập cá nhân hoá.",
];
