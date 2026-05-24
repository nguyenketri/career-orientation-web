const {
  getQuestions,
  submitHollandTest,
  generateAiAnalysis: generateHollandAnalysis,
} = require("../services/holland.service");
const { getPlanFromRequest } = require("../middlewares/subscription.middleware");

exports.getQuestions = async (req, res) => {
  try {
    const plan = await getPlanFromRequest(req);
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
    const result = await submitHollandTest(req.body.answers);

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
