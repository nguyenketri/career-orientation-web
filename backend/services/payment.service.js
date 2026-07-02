const Payment = require("../models/payment.model");

// PayOS không gửi webhook cho các phiên QR đã hết hạn, nên nếu không quét định kỳ,
// các giao dịch PENDING quá hạn expiresAt sẽ bị kẹt mãi ở trạng thái chờ dù chắc chắn
// sẽ không bao giờ được thanh toán nữa.
exports.sweepExpiredPayments = async (filter = {}) => {
  await Payment.updateMany(
    { ...filter, status: "PENDING", expiresAt: { $lt: new Date() } },
    { $set: { status: "FAILED" } },
  );
};
