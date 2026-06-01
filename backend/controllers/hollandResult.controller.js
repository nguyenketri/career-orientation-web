const {
  createHollandResult,
  getHollandResultsByUser,
} = require("../services/hollandResult.service");
const HollandResult = require("../models/hollandResult.model");
// SAVE
const saveHollandResult = async (req, res) => {
  try {
    const { hollandType, topTypes, hollandScores, recommendedMajors } =
      req.body;
    const userId = req.user.id;

    const result = await createHollandResult({
      userId,
      hollandType,
      topTypes,
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
