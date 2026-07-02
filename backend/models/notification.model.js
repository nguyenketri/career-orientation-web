// models/notification.model.js
// Thông báo trong ứng dụng cho từng user (thanh toán, gói dịch vụ, tài khoản...)

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "WELCOME",
        "PAYMENT_SUCCESS",
        "SUBSCRIPTION_EXPIRED",
        "ACCOUNT_STATUS",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: null }, // đường dẫn điều hướng khi bấm vào thông báo
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
