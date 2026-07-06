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
    {
      name: "D07",
      subjects: ["math", "chemistry", "english"],
      score: math + chemistry + english,
    },
    {
      name: "D15",
      subjects: ["literature", "geography", "english"],
      score: literature + geography + english,
    },
  ];

  return combinations.filter((c) => c.score > 0);
};

// Trả về danh sách năm có dữ liệu điểm chuẩn (giảm dần: mới nhất trước)
const getAvailableYears = async () => {
  const years = await UniversityMajor.distinct("admissionHistory.year", {
    isDeleted: false,
  });
  return years.filter((y) => y != null).sort((a, b) => b - a);
};

// Lấy dữ liệu tuyển sinh của 1 ngành-trường theo năm được chọn.
// year = "all" (hoặc null) => dùng năm mới nhất để hiển thị headline.
const getAdmissionForYear = (item, year, latestYear) => {
  const hist = Array.isArray(item.admissionHistory)
    ? item.admissionHistory
    : [];
  const targetYear = year && year !== "all" ? Number(year) : latestYear;

  const rec = hist.find((h) => Number(h.year) === Number(targetYear));
  if (rec) {
    return {
      year: rec.year,
      admissionScore: rec.admissionScore,
      tuitionFee: rec.tuitionFee != null ? rec.tuitionFee : item.tuitionFee,
      subjectCombination: rec.subjectCombination || item.subjectCombination,
    };
  }

  // Fallback: bản ghi năm mới nhất trong lịch sử, rồi tới dữ liệu top-level
  if (hist.length) {
    const latest = [...hist].sort((a, b) => b.year - a.year)[0];
    return {
      year: latest.year,
      admissionScore: latest.admissionScore,
      tuitionFee:
        latest.tuitionFee != null ? latest.tuitionFee : item.tuitionFee,
      subjectCombination: latest.subjectCombination || item.subjectCombination,
    };
  }
  return {
    year: null,
    admissionScore: item.admissionScore,
    tuitionFee: item.tuitionFee,
    subjectCombination: item.subjectCombination,
  };
};

const recommendBySubjects = async (
  userId,
  scores,
  filters = {},
  pagination = {},
  options = {},
) => {
  const combinations = calculateCombinations(scores);
  const { location, type, maxTuition } = filters;
  const { page = 1, limit = 5 } = pagination;
  const { year = "all", saveHistory = false } = options;

  const availableYears = await getAvailableYears();
  const latestYear = availableYears[0] || new Date().getFullYear();
  const selectedYear = year && year !== "all" ? Number(year) : "all";

  // Sort descending by score
  combinations.sort((a, b) => b.score - a.score);

  let eligibleUniversityMajors = [];

  // Lấy danh sách ngành của các trường mà điểm học sinh (theo từng tổ hợp) có
  // khả năng đỗ. Lọc điểm chuẩn / học phí theo ĐÚNG năm đang chọn.
  for (const combo of combinations) {
    // Ngành phù hợp là ngành có khai báo tổ hợp này trong subjectCombinations
    // (một ngành tại một trường thường được xét tuyển bằng NHIỀU tổ hợp, không
    // chỉ tổ hợp "chính" lưu trên UniversityMajor), nên lọc theo Major trước.
    const matchingMajorIds = await Major.find({
      subjectCombinations: combo.name,
      isDeleted: { $ne: true },
    }).distinct("_id");

    if (matchingMajorIds.length === 0) continue;

    const um = await UniversityMajor.find({
      major: { $in: matchingMajorIds },
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

    // Bỏ qua nếu trường/ngành không khớp bộ lọc hoặc đã bị xóa
    const filteredUm = um.filter(
      (item) => item.university !== null && item.major !== null,
    );

    for (const doc of filteredUm) {
      const item = doc.toObject();
      const admission = getAdmissionForYear(item, selectedYear, latestYear);

      if (admission.admissionScore == null) continue;

      // Lọc theo dải điểm (điểm chuẩn <= điểm user + 5) theo năm đang chọn
      if (admission.admissionScore > combo.score + 5) continue;

      // Lọc theo học phí (dùng học phí của năm đang chọn)
      if (maxTuition) {
        const fee =
          admission.tuitionFee != null ? admission.tuitionFee : item.tuitionFee;
        if (fee != null && Number(fee) > Number(maxTuition)) continue;
      }

      eligibleUniversityMajors.push({
        ...item,
        matchCombination: combo.name,
        userScoreForCombination: combo.score,
        // Ghi đè điểm chuẩn & học phí về đúng năm đang chọn để hiển thị
        displayYear: admission.year,
        admissionScore: admission.admissionScore,
        tuitionFee:
          admission.tuitionFee != null ? admission.tuitionFee : item.tuitionFee,
        level: combo.score >= admission.admissionScore ? "SAFE" : "CHALLENGE",
      });
    }
  }

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

  // Sắp xếp theo điểm chuẩn giảm dần (trường top hiển thị trước)
  uniqueResults.sort(
    (a, b) => (b.admissionScore || 0) - (a.admissionScore || 0),
  );

  let analysisRecord = null;
  // Chỉ lưu lịch sử khi là lần tìm kiếm thật (không lưu khi đổi năm / xem thêm)
  if (userId && page === 1 && saveHistory) {
    try {
      analysisRecord = await ScoreAnalysis.create({
        user: userId,
        subjectScores: scores,
        targetYear: selectedYear === "all" ? undefined : selectedYear,
        filters: { location, type, maxTuition, year: selectedYear },
        topCombinations: combinations.map((c) => ({
          combination: c.name,
          totalScore: c.score,
        })),
        recommendedUniversityMajors: uniqueResults.map((e) => e._id),
      });
    } catch (createErr) {
      console.error(
        "[Recommend] Failed to save ScoreAnalysis:",
        createErr.message,
      );
    }
  }

  // Pagination
  const total = uniqueResults.length;
  const startIndex = (page - 1) * limit;
  const paginatedResults = uniqueResults.slice(startIndex, startIndex + limit);

  return {
    combinations,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
    recommendations: paginatedResults,
    analysisId: analysisRecord ? analysisRecord._id : null,
    availableYears,
    latestYear,
    selectedYear,
  };
};

const getScoreAnalysisHistory = async (userId) => {
  const history = await ScoreAnalysis.find({ user: userId })
    .sort({ createdAt: -1 })
    .select("-recommendedUniversityMajors")
    .lean();

  return history;
};

const getScoreAnalysisById = async (id, userId) => {
  const record = await ScoreAnalysis.findOne({ _id: id, user: userId })
    .populate({
      path: "recommendedUniversityMajors",
      populate: [{ path: "university" }, { path: "major" }],
    })
    .lean();

  return record;
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
  getAvailableYears,
  getScoreAnalysisHistory,
  getScoreAnalysisById,
  recommendByScore,
  recommendByHolland,
  generateCombinedAiAnalysis,
};
