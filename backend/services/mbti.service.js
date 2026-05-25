const MbtiQuestion = require("../models/mbtiQuestion.model");
const MbtiResult = require("../models/mbtiResult.model");
const Major = require("../models/major.model");

const getQuestions = async (plan) => {
  const allQuestions = await MbtiQuestion.find({ isDeleted: false });
  if (plan === "FREE") {
    return allQuestions.slice(0, 15);
  }
  return allQuestions;
};

const submitMbtiTest = async (userId, answers) => {
  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    throw new Error("Answers are required");
  }

  // Khởi tạo điểm
  const scores = {
    E: 0,
    I: 0,
    S: 0,
    N: 0,
    T: 0,
    F: 0,
    J: 0,
    P: 0,
  };

  // Đếm điểm: answer = { typeValue: 'E' }
  answers.forEach((ans) => {
    if (scores.hasOwnProperty(ans.typeValue)) {
      scores[ans.typeValue] += 1;
    }
  });

  // Tính Type MBTI
  const eStr = scores.E > scores.I ? "E" : "I";
  const sStr = scores.S > scores.N ? "S" : "N";
  const tStr = scores.T > scores.F ? "T" : "F";
  const jStr = scores.J > scores.P ? "J" : "P";

  const mbtiType = `${eStr}${sStr}${tStr}${jStr}`;

  // Tìm ngành phù hợp (chứa mbtiType)
  const majors = await Major.find({
    mbtiTypes: { $in: [mbtiType] },
    isDeleted: false,
  });

  // Lưu kết quả
  const newResult = await MbtiResult.create({
    user: userId,
    mbtiType,
    scores,
    recommendedMajors: majors.map((m) => m._id),
  });

  // Fetch populated data
  const populatedResult = await MbtiResult.findById(newResult._id).populate(
    "recommendedMajors",
  );

  return populatedResult;
};

const getMbtiHistory = async (userId) => {
  return await MbtiResult.find({ user: userId })
    .populate("recommendedMajors")
    .sort({ createdAt: -1 });
};

module.exports = {
  getQuestions,
  submitMbtiTest,
  getMbtiHistory,
};
