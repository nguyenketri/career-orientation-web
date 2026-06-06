const mbtiService = require("../services/mbti.service");
const {
  getPlanFromRequest,
} = require("../middlewares/subscription.middleware");

exports.getQuestions = async (req, res) => {
  try {
    const plan = await getPlanFromRequest(req);
    const questions = await mbtiService.getQuestions(plan);
    return res.status(200).json({ status: "success", data: questions });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.submitTest = async (req, res) => {
  try {
    // answers is array of { typeValue: 'E' }
    const result = await mbtiService.submitMbtiTest(
      req.user.id,
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

    if (results.length > 0) {
      const primaryTraits = results.map((r) => r.mbtiType);
      const traitCounts = {};
      primaryTraits.forEach(
        (t) => (traitCounts[t] = (traitCounts[t] || 0) + 1),
      );

      const mostFrequentTrait = Object.entries(traitCounts).sort(
        (a, b) => b[1] - a[1],
      )[0][0];
      const frequentCount = traitCounts[mostFrequentTrait];
      stabilityScore = Math.round((frequentCount / results.length) * 100);

      processedResults = results.map((r, index) => {
        let status = "Stable Trait";
        if (index < results.length - 1) {
          const prevTrait = results[index + 1].mbtiType;
          if (r.mbtiType !== prevTrait) {
            status = "Shift Detected";
          }
        }
        return {
          ...r.toObject(),
          status,
          mostFrequentTrait,
          frequentCount,
        };
      });
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
