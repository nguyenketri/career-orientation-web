const mongoose = require("mongoose");

const mbtiResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    mbtiType: {
      type: String, // Ví dụ: ENFJ, ISTP, v.v.
      required: true,
    },

    scores: {
      // Lưu điểm số của các cực
      E: { type: Number, default: 0 },
      I: { type: Number, default: 0 },
      S: { type: Number, default: 0 },
      N: { type: Number, default: 0 },
      T: { type: Number, default: 0 },
      F: { type: Number, default: 0 },
      J: { type: Number, default: 0 },
      P: { type: Number, default: 0 },
    },

    recommendedMajors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Major",
      },
    ],
    aiAnalysis: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MbtiResult", mbtiResultSchema);
