const Payment = require("../models/payment.model");
const User = require("../models/user.model");
const payosService = require("../services/payos.service");
const { createNotification } = require("../services/notification.service");

const PLAN_LABEL = { PAID: "TIÊU CHUẨN", PREMIUM: "CAO CẤP" };

// Duration in milliseconds
const PLAN_DURATIONS = {
  PAID: 30 * 24 * 60 * 60 * 1000, // 30 days
  PREMIUM: 90 * 24 * 60 * 60 * 1000, // 90 days
};

const PLAN_PRICES = {
  PAID: 99000,
  PREMIUM: 199000,
};

// Create a new payment session and generate payOS payment link
exports.createPayment = async (req, res) => {
  console.log("[Payment Controller] createPayment request received");
  console.log("[Payment Controller] Request Body:", req.body);
  console.log("[Payment Controller] User:", req.user);
  try {
    const { planType } = req.body;
    if (!planType || !PLAN_PRICES[planType]) {
      return res.status(400).json({
        status: "error",
        message: "Invalid planType. Must be PAID or PREMIUM.",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    // Transition Logic
    if (user.subscriptionPlan === "PREMIUM") {
      return res.status(400).json({
        status: "error",
        message: "You are already on the highest plan (PREMIUM).",
      });
    }

    if (user.subscriptionPlan === planType) {
      return res.status(400).json({
        status: "error",
        message: `You are already on the ${planType} plan.`,
      });
    }

    let amount = PLAN_PRICES[planType];

    // Generate a unique numeric transaction code for PayOS (must be an integer)
    let transactionCode;
    let codeExists = true;
    while (codeExists) {
      // PayOS orderCode must be a number.
      // We'll use a smaller number to ensure it fits in a 32-bit integer if needed,
      // though JS handles up to 2^53 - 1. PayOS might have limits.
      // Let's use a 6-8 digit random number.
      transactionCode = Math.floor(10000000 + Math.random() * 90000000);

      const existing = await Payment.findOne({ transactionCode });
      if (!existing) {
        codeExists = false;
      }
    }

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiry

    // Save payment record
    const payment = await Payment.create({
      user: req.user.id,
      planType,
      amount,
      transactionCode,
      status: "PENDING",
      expiresAt,
    });

    // Create payOS payment link
    try {
      // Ưu tiên lấy đúng origin mà user đang thực sự truy cập (Origin/Referer header).
      // Tránh trường hợp FRONTEND_URL trong .env lệch domain (vd www vs non-www, hoặc
      // domain preview khác) khiến payOS redirect user về một origin khác — làm mất
      // localStorage (token) và bị văng ra trang đăng nhập sau khi thanh toán xong.
      let frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      if (req.headers.origin) {
        frontendUrl = req.headers.origin;
      } else if (req.headers.referer) {
        try {
          frontendUrl = new URL(req.headers.referer).origin;
        } catch {
          // giữ nguyên fallback nếu referer không parse được
        }
      }

      const paymentLink = await payosService.createPaymentLink({
        orderCode: transactionCode,
        amount: amount,
        description: "Payment",
        cancelUrl: `${frontendUrl}/pricing`,
        returnUrl: `${frontendUrl}/payment/success`,
      });

      return res.status(200).json({
        status: "success",
        data: {
          paymentId: payment._id,
          transactionCode,
          amount,
          planType,
          expiresAt,
          checkoutUrl: paymentLink.checkoutUrl,
        },
      });
    } catch (payosError) {
      console.error("[Payment Controller] PayOS Error:", payosError);
      return res.status(500).json({
        status: "error",
        message:
          payosError.message || "Failed to create payment link via payOS",
        details: payosError.response ? payosError.response.data : null,
      });
    }
  } catch (error) {
    console.error("[Payment Controller] Global Error:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Process verification and user upgrade
const processPaymentSuccess = async (transactionCode, transferAmount) => {
  const payment = await Payment.findOne({
    transactionCode: Number(transactionCode),
    status: "PENDING",
  });

  if (!payment) {
    return {
      success: false,
      reason: "No pending payment found with this code.",
    };
  }

  if (transferAmount < payment.amount) {
    return {
      success: false,
      reason: `Insufficient amount. Expected at least ${payment.amount}, received ${transferAmount}.`,
    };
  }

  // Update payment status
  payment.status = "SUCCESS";
  await payment.save();

  // Upgrade User plan
  const user = await User.findById(payment.user);
  if (!user) {
    return {
      success: false,
      reason: "User associated with payment not found.",
    };
  }

  const duration = PLAN_DURATIONS[payment.planType];
  const now = new Date();

  // Calculate new expiration date
  const currentExpiry = user.subscriptionExpiry;
  const baseDate =
    currentExpiry && new Date(currentExpiry) > now
      ? new Date(currentExpiry)
      : now;
  const newExpiry = new Date(baseDate.getTime() + duration);

  user.subscriptionPlan = payment.planType;
  user.subscriptionExpiry = newExpiry;
  await user.save();

  await createNotification({
    userId: user._id,
    type: "PAYMENT_SUCCESS",
    title: "Thanh toán thành công 🎉",
    message: `Gói ${PLAN_LABEL[payment.planType] || payment.planType} của bạn đã được kích hoạt đến hết ngày ${newExpiry.toLocaleDateString("vi-VN")}.`,
    link: "/payment-history",
  });

  console.log(
    `[Payment] User ${user.email} successfully upgraded to ${payment.planType} until ${newExpiry.toISOString()}`,
  );
  return { success: true, user, payment };
};

// Webhook receiver for payOS
exports.webhookPayment = async (req, res) => {
  try {
    const payload = req.body;
    // PayOS sends signature in the body (inside data object), not the header, for some versions/configurations
    const signature =
      req.headers["x-payos-signature"] ||
      req.headers["X-PayOS-Signature"] ||
      payload.signature ||
      payload.data?.signature;
    console.log("[Payment Webhook] Received payload:", JSON.stringify(payload));
    console.log(
      "[Payment Webhook] Received headers:",
      JSON.stringify(req.headers),
    );

    if (!signature) {
      console.error(
        "[Payment Webhook] Error: Missing signature in headers AND body. Headers received:",
        JSON.stringify(req.headers),
      );
      return res
        .status(400)
        .json({ status: "error", message: "Missing payOS signature" });
    }

    const isValid = await payosService.verifyWebhook(payload, signature);
    if (!isValid) {
      console.error(
        "[Payment Webhook] Error: Signature verification failed. Check PAYOS_CHECKSUM_KEY on Render.",
      );
      console.log(
        "[Payment Webhook] Payload used for verification:",
        JSON.stringify(payload),
      );
      console.log("[Payment Webhook] Signature received:", signature);
      return res
        .status(400)
        .json({ status: "error", message: "Invalid payOS signature" });
    }

    // PayOS webhook structure: { code: "00", success: true, data: { orderCode, amount, ... } }
    if (payload.code === "00" && payload.success === true && payload.data) {
      const result = await processPaymentSuccess(
        payload.data.orderCode,
        payload.data.amount,
      );
      if (result.success) {
        return res.status(200).json({
          status: "success",
          message: "Payment processed via payOS",
        });
      } else {
        return res
          .status(400)
          .json({ status: "error", message: result.reason });
      }
    }
    return res.status(200).json({
      status: "success",
      message: "Webhook received but no action needed",
    });
  } catch (error) {
    console.error("[Payment Webhook Error]:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Developer/Test mock webhook for quick testing
exports.mockWebhook = async (req, res) => {
  try {
    const { transactionCode, amount } = req.body;
    if (!transactionCode || !amount) {
      return res.status(400).json({
        status: "error",
        message: "transactionCode and amount are required",
      });
    }

    const result = await processPaymentSuccess(transactionCode, Number(amount));
    if (!result.success) {
      return res.status(400).json({
        status: "error",
        message: result.reason,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Mock payment processed successfully!",
      data: {
        userPlan: result.user.subscriptionPlan,
        expiryDate: result.user.subscriptionExpiry,
        status: result.payment.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get current payment status for dynamic frontend checking
exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        status: "error",
        message: "Payment transaction not found",
      });
    }

    // Verify user owns this transaction
    if (payment.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Access denied to transaction history",
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        status: payment.status,
        planType: payment.planType,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get payment history for current user
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select("transactionCode amount planType status paymentMethod createdAt");

    return res.status(200).json({
      status: "success",
      data: payments.map((payment) => ({
        _id: payment._id,
        transactionCode: payment.transactionCode,
        amount: payment.amount,
        planType: payment.planType,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        createdAt: payment.createdAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
