// data/seed/data.majors.js
// Danh sách ngành học (dữ liệu thật, cập nhật mặt bằng tuyển sinh 2023-2025).
//
// Các field phục vụ sinh dữ liệu:
// - baseScore : điểm chuẩn "mặt bằng" của ngành trên thang 30 (điểm thực tế mỗi trường = baseScore + scoreAdj của trường + nhiễu nhỏ)
// - scoreTrend: mức điểm 2025 cao hơn 2023 bao nhiêu (dùng dựng lịch sử 2023/2024/2025)
// - feeMult   : hệ số học phí so với học phí cơ sở của trường (Y/Dược để 1.0 vì baseTuition trường đã cao)
// - domains   : lĩnh vực -> quyết định trường nào mở ngành
// - popularity: 'high' ngành hot (nhiều trường mở, điểm nhỉnh hơn), 'mid', 'niche'
//
// LƯU Ý: 21 ngành đầu giữ ĐÚNG "name" như trong DB để upsert khớp _id (không phá reference test đã lưu).
// benchmarkScore = baseScore (điểm chuẩn tối thiểu tham chiếu). tuitionFee = học phí tiêu biểu VNĐ/năm.

module.exports = [
  // ================= CÔNG NGHỆ THÔNG TIN & MÁY TÍNH =================
  {
    name: "Công nghệ Thông tin",
    description: "Chuyên nghiên cứu phần mềm, mạng máy tính và hệ thống thông tin.",
    baseScore: 25.5, scoreTrend: 1.2, feeMult: 1.1, popularity: "high",
    hollandTypes: ["I", "R", "C"], mbtiTypes: ["INTJ", "INTP", "ISTJ"],
    subjectCombinations: ["A00", "A01", "D01", "D07"], domains: ["tech"], tuitionFee: 30000000,
  },
  {
    name: "Khoa học Máy tính",
    description: "Nghiên cứu lý thuyết tính toán, thuật toán và kiến trúc máy tính.",
    baseScore: 26.5, scoreTrend: 1.3, feeMult: 1.15, popularity: "high",
    hollandTypes: ["I", "R"], mbtiTypes: ["INTJ", "INTP"],
    subjectCombinations: ["A00", "A01", "D07"], domains: ["tech"], tuitionFee: 34000000,
  },
  {
    name: "Kỹ thuật Phần mềm",
    description: "Quy trình xây dựng, vận hành và bảo trì phần mềm chất lượng cao.",
    baseScore: 25.5, scoreTrend: 1.1, feeMult: 1.1, popularity: "high",
    hollandTypes: ["I", "R", "C"], mbtiTypes: ["ISTJ", "INTJ"],
    subjectCombinations: ["A00", "A01", "D01"], domains: ["tech"], tuitionFee: 30000000,
  },
  {
    name: "An toàn Thông tin",
    description: "Bảo vệ hệ thống thông tin khỏi các cuộc tấn công mạng.",
    baseScore: 25.8, scoreTrend: 1.0, feeMult: 1.1, popularity: "high",
    hollandTypes: ["I", "R"], mbtiTypes: ["ISTP", "INTJ"],
    subjectCombinations: ["A00", "A01", "D07"], domains: ["tech"], tuitionFee: 32000000,
  },
  {
    name: "Trí tuệ Nhân tạo",
    description: "Nghiên cứu học máy, thị giác máy tính và xử lý ngôn ngữ tự nhiên.",
    baseScore: 26.8, scoreTrend: 1.4, feeMult: 1.2, popularity: "high",
    hollandTypes: ["I", "R"], mbtiTypes: ["INTJ", "INTP"],
    subjectCombinations: ["A00", "A01", "D07"], domains: ["tech"], tuitionFee: 38000000,
  },
  {
    name: "Khoa học Dữ liệu",
    description: "Phân tích dữ liệu lớn, thống kê và mô hình học máy để ra quyết định.",
    baseScore: 25.8, scoreTrend: 1.2, feeMult: 1.15, popularity: "high",
    hollandTypes: ["I", "C"], mbtiTypes: ["INTJ", "INTP", "ISTJ"],
    subjectCombinations: ["A00", "A01", "D07"], domains: ["tech"], tuitionFee: 34000000,
  },
  {
    name: "Hệ thống Thông tin",
    description: "Phân tích, thiết kế và quản trị hệ thống thông tin doanh nghiệp.",
    baseScore: 24.5, scoreTrend: 1.0, feeMult: 1.05, popularity: "mid",
    hollandTypes: ["C", "I"], mbtiTypes: ["ISTJ", "INTJ"],
    subjectCombinations: ["A00", "A01", "D01"], domains: ["tech"], tuitionFee: 28000000,
  },
  {
    name: "Thương mại Điện tử",
    description: "Kết hợp kinh doanh và công nghệ để vận hành nền tảng thương mại số.",
    baseScore: 25.2, scoreTrend: 1.1, feeMult: 1.05, popularity: "high",
    hollandTypes: ["E", "C", "I"], mbtiTypes: ["ENTJ", "ESTJ", "ENTP"],
    subjectCombinations: ["A00", "A01", "D01"], domains: ["tech", "business"], tuitionFee: 28000000,
  },

  // ================= KỸ THUẬT =================
  {
    name: "Kỹ thuật Cơ điện tử",
    description: "Kết hợp cơ khí, điện tử và khoa học máy tính trong tự động hóa.",
    baseScore: 24.0, scoreTrend: 0.8, feeMult: 1.0, popularity: "mid",
    hollandTypes: ["R", "I"], mbtiTypes: ["ISTP", "ISTJ", "ESTP"],
    subjectCombinations: ["A00", "A01"], domains: ["engineering"], tuitionFee: 26000000,
  },
  {
    name: "Kỹ thuật Điện - Điện tử",
    description: "Thiết kế và vận hành các hệ thống điện, mạch điện tử.",
    baseScore: 23.5, scoreTrend: 0.7, feeMult: 1.0, popularity: "mid",
    hollandTypes: ["R", "I"], mbtiTypes: ["ISTP", "ISTJ"],
    subjectCombinations: ["A00", "A01"], domains: ["engineering"], tuitionFee: 24000000,
  },
  {
    name: "Kỹ thuật Điều khiển & Tự động hóa",
    description: "Điều khiển tự động, robot và hệ thống sản xuất thông minh.",
    baseScore: 24.5, scoreTrend: 0.9, feeMult: 1.0, popularity: "mid",
    hollandTypes: ["R", "I"], mbtiTypes: ["ISTP", "INTJ"],
    subjectCombinations: ["A00", "A01"], domains: ["engineering"], tuitionFee: 26000000,
  },
  {
    name: "Kỹ thuật Ô tô",
    description: "Thiết kế, chế tạo và bảo dưỡng ô tô, xe điện.",
    baseScore: 23.5, scoreTrend: 0.7, feeMult: 1.0, popularity: "mid",
    hollandTypes: ["R", "I"], mbtiTypes: ["ISTP", "ESTP"],
    subjectCombinations: ["A00", "A01"], domains: ["engineering"], tuitionFee: 26000000,
  },
  {
    name: "Kỹ thuật Xây dựng",
    description: "Thiết kế, thi công và quản lý công trình dân dụng, công nghiệp.",
    baseScore: 21.0, scoreTrend: 0.6, feeMult: 1.0, popularity: "mid",
    hollandTypes: ["R", "C"], mbtiTypes: ["ISTJ", "ISTP"],
    subjectCombinations: ["A00", "A01", "D01"], domains: ["engineering"], tuitionFee: 22000000,
  },
  {
    name: "Kiến trúc",
    description: "Thiết kế không gian, công trình kiến trúc và quy hoạch.",
    baseScore: 23.0, scoreTrend: 0.5, feeMult: 1.05, popularity: "mid",
    hollandTypes: ["A", "R", "I"], mbtiTypes: ["ISFP", "INTP", "INFP"],
    subjectCombinations: ["V00", "A01", "A00"], domains: ["engineering"], tuitionFee: 26000000,
  },
  {
    name: "Công nghệ Thực phẩm",
    description: "Chế biến, bảo quản và kiểm soát chất lượng thực phẩm.",
    baseScore: 22.5, scoreTrend: 0.6, feeMult: 1.0, popularity: "mid",
    hollandTypes: ["I", "R", "C"], mbtiTypes: ["ISTJ", "ISFJ"],
    subjectCombinations: ["A00", "B00", "D07"], domains: ["engineering", "agriculture"], tuitionFee: 24000000,
  },
  {
    name: "Kỹ thuật Y sinh",
    description: "Ứng dụng kỹ thuật vào thiết bị y tế và chăm sóc sức khỏe.",
    baseScore: 24.0, scoreTrend: 0.7, feeMult: 1.1, popularity: "niche",
    hollandTypes: ["I", "R"], mbtiTypes: ["INTJ", "ISTP"],
    subjectCombinations: ["A00", "B00", "A01"], domains: ["engineering", "medical"], tuitionFee: 28000000,
  },
  {
    name: "Công nghệ Sinh học",
    description: "Ứng dụng sinh học phân tử trong y dược, nông nghiệp và môi trường.",
    baseScore: 23.0, scoreTrend: 0.6, feeMult: 1.0, popularity: "niche",
    hollandTypes: ["I", "R"], mbtiTypes: ["INTJ", "INTP", "ISFJ"],
    subjectCombinations: ["A00", "B00", "D07"], domains: ["agriculture", "medical"], tuitionFee: 24000000,
  },

  // ================= KINH TẾ & QUẢN TRỊ =================
  {
    name: "Quản trị Kinh doanh",
    description: "Đào tạo kiến thức quản lý, điều hành doanh nghiệp.",
    baseScore: 25.0, scoreTrend: 0.9, feeMult: 1.0, popularity: "high",
    hollandTypes: ["E", "S", "C"], mbtiTypes: ["ENTJ", "ESTJ", "ENFJ"],
    subjectCombinations: ["A00", "A01", "D01", "D07"], domains: ["business"], tuitionFee: 28000000,
  },
  {
    name: "Tài chính - Ngân hàng",
    description: "Quản lý tài chính, phân tích đầu tư và hoạt động ngân hàng.",
    baseScore: 25.5, scoreTrend: 1.0, feeMult: 1.0, popularity: "high",
    hollandTypes: ["C", "E", "I"], mbtiTypes: ["ISTJ", "ESTJ", "INTJ"],
    subjectCombinations: ["A00", "A01", "D01", "D07"], domains: ["business"], tuitionFee: 27000000,
  },
  {
    name: "Kế toán",
    description: "Ghi chép, phân tích và báo cáo tình hình tài chính doanh nghiệp.",
    baseScore: 24.0, scoreTrend: 0.7, feeMult: 1.0, popularity: "high",
    hollandTypes: ["C", "I"], mbtiTypes: ["ISTJ", "ISFJ"],
    subjectCombinations: ["A00", "A01", "D01"], domains: ["business"], tuitionFee: 25000000,
  },
  {
    name: "Kiểm toán",
    description: "Kiểm tra, xác minh tính trung thực của báo cáo tài chính.",
    baseScore: 25.0, scoreTrend: 0.8, feeMult: 1.0, popularity: "mid",
    hollandTypes: ["C", "I", "E"], mbtiTypes: ["ISTJ", "ESTJ"],
    subjectCombinations: ["A00", "A01", "D01"], domains: ["business"], tuitionFee: 26000000,
  },
  {
    name: "Marketing",
    description: "Nghiên cứu thị trường, xây dựng thương hiệu và quảng bá sản phẩm.",
    baseScore: 25.5, scoreTrend: 1.0, feeMult: 1.05, popularity: "high",
    hollandTypes: ["E", "A", "S"], mbtiTypes: ["ENFP", "ENTP", "ESFP"],
    subjectCombinations: ["A00", "A01", "D01", "D15"], domains: ["business"], tuitionFee: 30000000,
  },
  {
    name: "Kinh tế",
    description: "Nghiên cứu quy luật kinh tế, chính sách và phân tích thị trường.",
    baseScore: 25.0, scoreTrend: 0.8, feeMult: 1.0, popularity: "mid",
    hollandTypes: ["I", "E", "C"], mbtiTypes: ["INTJ", "ENTJ"],
    subjectCombinations: ["A00", "A01", "D01"], domains: ["business"], tuitionFee: 24000000,
  },
  {
    name: "Kinh tế Quốc tế",
    description: "Nghiên cứu thương mại, đầu tư và quan hệ kinh tế giữa các quốc gia.",
    baseScore: 26.5, scoreTrend: 1.0, feeMult: 1.05, popularity: "high",
    hollandTypes: ["E", "I", "C"], mbtiTypes: ["ENTJ", "INTJ"],
    subjectCombinations: ["A00", "A01", "D01", "D07"], domains: ["business"], tuitionFee: 29000000,
  },
  {
    name: "Kinh doanh Quốc tế",
    description: "Quản trị hoạt động kinh doanh và thương mại toàn cầu.",
    baseScore: 26.0, scoreTrend: 1.0, feeMult: 1.05, popularity: "high",
    hollandTypes: ["E", "C", "I"], mbtiTypes: ["ENTJ", "ESTJ"],
    subjectCombinations: ["A00", "A01", "D01", "D07"], domains: ["business"], tuitionFee: 30000000,
  },
  {
    name: "Logistics & Quản lý Chuỗi cung ứng",
    description: "Tối ưu hóa quá trình vận chuyển và lưu kho hàng hóa.",
    baseScore: 25.5, scoreTrend: 1.0, feeMult: 1.0, popularity: "high",
    hollandTypes: ["C", "R", "E"], mbtiTypes: ["ISTJ", "ESTJ"],
    subjectCombinations: ["A00", "A01", "D01"], domains: ["business"], tuitionFee: 28000000,
  },
  {
    name: "Quản trị Nhân lực",
    description: "Tuyển dụng, đào tạo và phát triển nguồn nhân lực trong tổ chức.",
    baseScore: 24.0, scoreTrend: 0.7, feeMult: 1.0, popularity: "mid",
    hollandTypes: ["S", "E", "C"], mbtiTypes: ["ENFJ", "ESFJ"],
    subjectCombinations: ["A00", "A01", "D01"], domains: ["business"], tuitionFee: 25000000,
  },
  {
    name: "Quản trị Khách sạn",
    description: "Quản lý vận hành khách sạn, khu nghỉ dưỡng và dịch vụ lưu trú.",
    baseScore: 23.5, scoreTrend: 0.6, feeMult: 1.0, popularity: "mid",
    hollandTypes: ["E", "S", "C"], mbtiTypes: ["ESFP", "ESFJ", "ENFP"],
    subjectCombinations: ["A01", "D01", "D15"], domains: ["business"], tuitionFee: 26000000,
  },
  {
    name: "Quản trị Dịch vụ Du lịch & Lữ hành",
    description: "Tổ chức, điều hành tour và dịch vụ du lịch.",
    baseScore: 23.0, scoreTrend: 0.6, feeMult: 1.0, popularity: "mid",
    hollandTypes: ["E", "S", "A"], mbtiTypes: ["ESFP", "ENFP"],
    subjectCombinations: ["A01", "C00", "D01"], domains: ["business"], tuitionFee: 24000000,
  },

  // ================= LUẬT - XÃ HỘI - NGOẠI NGỮ - TRUYỀN THÔNG =================
  {
    name: "Luật",
    description: "Đào tạo cử nhân luật, am hiểu hệ thống pháp luật và tư pháp.",
    baseScore: 25.0, scoreTrend: 0.8, feeMult: 1.0, popularity: "high",
    hollandTypes: ["E", "C", "I"], mbtiTypes: ["ENTJ", "ESTJ", "ISTJ"],
    subjectCombinations: ["A00", "C00", "D01"], domains: ["law"], tuitionFee: 24000000,
  },
  {
    name: "Luật Kinh tế",
    description: "Pháp luật điều chỉnh các quan hệ kinh doanh, thương mại.",
    baseScore: 25.0, scoreTrend: 0.8, feeMult: 1.0, popularity: "high",
    hollandTypes: ["E", "C", "I"], mbtiTypes: ["ESTJ", "ISTJ"],
    subjectCombinations: ["A00", "A01", "D01"], domains: ["law", "business"], tuitionFee: 24000000,
  },
  {
    name: "Quan hệ Quốc tế",
    description: "Nghiên cứu chính trị, ngoại giao và hợp tác quốc tế.",
    baseScore: 26.0, scoreTrend: 0.9, feeMult: 1.0, popularity: "high",
    hollandTypes: ["E", "S", "I"], mbtiTypes: ["ENFJ", "ENTJ"],
    subjectCombinations: ["A01", "C00", "D01", "D15"], domains: ["social", "law"], tuitionFee: 25000000,
  },
  {
    name: "Tâm lý học",
    description: "Nghiên cứu về tâm trí và hành vi con người.",
    baseScore: 24.5, scoreTrend: 0.9, feeMult: 1.0, popularity: "high",
    hollandTypes: ["S", "I", "A"], mbtiTypes: ["INFP", "INFJ", "ENFP"],
    subjectCombinations: ["B00", "C00", "D01", "D15"], domains: ["social"], tuitionFee: 22000000,
  },
  {
    name: "Báo chí",
    description: "Đào tạo phóng viên, biên tập viên và người làm truyền thông.",
    baseScore: 25.0, scoreTrend: 0.8, feeMult: 1.0, popularity: "mid",
    hollandTypes: ["A", "S", "E"], mbtiTypes: ["ENFP", "ENTP"],
    subjectCombinations: ["C00", "D01", "D15"], domains: ["media", "social"], tuitionFee: 24000000,
  },
  {
    name: "Truyền thông Đa phương tiện",
    description: "Ứng dụng công nghệ vào thiết kế, báo chí và truyền thông.",
    baseScore: 25.5, scoreTrend: 0.9, feeMult: 1.1, popularity: "high",
    hollandTypes: ["A", "E", "S"], mbtiTypes: ["ENFP", "ENTP", "ESFP"],
    subjectCombinations: ["A01", "C00", "D01", "D15"], domains: ["media"], tuitionFee: 32000000,
  },
  {
    name: "Thiết kế Đồ họa",
    description: "Sáng tạo hình ảnh, nhận diện thương hiệu và sản phẩm số.",
    baseScore: 22.5, scoreTrend: 0.6, feeMult: 1.1, popularity: "mid",
    hollandTypes: ["A", "R", "I"], mbtiTypes: ["ISFP", "INFP"],
    subjectCombinations: ["V00", "H00", "D01"], domains: ["media"], tuitionFee: 30000000,
  },
  {
    name: "Ngôn ngữ Anh",
    description: "Đào tạo chuyên sâu về tiếng Anh, biên phiên dịch và giảng dạy.",
    baseScore: 25.0, scoreTrend: 0.8, feeMult: 1.0, popularity: "high",
    hollandTypes: ["S", "A", "E"], mbtiTypes: ["ENFP", "ESFP"],
    subjectCombinations: ["D01", "A01", "D15"], domains: ["language"], tuitionFee: 26000000,
  },
  {
    name: "Ngôn ngữ Trung Quốc",
    description: "Đào tạo tiếng Trung, biên phiên dịch và văn hóa Trung Hoa.",
    baseScore: 25.5, scoreTrend: 0.9, feeMult: 1.0, popularity: "high",
    hollandTypes: ["S", "A"], mbtiTypes: ["ENFP", "ESFJ"],
    subjectCombinations: ["D01", "C00", "D15"], domains: ["language"], tuitionFee: 26000000,
  },
  {
    name: "Ngôn ngữ Nhật",
    description: "Đào tạo tiếng Nhật, biên phiên dịch và văn hóa Nhật Bản.",
    baseScore: 24.5, scoreTrend: 0.7, feeMult: 1.0, popularity: "mid",
    hollandTypes: ["S", "A"], mbtiTypes: ["ENFP", "ISFJ"],
    subjectCombinations: ["D01", "A01", "D15"], domains: ["language"], tuitionFee: 26000000,
  },
  {
    name: "Ngôn ngữ Hàn Quốc",
    description: "Đào tạo tiếng Hàn, biên phiên dịch và văn hóa Hàn Quốc.",
    baseScore: 25.5, scoreTrend: 0.9, feeMult: 1.0, popularity: "high",
    hollandTypes: ["S", "A"], mbtiTypes: ["ENFP", "ESFP"],
    subjectCombinations: ["D01", "C00", "D15"], domains: ["language"], tuitionFee: 26000000,
  },

  // ================= SƯ PHẠM (học phí thấp/miễn theo NĐ116) =================
  {
    name: "Sư phạm Toán học",
    description: "Đào tạo giáo viên Toán bậc trung học phổ thông.",
    baseScore: 26.5, scoreTrend: 1.2, feeMult: 0.55, popularity: "high",
    hollandTypes: ["I", "S"], mbtiTypes: ["INTJ", "ISTJ"],
    subjectCombinations: ["A00", "A01"], domains: ["education"], tuitionFee: 12000000,
  },
  {
    name: "Sư phạm Tiếng Anh",
    description: "Đào tạo giáo viên Tiếng Anh bậc phổ thông.",
    baseScore: 26.0, scoreTrend: 1.1, feeMult: 0.55, popularity: "high",
    hollandTypes: ["S", "A", "E"], mbtiTypes: ["ENFJ", "ENFP"],
    subjectCombinations: ["D01", "A01"], domains: ["education", "language"], tuitionFee: 12000000,
  },

  // ================= Y - DƯỢC =================
  {
    name: "Y Đa khoa",
    description: "Khám, chẩn đoán, điều trị bệnh và chăm sóc sức khỏe.",
    baseScore: 26.5, scoreTrend: 0.5, feeMult: 1.0, popularity: "high",
    hollandTypes: ["I", "S", "R"], mbtiTypes: ["ISFJ", "ISTJ", "INFJ"],
    subjectCombinations: ["B00", "A00"], domains: ["medical"], tuitionFee: 45000000,
  },
  {
    name: "Dược học",
    description: "Nghiên cứu về thuốc, cách bào chế và sử dụng thuốc.",
    baseScore: 25.0, scoreTrend: 0.5, feeMult: 1.0, popularity: "high",
    hollandTypes: ["I", "C", "R"], mbtiTypes: ["ISTJ", "ISFJ", "INTP"],
    subjectCombinations: ["A00", "B00"], domains: ["medical"], tuitionFee: 40000000,
  },
  {
    name: "Răng Hàm Mặt",
    description: "Chuyên khoa điều trị các bệnh lý về răng và hàm.",
    baseScore: 26.5, scoreTrend: 0.5, feeMult: 1.0, popularity: "high",
    hollandTypes: ["I", "R", "S"], mbtiTypes: ["ISFJ", "ISTJ"],
    subjectCombinations: ["B00", "A00"], domains: ["medical"], tuitionFee: 48000000,
  },
  {
    name: "Điều dưỡng",
    description: "Chăm sóc bệnh nhân và hỗ trợ điều trị y tế.",
    baseScore: 21.5, scoreTrend: 0.6, feeMult: 0.9, popularity: "mid",
    hollandTypes: ["S", "R", "I"], mbtiTypes: ["ISFJ", "ESFJ"],
    subjectCombinations: ["B00", "A00"], domains: ["medical"], tuitionFee: 22000000,
  },
  {
    name: "Kỹ thuật Xét nghiệm Y học",
    description: "Thực hiện xét nghiệm, phân tích mẫu bệnh phẩm hỗ trợ chẩn đoán.",
    baseScore: 23.5, scoreTrend: 0.6, feeMult: 0.95, popularity: "mid",
    hollandTypes: ["I", "C"], mbtiTypes: ["ISTJ", "ISFJ"],
    subjectCombinations: ["B00", "A00"], domains: ["medical"], tuitionFee: 26000000,
  },
];
