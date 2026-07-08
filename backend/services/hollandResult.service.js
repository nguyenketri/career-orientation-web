const HollandResult = require("../models/hollandResult.model");
const User = require("../models/user.model");
const { limitMajorsByPlan } = require("../utils/planLimits");

// create result
const createHollandResult = async ({
  userId,
  hollandType,
  topTypes,
  hollandScores,
  recommendedMajors,
}) => {
  const newResult = await HollandResult.create({
    user: userId,
    hollandType,
    topTypes,
    hollandScores,
    recommendedMajors,
  });

  return newResult;
};

// get results by user
const getHollandResultsByUser = async (userId) => {
  const user = await User.findById(userId);
  const plan = user?.subscriptionPlan || "FREE";

  const results = await HollandResult.find({
    user: userId,
  })
    .populate({
      path: "recommendedMajors",
      populate: {
        path: "universities",
        model: "University",
      },
    })
    .sort({ createdAt: -1 });

  return results.map((r) => {
    const obj = r.toObject();
    obj.recommendedMajors = limitMajorsByPlan(obj.recommendedMajors, plan);
    return obj;
  });
};

module.exports = {
  createHollandResult,
  getHollandResultsByUser,
};
