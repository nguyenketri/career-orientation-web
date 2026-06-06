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

const recommendBySubjects = async (
  userId,
  scores,
  filters = {},
  pagination = {},
) => {
  const combinations = calculateCombinations(scores);
  const { location, type, maxTuition } = filters;
  const { page = 1, limit = 5 } = pagination;

  // Sort descending by score
  combinations.sort((a, b) => b.score - a.score);

  let eligibleUniversityMajors = [];

  // Lấy danh sách ngành của các trường mà điểm của học sinh (theo từng tổ hợp) có khả năng đỗ
  for (const combo of combinations) {
    const um = await UniversityMajor.find({
      subjectCombination: combo.name,
      admissionScore: { $lte: combo.score + 2 }, // Mở rộng khoảng điểm để tìm được nhiều trường hơn
      isDeleted: false,
    })
      .populate({
        path: "university",
        match: {
          isDeleted: false,
          ...(location && { location }),
          ...(type && { type }),
        },
      })
      .populate("major");

    // Filter out if university didn't match filters
    const filteredUm = um.filter((item) => item.university !== null);

    // Filter by tuition fee
    const finalUm = maxTuition
      ? filteredUm.filter((item) => item.tuitionFee <= maxTuition)
      : filteredUm;

    // Thêm thuộc tính để nhận dạng
    const mapped = finalUm.map((item) => ({
      ...item.toObject(),
      matchCombination: combo.name,
      userScoreForCombination: combo.score,
      level: combo.score >= item.admissionScore ? "SAFE" : "CHALLENGE",
    }));

    eligibleUniversityMajors.push(...mapped);
  }

  // Sắp xếp theo điểm user giảm dần
  eligibleUniversityMajors.sort(
    (a, b) => b.userScoreForCombination - a.userScoreForCombination,
  );

  // Loại bỏ trùng lặp (một ngành ở một trường có thể xuất hiện ở nhiều tổ hợp)
  const uniqueResults = [];
  const seen = new Set();
  for (const item of eligibleUniversityMajors) {
    const key = `${item.university._id}-${item.major._id}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueResults.push(item);
    }
  }

  // Lưu lịch sử
  const analysisRecord = await ScoreAnalysis.create({
    user: userId,
    subjectScores: scores,
    topCombinations: combinations.map((c) => ({
      combination: c.name,
      totalScore: c.score,
    })),
    recommendedUniversityMajors: uniqueResults.map((e) => e._id),
  });

  const processedResults = uniqueResults;

  // Pagination
  const total = processedResults.length;
  const startIndex = (page - 1) * limit;
  const paginatedResults = processedResults.slice(
    startIndex,
    startIndex + limit,
  );

  return {
    combinations,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
    recommendations: paginatedResults,
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

  return history.map((record) => record.toObject());
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
