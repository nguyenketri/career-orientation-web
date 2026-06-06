const University = require("../models/university.model");
const Major = require("../models/major.model");
const UniversityMajor = require("../models/universityMajor.model");

// --- University Management ---

exports.getUniversities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await University.countDocuments({ isDeleted: false });
    const universities = await University.find({ isDeleted: false })
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: "success",
      data: {
        universities,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.createUniversity = async (req, res) => {
  try {
    const university = await University.create(req.body);
    res.status(201).json({ status: "success", data: university });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.updateUniversity = async (req, res) => {
  try {
    const university = await University.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!university)
      return res
        .status(404)
        .json({ status: "error", message: "University not found" });
    res.status(200).json({ status: "success", data: university });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.deleteUniversity = async (req, res) => {
  try {
    await University.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
    res
      .status(200)
      .json({ status: "success", message: "University deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// --- Major Management ---

exports.getMajors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Major.countDocuments({ isDeleted: false });
    const majors = await Major.find({ isDeleted: false })
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: "success",
      data: {
        majors,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.createMajor = async (req, res) => {
  try {
    const major = await Major.create(req.body);
    res.status(201).json({ status: "success", data: major });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.updateMajor = async (req, res) => {
  try {
    const major = await Major.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!major)
      return res
        .status(404)
        .json({ status: "error", message: "Major not found" });
    res.status(200).json({ status: "success", data: major });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.deleteMajor = async (req, res) => {
  try {
    await Major.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
    res
      .status(200)
      .json({ status: "success", message: "Major deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// --- University-Major Mapping Management ---

exports.getUniversityMajors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await UniversityMajor.countDocuments({ isDeleted: false });
    const universityMajors = await UniversityMajor.find({ isDeleted: false })
      .populate("university")
      .populate("major")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: "success",
      data: {
        universityMajors,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.createUniversityMajor = async (req, res) => {
  try {
    const universityMajor = await UniversityMajor.create(req.body);
    res.status(201).json({ status: "success", data: universityMajor });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.updateUniversityMajor = async (req, res) => {
  try {
    const universityMajor = await UniversityMajor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!universityMajor)
      return res.status(404).json({
        status: "error",
        message: "UniversityMajor mapping not found",
      });
    res.status(200).json({ status: "success", data: universityMajor });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.deleteUniversityMajor = async (req, res) => {
  try {
    await UniversityMajor.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
    res.status(200).json({
      status: "success",
      message: "UniversityMajor mapping deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
