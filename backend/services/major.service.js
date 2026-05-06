const Major = require("../models/major.model");

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
  createMajor,
};
