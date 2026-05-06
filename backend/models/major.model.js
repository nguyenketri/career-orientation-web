const mongoose = require("mongoose");

const majorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    benchmarkScore: Number, // điểm chuẩn
    hollandTypes: [String], // ví dụ ["I", "R"]
  },
  { timestamps: true },
);

module.exports = mongoose.model("Major", majorSchema);
