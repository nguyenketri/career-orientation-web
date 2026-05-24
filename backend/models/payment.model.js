const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planType: {
      type: String,
      enum: ["PAID", "PREMIUM"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    transactionCode: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add index on transactionCode for faster webhook lookup
paymentSchema.index({ transactionCode: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
