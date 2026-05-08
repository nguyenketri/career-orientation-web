const {
  getQuestions,
  submitHollandTest,
} = require("../services/holland.service");

exports.getQuestions = async (req, res) => {
  try {
    const questions = await getQuestions();

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
