const HollandQuestion = require("../models/hollandQuestion.model");
const Major = require("../models/major.model");

const getQuestions = async () => {
  return await HollandQuestion.find();
};

const submitHollandTest = async (answers) => {
  if (!answers || answers.length === 0) {
    throw new Error("Answers are required");
  }

  //  khởi tạo điểm Holland
  const scores = {
    R: 0,
    I: 0,
    A: 0,
    S: 0,
    E: 0,
    C: 0,
  };

  //  đếm điểm
  answers.forEach((answer) => {
    if (scores.hasOwnProperty(answer.type)) {
      scores[answer.type]++;
    }
  });

  //  tìm type cao nhất
  let topType = "R";

  for (const type in scores) {
    if (scores[type] > scores[topType]) {
      topType = type;
    }
  }

  //  tìm ngành phù hợp
  const majors = await Major.find({
    hollandTypes: topType,
    isDeleted: false,
  });

  return {
    hollandScores: scores,
    topType,
    recommendedMajors: majors,
  };
};
module.exports = {
  getQuestions,
  submitHollandTest,
};
