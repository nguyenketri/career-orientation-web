const mbtiService = require("../services/mbti.service");
const {
  getPlanFromRequest,
} = require("../middlewares/subscription.middleware");

exports.getQuestions = async (req, res) => {
  try {
    const plan = req.user?.subscriptionPlan || "FREE";
    const questions = await mbtiService.getQuestions(plan);
    return res.status(200).json({
      status: "success",
      data: questions,
      timeLimitSec: questions.length * mbtiService.TIME_PER_QUESTION_SEC,
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.submitTest = async (req, res) => {
  try {
    // answers is array of { typeValue: 'E' }
    const result = await mbtiService.submitMbtiTest(
      req.user?.id,
      req.body.answers,
    );
    return res.status(200).json({ status: "success", data: result });
  } catch (err) {
    return res.status(400).json({ status: "error", message: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const results = await mbtiService.getMbtiHistory(req.user.id);

    // Calculate Stability Score and Trait Shifts
    let stabilityScore = 0;
    let processedResults = [];

    if (Array.isArray(results) && results.length > 0) {
      try {
        const primaryTraits = results.map((r) => r?.mbtiType).filter(Boolean);
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
            const prevTrait = results[index + 1]?.mbtiType;
            if (r?.mbtiType !== prevTrait) {
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
        console.error("Stability calculation error:", calcError);
        processedResults = results.map((r) => (r.toObject ? r.toObject() : r));
      }
    }

    return res.status(200).json({
      status: "success",
      stabilityScore,
      data: processedResults,
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};
