const Major = require("../models/major.model");

// GET ALL MAJORS
const getAllMajors = async (query) => {
  const { keyword } = query;

  // filter cơ bản (search theo tên)
  const filter = {};

  if (keyword) {
    filter.name = { $regex: keyword, $options: "i" }; // không phân biệt hoa thường
  }

  const majors = await Major.find(filter).sort({ createdAt: -1 });
  console.log(majors);
  return majors;
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

module.exports = {
  getAllMajors,
  createMajor,
};
