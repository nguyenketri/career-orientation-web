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
    admissionScore: Number, // điểm chuẩn năm hiện tại
    subjectCombination: String, // ví dụ: "A00", "B01" …
    tuitionFee: Number, // học phí (VNĐ)
    admissionHistory: [
      {
        year: Number,
        admissionScore: Number,
      },
    ], // Lịch sử điểm chuẩn qua các năm
    // Soft delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("UniversityMajor", universityMajorSchema);
