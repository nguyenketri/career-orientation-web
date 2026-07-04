const MbtiQuestion = require("../models/mbtiQuestion.model");
const HollandQuestion = require("../models/hollandQuestion.model");

// Escape ký tự đặc biệt regex để tránh lỗi/khai thác khi search bằng chuỗi admin nhập
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Không dùng isDeleted:false / isActive:true (strict) để tránh loại bỏ nhầm các
// câu hỏi cũ trong Mongo Atlas chưa có 2 field này (coi như mặc định = còn hoạt động)
const NOT_DELETED = { isDeleted: { $ne: true } };

const activeFilterFromQuery = (status) => {
  if (status === "active") return { isActive: { $ne: false } };
  if (status === "inactive") return { isActive: false };
  return {};
};

// --- MBTI Question Management ---

exports.getMbtiQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search || "").trim();
    const { dimension, status } = req.query;

    const filter = { ...NOT_DELETED, ...activeFilterFromQuery(status) };
    if (search) {
      filter.question = new RegExp(escapeRegex(search), "i");
    }
    if (dimension && ["EI", "SN", "TF", "JP"].includes(dimension)) {
      filter.dimension = dimension;
    }

    const total = await MbtiQuestion.countDocuments(filter);
    const questions = await MbtiQuestion.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: "success",
      data: {
        questions,
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.createMbtiQuestion = async (req, res) => {
  try {
    const { question, dimension, optionA, optionB } = req.body;
    const created = await MbtiQuestion.create({
      question,
      dimension,
      optionA,
      optionB,
    });
    res.status(201).json({ status: "success", data: created });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.updateMbtiQuestion = async (req, res) => {
  try {
    const question = await MbtiQuestion.findOne({
      _id: req.params.id,
      ...NOT_DELETED,
    });
    if (!question) {
      return res
        .status(404)
        .json({ status: "error", message: "MBTI Question not found" });
    }

    const { question: text, dimension, optionA, optionB } = req.body;
    if (text !== undefined) question.question = text;
    if (dimension !== undefined) question.dimension = dimension;
    if (optionA !== undefined) question.optionA = optionA;
    if (optionB !== undefined) question.optionB = optionB;

    // save() (thay vì findByIdAndUpdate) để chạy đầy đủ schema validation,
    // đảm bảo optionA/optionB.typeValue luôn khớp dimension sau khi sửa
    await question.save();
    res.status(200).json({ status: "success", data: question });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.toggleMbtiQuestionStatus = async (req, res) => {
  try {
    const question = await MbtiQuestion.findOne({
      _id: req.params.id,
      ...NOT_DELETED,
    });
    if (!question) {
      return res
        .status(404)
        .json({ status: "error", message: "MBTI Question not found" });
    }
    question.isActive = question.isActive === false;
    await question.save();
    res.status(200).json({ status: "success", data: question });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.deleteMbtiQuestion = async (req, res) => {
  try {
    const question = await MbtiQuestion.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
    });
    if (!question) {
      return res
        .status(404)
        .json({ status: "error", message: "MBTI Question not found" });
    }
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
    const search = (req.query.search || "").trim();
    const { type, status } = req.query;

    const filter = { ...NOT_DELETED, ...activeFilterFromQuery(status) };
    if (search) {
      filter.content = new RegExp(escapeRegex(search), "i");
    }
    if (type && ["R", "I", "A", "S", "E", "C"].includes(type)) {
      filter.type = type;
    }

    const total = await HollandQuestion.countDocuments(filter);
    const questions = await HollandQuestion.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: "success",
      data: {
        questions,
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.createHollandQuestion = async (req, res) => {
  try {
    const { content, type } = req.body;
    const created = await HollandQuestion.create({ content, type });
    res.status(201).json({ status: "success", data: created });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.updateHollandQuestion = async (req, res) => {
  try {
    const question = await HollandQuestion.findOne({
      _id: req.params.id,
      ...NOT_DELETED,
    });
    if (!question) {
      return res
        .status(404)
        .json({ status: "error", message: "Holland Question not found" });
    }

    const { content, type } = req.body;
    if (content !== undefined) question.content = content;
    if (type !== undefined) question.type = type;

    await question.save();
    res.status(200).json({ status: "success", data: question });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.toggleHollandQuestionStatus = async (req, res) => {
  try {
    const question = await HollandQuestion.findOne({
      _id: req.params.id,
      ...NOT_DELETED,
    });
    if (!question) {
      return res
        .status(404)
        .json({ status: "error", message: "Holland Question not found" });
    }
    question.isActive = question.isActive === false;
    await question.save();
    res.status(200).json({ status: "success", data: question });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.deleteHollandQuestion = async (req, res) => {
  try {
    // Soft delete — thống nhất với MBTI, tránh xóa cứng mất dữ liệu khi thao tác nhầm
    const question = await HollandQuestion.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
    });
    if (!question) {
      return res
        .status(404)
        .json({ status: "error", message: "Holland Question not found" });
    }
    res.status(200).json({
      status: "success",
      message: "Holland Question deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// --- Thống kê tổng quan cho trang Quản lý Câu hỏi (4 thẻ đầu trang) ---

exports.getQuestionStats = async (req, res) => {
  try {
    const [mbtiTotal, mbtiActive, hollandTotal, hollandActive] =
      await Promise.all([
        MbtiQuestion.countDocuments(NOT_DELETED),
        MbtiQuestion.countDocuments({
          ...NOT_DELETED,
          isActive: { $ne: false },
        }),
        HollandQuestion.countDocuments(NOT_DELETED),
        HollandQuestion.countDocuments({
          ...NOT_DELETED,
          isActive: { $ne: false },
        }),
      ]);

    const totalQuestions = mbtiTotal + hollandTotal;
    const totalActive = mbtiActive + hollandActive;

    res.status(200).json({
      status: "success",
      data: {
        totalQuestions,
        mbtiTotal,
        mbtiActive,
        hollandTotal,
        hollandActive,
        activePct:
          totalQuestions > 0
            ? Math.round((totalActive / totalQuestions) * 1000) / 10
            : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
