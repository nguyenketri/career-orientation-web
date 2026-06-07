const {
  createHollandResult,
  getHollandResultsByUser,
} = require("../services/hollandResult.service");
const HollandResult = require("../models/hollandResult.model");
const User = require("../models/user.model");
// SAVE
const saveHollandResult = async (req, res) => {
  try {
    const { hollandType, topTypes, hollandScores, recommendedMajors } =
      req.body;
    const userId = req.user.id;

    // Check user plan
    const user = await User.findById(userId);
    const plan = user?.subscriptionPlan || "FREE";

    // Only save recommendedMajors for PAID and PREMIUM plans
    let finalRecommendedMajors = [];
    if (plan === "PAID" || plan === "PREMIUM") {
      finalRecommendedMajors = recommendedMajors;
    }

    const result = await createHollandResult({
      userId,
      hollandType,
      topTypes,
      hollandScores,
      recommendedMajors: finalRecommendedMajors,
    });

    res.status(201).json({
      status: "success",
      message: "Holland result saved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
// GET HISTORY
const getMyHollandResults = async (req, res) => {
  try {
    const results = await getHollandResultsByUser(req.user.id);

    // Calculate Stability Score and Trait Shifts
    let stabilityScore = 0;
    let processedResults = [];

    if (Array.isArray(results) && results.length > 0) {
      try {
        const primaryTraits = results
          .map((r) => r?.topTypes?.[0])
          .filter(Boolean);
        const traitCounts = {};
        primaryTraits.forEach(
          (t) => (traitCounts[t] = (traitCounts[t] || 0) + 1),
        );

        const sortedTraits = Object.entries(traitCounts).sort(
          (a, b) => b[1] - a[1],
        );
        const mostFrequentTrait =
          sortedTraits.length > 0 ? sortedTraits[0][0] : null;
        const frequentCount = mostFrequentTrait
          ? traitCounts[mostFrequentTrait]
          : 0;
        stabilityScore = mostFrequentTrait
          ? Math.round((frequentCount / results.length) * 100)
          : 0;

        processedResults = results.map((r, index) => {
          let status = "Stable Trait";
          if (index < results.length - 1) {
            const prevTrait = results[index + 1]?.topTypes?.[0];
            if (r?.topTypes?.[0] !== prevTrait) {
              status = "Shift Detected";
            }
          }
          return {
            ...(r && typeof r.toObject === "function" ? r.toObject() : r),
            status,
            mostFrequentTrait,
            frequentCount,
          };
        });
      } catch (calcError) {
        console.error("Holland stability calculation error:", calcError);
        processedResults = results.map((r) => (r.toObject ? r.toObject() : r));
      }
    }

    res.status(200).json({
      status: "success",
      results: Array.isArray(results) ? results.length : 0,
      stabilityScore,
      data: processedResults,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// DELETE
const deleteHollandResult = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await HollandResult.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({
        status: "error",
        message: "Holland result not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Holland result deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  saveHollandResult,
  getMyHollandResults,
  deleteHollandResult,
};
