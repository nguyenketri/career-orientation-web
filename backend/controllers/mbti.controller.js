const mbtiService = require("../services/mbti.service");
const { getPlanFromRequest } = require("../middlewares/subscription.middleware");

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
    const result = await mbtiService.submitMbtiTest(req.user.id, req.body.answers);
    return res.status(200).json({ status: "success", data: result });
  } catch (err) {
    return res.status(400).json({ status: "error", message: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await mbtiService.getMbtiHistory(req.user.id);
    return res.status(200).json({ status: "success", data: history });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};
