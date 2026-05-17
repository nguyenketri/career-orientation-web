const {
  createHollandResult,
  getHollandResultsByUser,
} = require("../services/hollandResult.service");
// SAVE
const saveHollandResult = async (req, res) => {
  try {
    const { hollandType, hollandScores, recommendedMajors } = req.body;

    const result = await createHollandResult({
      userId: req.user.id,
      hollandType,
      hollandScores,
      recommendedMajors,
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

    res.status(200).json({
      status: "success",
      results: results.length,
      data: results,
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
};
