const mongoose = require("mongoose");

const hollandQuestionSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },

    // R I A S E C
    type: {
      type: String,
      required: true,
      enum: ["R", "I", "A", "S", "E", "C"],
    },

    // Câu hỏi có đang được đưa vào bài test cho người dùng hay không
    isActive: { type: Boolean, default: true },

    // Soft delete — thống nhất với MbtiQuestion để tránh mất dữ liệu khi xóa nhầm
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("HollandQuestion", hollandQuestionSchema);
