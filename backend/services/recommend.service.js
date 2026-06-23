const { GoogleGenerativeAI } = require("@google/generative-ai");
const Major = require("../models/major.model");
const UniversityMajor = require("../models/universityMajor.model");
const ScoreAnalysis = require("../models/scoreAnalysis.model");
const User = require("../models/user.model");
const HollandResult = require("../models/hollandResult.model");
const MbtiResult = require("../models/mbtiResult.model");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(
  apiKey || "AIzaSyBo1Rd5g1pCL0FG0jOibrDX7fTQYnB_J90",
);

// Hàm Helper để tính điểm theo tổ hợp
const calculateCombinations = (scores) => {
  if (!scores) return [];
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

  console.log("\n--- Recommendation Request ---");
  console.log("Filters:", { location, type, maxTuition });
  console.log("Combinations:", combinations);

  // Sort descending by score
  combinations.sort((a, b) => b.score - a.score);

  let eligibleUniversityMajors = [];

  // Lấy danh sách ngành của các trường mà điểm của học sinh (theo từng tổ hợp) có khả năng đỗ
  for (const combo of combinations) {
    const um = await UniversityMajor.find({
      subjectCombination: combo.name,
      admissionScore: { $lte: combo.score + 5 },
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
    console.log(
      `- Combo ${combo.name}: Found ${um.length} total, ${filteredUm.length} matched filters`,
    );

    // Filter by tuition fee
    const finalUm = maxTuition
      ? filteredUm.filter((item) => {
          const itemObj = item.toObject();

          // Try to get tuition fee from top level or the most recent admission history
          let fee = itemObj.tuitionFee;
          if (
            (fee === undefined || fee === null) &&
            itemObj.admissionHistory?.length > 0
          ) {
            // Get the most recent year's tuition fee
            const sortedHistory = [...itemObj.admissionHistory].sort(
              (a, b) => b.year - a.year,
            );
            fee = sortedHistory[0].tuitionFee;
          }

          const numericMaxTuition = Number(maxTuition);
          const numericFee =
            fee !== undefined && fee !== null ? Number(fee) : null;

          // If fee is missing, we allow it (as per previous requirement)
          if (numericFee === null) return true;

          const isAllowed = numericFee <= numericMaxTuition;

          if (!isAllowed) {
            console.log(
              `[TuitionFilter] Filtering out Major ${itemObj._id}: Fee ${numericFee} > Max ${numericMaxTuition}`,
            );
          }
          return isAllowed;
        })
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
    if (!item.university || !item.major) continue;
    const key = `${item.university._id}-${item.major._id}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueResults.push(item);
    }
  }

  let analysisRecord = null;
  // Lưu lịch sử chỉ khi có userId (User đã đăng nhập)
  if (userId) {
    try {
      console.log("Creating ScoreAnalysis record for user:", userId);
      analysisRecord = await ScoreAnalysis.create({
        user: userId,
        subjectScores: scores,
        filters: {
          location,
          type,
          maxTuition,
        },
        topCombinations: combinations.map((c) => ({
          combination: c.name,
          totalScore: c.score,
        })),
        recommendedUniversityMajors: uniqueResults.map((e) => e._id),
      });
      console.log(
        "ScoreAnalysis record created successfully:",
        analysisRecord._id,
      );
    } catch (createErr) {
      console.error("Error creating ScoreAnalysis record:", createErr);
      // We don't throw here so the user still gets their recommendations even if history fails
    }
  }

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
    analysisId: analysisRecord ? analysisRecord._id : null,
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

const generateCombinedAiAnalysis = async (userId) => {
  try {
    const hollandResult = await HollandResult.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .populate("recommendedMajors");
    const mbtiResult = await MbtiResult.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .populate("recommendedMajors");

    if (!hollandResult || !mbtiResult) {
      throw new Error(
        "Both Holland and MBTI tests must be completed to generate a combined analysis.",
      );
    }

    const hollandMajors = hollandResult.recommendedMajors
      .slice(0, 5)
      .map((m) => m.name)
      .join(", ");
    const mbtiMajors = mbtiResult.recommendedMajors
      .slice(0, 5)
      .map((m) => m.name)
      .join(", ");

    const prompt = `Tôi là một chuyên gia hướng nghiệp. Tôi có kết quả của một học sinh từ hai bài kiểm tra:
1. Holland Code:
- Loại chính: ${hollandResult.hollandType}
- Top 3 loại: ${hollandResult.topTypes.join(", ")}
- Điểm số: ${JSON.stringify(hollandResult.hollandScores)}
- Ngành gợi ý: ${hollandMajors}

2. MBTI:
- Loại tính cách: ${mbtiResult.mbtiType}
- Điểm số: ${JSON.stringify(mbtiResult.scores)}
- Ngành gợi ý: ${mbtiMajors}

Hãy phân tích sự giao thoa giữa hai kết quả này để đưa ra kết luận tốt nhất cho học sinh:
1. Sự tương đồng và bổ trợ giữa loại Holland và loại MBTI của học sinh này.
2. Phân tích sâu về thế mạnh cốt lõi khi kết hợp cả hai kết quả.
3. Đề xuất 3-5 ngành học/nghề nghiệp phù hợp nhất (là những ngành xuất hiện ở cả hai hoặc phù hợp nhất với cả hai đặc điểm tính cách).
4. Lộ trình phát triển bản thân và lời khuyên cụ thể để đạt được thành công trong các ngành đề xuất.

Hãy viết một cách chuyên nghiệp, truyền cảm hứng, chi tiết và mang tính định hướng cao.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const response = await model.generateContent(prompt);
    const analysisText = response.response.text();

    return {
      analysis: analysisText,
      hollandType: hollandResult.hollandType,
      mbtiType: mbtiResult.mbtiType,
    };
  } catch (error) {
    console.error("Combined AI Analysis Error:", error);
    throw error;
  }
};

module.exports = {
  recommendBySubjects,
  getScoreAnalysisHistory,
  recommendByScore,
  recommendByHolland,
  generateCombinedAiAnalysis,
};
