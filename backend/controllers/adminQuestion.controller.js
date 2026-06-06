const MbtiQuestion = require("../models/mbtiQuestion.model");
const HollandQuestion = require("../models/hollandQuestion.model");

// --- MBTI Question Management ---

exports.getMbtiQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await MbtiQuestion.countDocuments({ isDeleted: false });
    const questions = await MbtiQuestion.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: "success",
      data: {
        questions,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.createMbtiQuestion = async (req, res) => {
  try {
    const question = await MbtiQuestion.create(req.body);
    res.status(201).json({ status: "success", data: question });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.updateMbtiQuestion = async (req, res) => {
  try {
    const question = await MbtiQuestion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!question)
      return res
        .status(404)
        .json({ status: "error", message: "MBTI Question not found" });
    res.status(200).json({ status: "success", data: question });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.deleteMbtiQuestion = async (req, res) => {
  try {
    await MbtiQuestion.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.status(200).json({
      status: "success",
      message: "MBTI Question deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// --- Holland Question Management ---

exports.getHollandQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await HollandQuestion.countDocuments();
    const questions = await HollandQuestion.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: "success",
      data: {
        questions,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.createHollandQuestion = async (req, res) => {
  try {
    const question = await HollandQuestion.create(req.body);
    res.status(201).json({ status: "success", data: question });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.updateHollandQuestion = async (req, res) => {
  try {
    const question = await HollandQuestion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!question)
      return res
        .status(404)
        .json({ status: "error", message: "Holland Question not found" });
    res.status(200).json({ status: "success", data: question });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.deleteHollandQuestion = async (req, res) => {
  try {
    await HollandQuestion.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: "success",
      message: "Holland Question deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
