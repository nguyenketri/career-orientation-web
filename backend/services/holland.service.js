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

  //  đếm điểm (cộng dồn điểm theo Likert scale)
  answers.forEach((answer) => {
    if (scores.hasOwnProperty(answer.type)) {
      // Nếu answer có score (từ Likert scale 1-5), cộng điểm đó, nếu không mặc định +1 như cũ
      scores[answer.type] += answer.score ? Number(answer.score) : 1;
    }
  });

  //  tìm top 3 type cao nhất
  const sortedTypes = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
  const topTypes = sortedTypes.slice(0, 3);
  const topType = topTypes[0];

  //  tìm ngành phù hợp với top 1, hoặc chứa bất kỳ type nào trong top 3 (tùy vào logic ưu tiên, ở đây dùng topType cho ngành rất phù hợp)
  const majors = await Major.find({
    hollandTypes: { $in: topTypes },
    isDeleted: false,
  });

  return {
    hollandScores: scores,
    topType,
    topTypes,
    recommendedMajors: majors,
  };
};
module.exports = {
  getQuestions,
  submitHollandTest,
};
