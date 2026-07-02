const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { createNotification } = require("../services/notification.service");

// Phải khớp với PLAN_DURATIONS ở payment.controller.js / admin.controller.js
const PLAN_DURATIONS_MS = {
  PAID: 30 * 24 * 60 * 60 * 1000,
  PREMIUM: 90 * 24 * 60 * 60 * 1000,
};
const PLAN_LABEL = { PAID: "TIÊU CHUẨN", PREMIUM: "CAO CẤP" };

// Middleware to check/refresh subscription plan status
const checkSubscription = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized - User details not found in request",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (user.subscriptionPlan !== "FREE") {
      if (user.subscriptionExpiry && new Date() > user.subscriptionExpiry) {
        // Plan has expired
        const expiredPlan = user.subscriptionPlan;
        user.subscriptionPlan = "FREE";
        user.subscriptionExpiry = null;
        await user.save();
        await createNotification({
          userId: user._id,
          type: "SUBSCRIPTION_EXPIRED",
          title: "Gói dịch vụ đã hết hạn",
          message: `Gói ${PLAN_LABEL[expiredPlan] || expiredPlan} của bạn đã hết hạn và được chuyển về gói CƠ BẢN (FREE). Nâng cấp lại để tiếp tục sử dụng đầy đủ tính năng.`,
          link: "/pricing",
        });
        console.log(`[Subscription] Reset expired plan to FREE for user: ${user.email}`);
      } else if (!user.subscriptionExpiry) {
        // Dữ liệu thiếu ngày hết hạn (tài khoản cũ trước khi có tracking đầy đủ) —
        // tự cấp lại 1 chu kỳ đầy đủ để không bị mất quyền lợi gói đang trả phí.
        const duration = PLAN_DURATIONS_MS[user.subscriptionPlan];
        if (duration) {
          user.subscriptionExpiry = new Date(Date.now() + duration);
          await user.save();
          console.log(`[Subscription] Backfilled missing expiry for user: ${user.email}`);
        }
      }
    }

    // Attach latest plan to req.user
    req.user.subscriptionPlan = user.subscriptionPlan;
    req.user.subscriptionExpiry = user.subscriptionExpiry;

    next();
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Subscription validation failed: " + error.message,
    });
  }
};

// Middleware factory to enforce a minimum subscription tier
const requirePlan = (allowedPlans) => {
  return [
    checkSubscription,
    (req, res, next) => {
      const { subscriptionPlan } = req.user;
      
      if (!allowedPlans.includes(subscriptionPlan)) {
        return res.status(403).json({
          status: "error",
          message: `This feature is restricted to [${allowedPlans.join(", ")}] plan(s). Your current plan is ${subscriptionPlan}.`,
          code: "UPGRADE_REQUIRED",
        });
      }
      
      next();
    }
  ];
};

// Soft helper to check user subscription plan from request headers
const getPlanFromRequest = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        if (user.subscriptionPlan !== "FREE") {
          if (user.subscriptionExpiry && new Date() > user.subscriptionExpiry) {
            user.subscriptionPlan = "FREE";
            user.subscriptionExpiry = null;
            await user.save();
          } else if (!user.subscriptionExpiry) {
            const duration = PLAN_DURATIONS_MS[user.subscriptionPlan];
            if (duration) {
              user.subscriptionExpiry = new Date(Date.now() + duration);
              await user.save();
            }
          }
        }
        return user.subscriptionPlan;
      }
    }
  } catch (err) {
    // Ignore and fallback
  }
  return "FREE";
};

module.exports = {
  checkSubscription,
  requirePlan,
  getPlanFromRequest,
};
