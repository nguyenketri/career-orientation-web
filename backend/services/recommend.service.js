const Major = require("../models/major.model");

const recommendByScore = async (input) => {
  const { score } = input;

  if (!score) {
    throw new Error("Score is required");
  }

  // 🔥 lấy tất cả ngành chưa bị xoá
  const majors = await Major.find({ isDeleted: false });

  const result = majors.map((major) => {
    let level = "LOW";

    if (score >= major.benchmarkScore) {
      level = "HIGH";
    } else if (score >= major.benchmarkScore - 2) {
      level = "MEDIUM";
    }

    return {
      _id: major._id,
      name: major.name,
      benchmarkScore: major.benchmarkScore,
      level,
    };
  });

  //  sort: HIGH -> MEDIUM -> LOW
  const priority = { HIGH: 3, MEDIUM: 2, LOW: 1 };

  result.sort((a, b) => priority[b.level] - priority[a.level]);

  return result;
};

module.exports = {
  recommendByScore,
};
