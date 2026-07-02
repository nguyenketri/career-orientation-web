// models/major.model.js
// Mô hình ngành học, mở rộng để lưu thông tin trường, tổ hợp môn, học phí, MBTI và Holland

const mongoose = require('mongoose');

const majorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    benchmarkScore: Number, // điểm chuẩn tối thiểu
    hollandTypes: [String], // các loại Holland phù hợp (R,I,A,S,E,C)
    mbtiTypes: [String], // các loại MBTI phù hợp (ENFP, ISTJ,...)
    subjectCombinations: [String], // ví dụ: "A00", "A01", "B00" …
    tuitionFee: Number, // học phí (VNĐ)
    universities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'University' }], // danh sách trường có ngành này

    // --- Thông tin mở rộng cho trang chi tiết ngành (tùy chọn) ---
    englishName: { type: String, default: '' }, // Tên tiếng Anh (VD: Bachelor of Business ...)
    code: { type: String, default: '' }, // Mã ngành (VD: BP254)
    duration: { type: String, default: '' }, // Thời gian học (VD: "3 - 4 Năm")
    intakes: { type: [String], default: [] }, // Kỳ khai giảng (VD: ["Tháng 2","Tháng 6","Tháng 10"])
    highlights: {
      type: [
        {
          title: String,
          description: String,
          icon: String, // tên icon gợi ý (operations, warehouse, transport, sustainability...)
        },
      ],
      default: [],
    }, // Điểm nổi bật của ngành (các thẻ ở tab Tổng quan)
    careerOutcomes: { type: [String], default: [] }, // Cơ hội nghề nghiệp
    curriculum: {
      type: [
        {
          title: String, // VD: "Năm 1 - Kiến thức nền tảng"
          items: [String], // danh sách môn học / nội dung
        },
      ],
      default: [],
    }, // Chương trình học theo khối/năm

    // Soft delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Major', majorSchema);
