const HollandResult = require("../models/hollandResult.model");

// create result
const createHollandResult = async ({
  userId,
  hollandType,
  hollandScores,
  recommendedMajors,
}) => {
  const newResult = await HollandResult.create({
    user: userId,
    hollandType,
    hollandScores,
    recommendedMajors,
  });

  return newResult;
};

// get results by user
const getHollandResultsByUser = async (userId) => {
  const results = await HollandResult.find({
    user: userId,
  })
    .populate("recommendedMajors")
    .sort({ createdAt: -1 });

  return results;
};

module.exports = {
  createHollandResult,
  getHollandResultsByUser,
};
