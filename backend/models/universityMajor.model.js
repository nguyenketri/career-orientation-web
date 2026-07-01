// models/universityMajor.model.js
// Mô hình lưu thông tin xét tuyển của một ngành tại một trường

const mongoose = require("mongoose");

const universityMajorSchema = new mongoose.Schema(
  {
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
    },
    major: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Major",
      required: true,
    },
    // Thông tin xét tuyển năm gần nhất (dùng cho query recommend & hiển thị nhanh)
    admissionScore: Number, // Điểm chuẩn năm mới nhất
    subjectCombination: String, // Tổ hợp môn chính (VD: "A00")
    tuitionFee: Number, // Học phí VNĐ/năm (đã chuẩn hóa)
    admissionHistory: [
      {
        year: Number,
        admissionScore: Number,
        tuitionFee: Number,
        subjectCombination: String,
      },
    ], // Lịch sử điểm chuẩn, học phí qua các năm (2023, 2024, 2025)
    // Soft delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("UniversityMajor", universityMajorSchema);
