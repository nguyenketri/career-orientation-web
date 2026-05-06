const Major = require("../models/major.model");
const mongoose = require("mongoose");
// GET ALL MAJORS
const getAllMajors = async (query) => {
  const { keyword } = query;

  const filter = {
    isDeleted: false, // chỉ lấy chưa bị xoá
  };

  if (keyword) {
    filter.name = { $regex: keyword, $options: "i" };
  }

  const majors = await Major.find(filter).sort({ createdAt: -1 });

  return majors;
};

// GET MAJOR BY ID
const getMajorById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid major ID");
  }

  const major = await Major.findOne({
    _id: id,
    isDeleted: false, // thêm điều kiện
  });

  if (!major) {
    throw new Error("Major not found");
  }

  return major;
};

// CREATE MAJOR
const createMajor = async (data) => {
  const { name, description, benchmarkScore, hollandTypes } = data;

  // validate basic
  if (!name) {
    throw new Error("Major name is required");
  }

  const major = await Major.create({
    name,
    description,
    benchmarkScore,
    hollandTypes,
  });

  return major;
};

// UPDATE MAJOR
const updateMajor = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid major ID");
  }

  const major = await Major.findOneAndUpdate(
    { _id: id, isDeleted: false }, // thêm filter
    data,
    { new: true, runValidators: true },
  );

  if (!major) {
    throw new Error("Major not found or deleted");
  }

  return major;
};

// DELETE MAJOR
const deleteMajor = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid major ID");
  }

  const major = await Major.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
      deletedAt: new Date(),
    },
    { new: true },
  );

  if (!major) {
    throw new Error("Major not found");
  }

  return major;
};

module.exports = {
  getAllMajors,
  getMajorById,
  createMajor,
  updateMajor,
  deleteMajor,
};
