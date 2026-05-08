const { recommendByScore } = require("../services/recommend.service");

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
