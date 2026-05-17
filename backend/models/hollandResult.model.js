const mongoose = require("mongoose");

const hollandResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    hollandType: {
      type: String,
      required: true,
    },

    hollandScores: {
      R: {
        type: Number,
        default: 0,
      },

      I: {
        type: Number,
        default: 0,
      },

      A: {
        type: Number,
        default: 0,
      },

      S: {
        type: Number,
        default: 0,
      },

      E: {
        type: Number,
        default: 0,
      },

      C: {
        type: Number,
        default: 0,
      },
    },

    recommendedMajors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Major",
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("HollandResult", hollandResultSchema);
