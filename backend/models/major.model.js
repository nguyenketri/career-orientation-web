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
    // Soft delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Major', majorSchema);
