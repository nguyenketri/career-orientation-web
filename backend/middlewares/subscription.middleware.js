const User = require("../models/user.model");

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

    // Check if the plan has expired
    if (user.subscriptionPlan !== "FREE" && user.subscriptionExpiry && new Date() > user.subscriptionExpiry) {
      user.subscriptionPlan = "FREE";
      user.subscriptionExpiry = null;
      await user.save();
      console.log(`[Subscription] Reset expired plan to FREE for user: ${user.email}`);
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

module.exports = {
  checkSubscription,
  requirePlan,
};
