const mongoose = require("mongoose");

const majorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    benchmarkScore: Number,
    hollandTypes: [String],

    //Thêm field soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Major", majorSchema);
