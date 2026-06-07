const User = require("../models/user.model");

const QUOTA_LIMITS = {
  FREE: { mentorQuestions: 5, comparisonCount: 2, recommendations: 3 },
  PAID: { mentorQuestions: 50, comparisonCount: 5, recommendations: 20 },
  PREMIUM: {
    mentorQuestions: Infinity,
    comparisonCount: Infinity,
    recommendations: Infinity,
  },
};

const checkQuota = async (userId, feature) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const plan = user.subscriptionPlan || "FREE";
  const limit = QUOTA_LIMITS[plan][feature];

  if (limit === Infinity) return true;

  // Ensure feature usage object exists
  if (!user.dailyUsage[feature]) {
    user.dailyUsage[feature] = { count: 0, lastUsed: new Date() };
    await user.save();
  }

  const today = new Date().toDateString();
  const lastUsed = user.dailyUsage[feature].lastUsed?.toDateString();

  if (lastUsed !== today) {
    user.dailyUsage[feature].count = 0;
    user.dailyUsage[feature].lastUsed = new Date();
    await user.save();
  }

  return user.dailyUsage[feature].count < limit;
};

const incrementQuota = async (userId, feature) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Ensure feature usage object exists
  if (!user.dailyUsage[feature]) {
    user.dailyUsage[feature] = { count: 0, lastUsed: new Date() };
  }

  const today = new Date().toDateString();
  const lastUsed = user.dailyUsage[feature].lastUsed?.toDateString();

  if (lastUsed !== today) {
    user.dailyUsage[feature].count = 1;
    user.dailyUsage[feature].lastUsed = new Date();
  } else {
    user.dailyUsage[feature].count += 1;
  }

  await user.save();
};

const getQuota = async (userId, feature) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const plan = user.subscriptionPlan || "FREE";
  const limit = QUOTA_LIMITS[plan][feature];

  const today = new Date().toDateString();
  const usage = user.dailyUsage[feature];

  let count = 0;
  if (usage && usage.lastUsed?.toDateString() === today) {
    count = usage.count;
  }

  return {
    limit,
    used: count,
    remaining: limit === Infinity ? Infinity : limit - count,
  };
};

module.exports = { checkQuota, incrementQuota, getQuota };
