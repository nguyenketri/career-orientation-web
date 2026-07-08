const { GoogleGenerativeAI } = require("@google/generative-ai");
const HollandQuestion = require("../models/hollandQuestion.model");
const Major = require("../models/major.model");
const HollandResult = require("../models/hollandResult.model");
const User = require("../models/user.model");
const { limitMajorsByPlan } = require("../utils/planLimits");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(
  apiKey || "AIzaSyBo1Rd5g1pCL0FG0jOibrDX7fTQYnB_J90",
);

// Thời gian ước tính cho mỗi câu hỏi Holland (giây) — dùng để tính thời gian làm bài
const TIME_PER_QUESTION_SEC = 20;

const HOLLAND_TYPES = ["R", "I", "A", "S", "E", "C"];
const HOLLAND_PLAN_TOTAL = { PAID: 60, PREMIUM: 90, FREE: 42 };

// Lấy đều nhau số câu hỏi cho từng nhóm R/I/A/S/E/C (thay vì random trên toàn bộ
// pool). Ngân hàng câu hỏi hiện không đều giữa các nhóm (vd nhóm C nhiều hơn hẳn
// các nhóm khác) — nếu random tự do, 1 lần test có thể vô tình chứa nhiều câu
// nhóm này hơn nhóm kia, khiến điểm cộng dồn theo nhóm bị lệch bởi số lượng câu
// hỏi chứ không phải do lựa chọn thực sự của người dùng (kết quả bị "dính" 1 type
// dù trả lời khác nhau). Chia đều số câu mỗi nhóm để đảm bảo công bằng.
const getQuestions = async (plan) => {
  const total = HOLLAND_PLAN_TOTAL[plan] || HOLLAND_PLAN_TOTAL.FREE;
  const perType = Math.floor(total / HOLLAND_TYPES.length);

  const selected = [];
  for (const type of HOLLAND_TYPES) {
    // $ne (không dùng === false/true) để tương thích ngược với các câu hỏi cũ
    // trong Mongo Atlas chưa có field isActive/isDeleted (coi như mặc định là còn hoạt động)
    const pool = await HollandQuestion.find({
      type,
      isDeleted: { $ne: true },
      isActive: { $ne: false },
    });
    const shuffled = pool.sort(() => 0.5 - Math.random());
    selected.push(...shuffled.slice(0, Math.min(perType, shuffled.length)));
  }

  return selected.sort(() => 0.5 - Math.random());
};

const submitHollandTest = async (userId, answers) => {
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

  // Check user plan
  let plan = "FREE";
  if (userId) {
    const user = await User.findById(userId);
    plan = user?.subscriptionPlan || "FREE";
  }

  //  Luôn tính đầy đủ ngành phù hợp và lưu toàn bộ vào DB — số lượng hiển thị
  // cho user được giới hạn theo gói ở thời điểm ĐỌC (limitMajorsByPlan), không
  // phải ở thời điểm lưu, để user nâng cấp gói thì bài test cũ cũng mở khoá
  // thêm gợi ý ngay lập tức.
  const majors = await Major.find({
    hollandTypes: { $in: topTypes },
    isDeleted: false,
  });
  const recommendedMajors = majors.map((m) => m._id);

  // Lưu kết quả vào database
  const newResult = await HollandResult.create({
    user: userId,
    hollandType: topType,
    topTypes,
    hollandScores: scores,
    recommendedMajors,
  });

  // Fetch populated data
  const populatedResult = await HollandResult.findById(
    newResult._id,
  ).populate({
    path: "recommendedMajors",
    populate: {
      path: "universities",
      model: "University",
    },
  });
  populatedResult.recommendedMajors = limitMajorsByPlan(
    populatedResult.recommendedMajors,
    plan,
  );

  return populatedResult;
};

const generateAiAnalysis = async (resultId) => {
  try {
    const result = await HollandResult.findById(resultId).populate({
      path: "recommendedMajors",
      populate: {
        path: "university",
        model: "University",
      },
    });
    if (!result) {
      throw new Error("Holland result not found");
    }

    // Create prompt for AI analysis
    const typeDescriptions = {
      R: "Realistic - Thích công việc thực tế, kỹ thuật, xây dựng",
      I: "Investigative - Thích nghiên cứu, phân tích, khám phá",
      A: "Artistic - Thích sáng tạo, thiết kế, biểu diễn nghệ thuật",
      S: "Social - Thích giúp đỡ người khác, giao tiếp, dạy dỗ",
      E: "Enterprising - Thích lãnh đạo, quản lý, kinh doanh",
      C: "Conventional - Thích tổ chức, quản lý thông tin, quy trình",
    };

    const topTypesText = result.topTypes
      .map((t) => `${t} (${typeDescriptions[t]})`)
      .join(", ");
    const majorsText = result.recommendedMajors
      .slice(0, 5)
      .map((m) => m.name)
      .join(", ");

    const prompt = `Tôi vừa hoàn thành bài kiểm tra Holland Code. Kết quả của tôi là:
- Loại Holland chính: ${result.hollandType}
- Top 3 loại: ${topTypesText}
- Điểm số: R=${result.hollandScores.R}, I=${result.hollandScores.I}, A=${result.hollandScores.A}, S=${result.hollandScores.S}, E=${result.hollandScores.E}, C=${result.hollandScores.C}

Ngành học gợi ý: ${majorsText}

Hãy phân tích chi tiết:
1. Ý nghĩa của kết quả Holland này với tôi
2. Ưu điểm và khả năng của tôi dựa vào loại Holland này
3. Những công việc và ngành học phù hợp nhất
4. Lời khuyên cho hướng nghiệp tương lai

Giữ đáp án thân thiện, tích cực và xây dựng.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const response = await model.generateContent(prompt);
    const analysisText = response.response.text();

    // Save analysis to result
    result.aiAnalysis = analysisText;
    await result.save();

    return {
      hollandType: result.hollandType,
      analysis: analysisText,
    };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
};

module.exports = {
  getQuestions,
  submitHollandTest,
  generateAiAnalysis,
  TIME_PER_QUESTION_SEC,
};
