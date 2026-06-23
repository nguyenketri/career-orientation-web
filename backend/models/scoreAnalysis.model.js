// models/scoreAnalysis.model.js
// Lưu trữ lịch sử phân tích điểm từng môn của người dùng

const mongoose = require("mongoose");

const scoreAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subjectScores: {
      math: { type: Number, default: 0 },
      literature: { type: Number, default: 0 },
      english: { type: Number, default: 0 },
      physics: { type: Number, default: 0 },
      chemistry: { type: Number, default: 0 },
      biology: { type: Number, default: 0 },
      history: { type: Number, default: 0 },
      geography: { type: Number, default: 0 },
      civicEducation: { type: Number, default: 0 },
    },

    targetYear: { type: Number },
    province: { type: String },
    filters: {
      location: String,
      type: String,
      maxTuition: Number,
    },

    topCombinations: [
      {
        combination: String, // ví dụ: "A00"
        totalScore: Number, // tổng điểm 3 môn
      },
    ],

    recommendedUniversityMajors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UniversityMajor",
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("ScoreAnalysis", scoreAnalysisSchema);
