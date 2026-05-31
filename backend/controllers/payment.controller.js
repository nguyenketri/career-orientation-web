const Payment = require("../models/payment.model");
const User = require("../models/user.model");

// Duration in milliseconds
const PLAN_DURATIONS = {
  PAID: 30 * 24 * 60 * 60 * 1000, // 30 days
  PREMIUM: 90 * 24 * 60 * 60 * 1000, // 90 days
};

const PLAN_PRICES = {
  PAID: 5000,
  PREMIUM: 129000,
};

// Create a new payment session and generate VietQR URL
exports.createPayment = async (req, res) => {
  try {
    const { planType } = req.body;
    if (!planType || !PLAN_PRICES[planType]) {
      return res.status(400).json({
        status: "error",
        message: "Invalid planType. Must be PAID or PREMIUM.",
      });
    }

    const amount = PLAN_PRICES[planType];

    // Generate a unique 6-digit transaction code: CZP + XXXXXX
    let transactionCode;
    let codeExists = true;
    while (codeExists) {
      const randomDigits = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();
      transactionCode = `CZP${randomDigits}`;
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

    // Load bank info from env or fallback to demo account
    const bankId = process.env.BANK_ID || "tpbank";
    const bankAccount = process.env.BANK_ACCOUNT || "00000807478";
    const accountName = process.env.BANK_ACCOUNT_NAME || "NGUYEN KE TRI";

    // Generate VietQR Url
    const qrCodeUrl = `https://img.vietqr.io/image/${bankId}-${bankAccount}-print.png?amount=${amount}&addInfo=${transactionCode}&accountName=${encodeURIComponent(accountName)}`;

    return res.status(200).json({
      status: "success",
      data: {
        paymentId: payment._id,
        transactionCode,
        amount,
        planType,
        expiresAt,
        qrCodeUrl,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Process verification and user upgrade
const processPaymentSuccess = async (transactionCode, transferAmount) => {
  const payment = await Payment.findOne({
    transactionCode: { $regex: new RegExp(`^${transactionCode}$`, "i") },
    status: "PENDING",
  });

  if (!payment) {
    return {
      success: false,
      reason: "No pending payment found with this code.",
    };
  }

  if (payment.amount !== transferAmount) {
    return {
      success: false,
      reason: `Amount mismatch. Expected ${payment.amount}, received ${transferAmount}.`,
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

  console.log(
    `[Payment] User ${user.email} successfully upgraded to ${payment.planType} until ${newExpiry.toISOString()}`,
  );
  return { success: true, user, payment };
};

// Unified webhook receiver (compatible with Casso / SePay)
exports.webhookPayment = async (req, res) => {
  try {
    const payload = req.body;
    console.log("[Payment Webhook] Received payload:", JSON.stringify(payload));

    // Handle authentication (optional token check for security if configured)
    const secretToken = process.env.PAYMENT_WEBHOOK_SECRET;
    if (secretToken) {
      const headerToken =
        req.headers["secure-token"] || req.headers["authorization"];
      if (
        headerToken !== secretToken &&
        headerToken !== `Apikey ${secretToken}`
      ) {
        return res
          .status(401)
          .json({ status: "error", message: "Unauthorized webhook caller" });
      }
    }

    let transactions = [];

    // Parse Casso format (array inside data property)
    if (payload.data && Array.isArray(payload.data)) {
      transactions = payload.data.map((item) => ({
        content: item.description || "",
        amount: Number(item.amount || 0),
      }));
    }
    // Parse SePay format (direct body attributes)
    else if (payload.content || payload.transferAmount) {
      transactions = [
        {
          content: payload.content || "",
          amount: Number(payload.transferAmount || payload.amount || 0),
        },
      ];
    }
    // Fallback: Generic array payload
    else if (Array.isArray(payload)) {
      transactions = payload.map((item) => ({
        content: item.content || item.description || "",
        amount: Number(item.amount || item.transferAmount || 0),
      }));
    }

    let processedCount = 0;
    const errors = [];

    // Process transactions extracted
    for (const tx of transactions) {
      // Find matches for pattern CZPxxxxxx
      const match = tx.content.match(/CZP\d{6}/i);
      if (match) {
        const matchedCode = match[0].toUpperCase();
        const result = await processPaymentSuccess(matchedCode, tx.amount);
        if (result.success) {
          processedCount++;
        } else {
          errors.push({ code: matchedCode, reason: result.reason });
        }
      }
    }

    return res.status(200).json({
      status: "success",
      message: `Processed ${processedCount} payments.`,
      errors,
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
    if (payment.user.toString() !== req.user.id) {
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
