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
  },
  { timestamps: true },
);

module.exports = mongoose.model("HollandQuestion", hollandQuestionSchema);
