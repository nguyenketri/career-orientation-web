const {
  getQuestions,
  submitHollandTest,
  generateAiAnalysis: generateHollandAnalysis,
} = require("../services/holland.service");
exports.getQuestions = async (req, res) => {
  try {
    const plan = req.user?.subscriptionPlan || "FREE";
    const questions = await getQuestions(plan);

    return res.status(200).json({
      status: "success",
      data: questions,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
exports.submitTest = async (req, res) => {
  try {
    const result = await submitHollandTest(req.user.id, req.body.answers);

    return res.status(200).json({
      status: "success",
      message: "Holland test submitted successfully",
      data: result,
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.generateAiAnalysis = async (req, res) => {
  try {
    const { resultId } = req.params;
    const analysis = await generateHollandAnalysis(resultId);
    return res.status(200).json({
      status: "success",
      data: analysis,
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};
