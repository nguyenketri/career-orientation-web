const {
  recommendBySubjects,
  getScoreAnalysisHistory,
  recommendByScore,
  recommendByHolland,
} = require("../services/recommend.service");

exports.recommendSubjects = async (req, res) => {
  try {
    const data = await recommendBySubjects(req.user.id, req.body.scores);
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(400).json({ status: "error", message: err.message });
  }
};

exports.getAnalysisHistory = async (req, res) => {
  try {
    const history = await getScoreAnalysisHistory(req.user.id);
    return res.status(200).json({ status: "success", data: history });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.recommendScore = async (req, res) => {
  try {
    const data = await recommendByScore(req.body);

    return res.status(200).json({
      status: "success",
      message: "Recommend successfully",
      data,
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.recommendHolland = async (req, res) => {
  try {
    const data = await recommendByHolland(req.body);

    return res.status(200).json({
      status: "success",
      message: "Recommend successfully",
      data,
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};
