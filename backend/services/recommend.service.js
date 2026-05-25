const Major = require("../models/major.model");
const UniversityMajor = require("../models/universityMajor.model");
const ScoreAnalysis = require("../models/scoreAnalysis.model");
const User = require("../models/user.model");

// Hàm Helper để tính điểm theo tổ hợp
const calculateCombinations = (scores) => {
  const {
    math = 0,
    literature = 0,
    english = 0,
    physics = 0,
    chemistry = 0,
    biology = 0,
    history = 0,
    geography = 0,
    civicEducation = 0,
  } = scores;

  const combinations = [
    {
      name: "A00",
      subjects: ["math", "physics", "chemistry"],
      score: math + physics + chemistry,
    },
    {
      name: "A01",
      subjects: ["math", "physics", "english"],
      score: math + physics + english,
    },
    {
      name: "B00",
      subjects: ["math", "chemistry", "biology"],
      score: math + chemistry + biology,
    },
    {
      name: "C00",
      subjects: ["literature", "history", "geography"],
      score: literature + history + geography,
    },
    {
      name: "D01",
      subjects: ["math", "literature", "english"],
      score: math + literature + english,
    },
  ];

  return combinations.filter((c) => c.score > 0);
};

const recommendBySubjects = async (userId, scores) => {
  const combinations = calculateCombinations(scores);

  // Sort descending by score
  combinations.sort((a, b) => b.score - a.score);

  const eligibleUniversityMajors = [];

  // Lấy danh sách ngành của các trường mà điểm của học sinh (theo từng tổ hợp) có khả năng đỗ
  // Khả năng đỗ: điểm chuẩn <= điểm của hs + 1 (cho tỷ lệ an toàn/thử thách)
  for (const combo of combinations) {
    const um = await UniversityMajor.find({
      subjectCombination: combo.name,
      admissionScore: { $lte: combo.score + 1 }, // Điểm có thể với tới
      isDeleted: false,
    })
      .populate("university")
      .populate("major");

    // Thêm thuộc tính để nhận dạng
    const mapped = um.map((item) => ({
      ...item.toObject(),
      matchCombination: combo.name,
      userScoreForCombination: combo.score,
      level: combo.score >= item.admissionScore ? "SAFE" : "CHALLENGE",
    }));

    eligibleUniversityMajors.push(...mapped);
  }

  // Sắp xếp
  eligibleUniversityMajors.sort(
    (a, b) => b.userScoreForCombination - a.userScoreForCombination,
  );

  // Lưu lịch sử
  const analysisRecord = await ScoreAnalysis.create({
    user: userId,
    subjectScores: scores,
    topCombinations: combinations
      .slice(0, 3)
      .map((c) => ({ combination: c.name, totalScore: c.score })),
    recommendedUniversityMajors: eligibleUniversityMajors.map((e) => e._id),
  });

  const user = await User.findById(userId);
  const plan = user ? user.subscriptionPlan : "FREE";

  let recommendations = [];
  if (plan === "PAID") {
    recommendations = eligibleUniversityMajors.map((item) => ({
      ...item,
      university: { name: "Nâng cấp gói Cao Cấp để xem trường cụ thể" },
    }));
  } else if (plan === "PREMIUM") {
    recommendations = eligibleUniversityMajors;
  } else {
    // FREE: Show top 3 but hide university name
    recommendations = eligibleUniversityMajors.slice(0, 3).map((item) => ({
      ...item,
      university: { name: "Nâng cấp gói để xem trường cụ thể" },
    }));
  }

  return {
    combinations,
    recommendations,
    analysisId: analysisRecord._id,
  };
};

const getScoreAnalysisHistory = async (userId) => {
  const user = await User.findById(userId);
  const plan = user ? user.subscriptionPlan : "FREE";

  const history = await ScoreAnalysis.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate({
      path: "recommendedUniversityMajors",
      populate: [{ path: "university" }, { path: "major" }],
    });

  return history.map((record) => {
    const recObj = record.toObject();
    if (plan === "FREE") {
      recObj.recommendedUniversityMajors = [];
    } else if (plan === "PAID") {
      recObj.recommendedUniversityMajors =
        recObj.recommendedUniversityMajors.map((item) => {
          if (item && item.university) {
            item.university = {
              name: "Nâng cấp gói Cao Cấp để xem trường cụ thể",
            };
          }
          return item;
        });
    }
    return recObj;
  });
};

const recommendByScore = async (input) => {
  // logic cũ, có thể không dùng nữa nhưng giữ để tránh lỗi API cũ
  const { score } = input;
  if (!score) throw new Error("Score is required");

  const majors = await Major.find({ isDeleted: false });
  const result = majors.map((major) => {
    let level = "LOW";
    if (score >= major.benchmarkScore) level = "HIGH";
    else if (score >= major.benchmarkScore - 2) level = "MEDIUM";

    return { ...major.toObject(), level };
  });

  const priority = { HIGH: 3, MEDIUM: 2, LOW: 1 };
  result.sort((a, b) => priority[b.level] - priority[a.level]);
  return result;
};

const recommendByHolland = async (input) => {
  const { type } = input;
  if (!type) throw new Error("Type is required");
  return await Major.find({ hollandTypes: { $in: [type] }, isDeleted: false });
};

module.exports = {
  recommendBySubjects,
  getScoreAnalysisHistory,
  recommendByScore,
  recommendByHolland,
};
