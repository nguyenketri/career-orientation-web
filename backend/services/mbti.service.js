const { GoogleGenerativeAI } = require("@google/generative-ai");
const MbtiQuestion = require("../models/mbtiQuestion.model");
const MbtiResult = require("../models/mbtiResult.model");
const Major = require("../models/major.model");

const User = require("../models/user.model");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(
  apiKey || "AIzaSyBo1Rd5g1pCL0FG0jOibrDX7fTQYnB_J90",
);

const getQuestions = async (plan) => {
  const allQuestions = await MbtiQuestion.find({ isDeleted: false });
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  if (plan === "PAID") return shuffled.slice(0, 48);
  if (plan === "PREMIUM") return shuffled.slice(0, 72);
  return shuffled.slice(0, 28); // FREE default
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

  // Check user plan
  const user = userId ? await User.findById(userId) : null;
  const plan = user?.subscriptionPlan || "FREE";

  // Tìm ngành phù hợp (chứa mbtiType) - Only for PAID and PREMIUM
  let recommendedMajors = [];
  if (plan === "PAID" || plan === "PREMIUM") {
    const majors = await Major.find({
      mbtiTypes: { $in: [mbtiType] },
      isDeleted: false,
    });
    recommendedMajors = majors.map((m) => m._id);
  }

  // Luôn lưu kết quả vào database kể cả guest để có Object ID
  const newResult = await MbtiResult.create({
    user: userId || null,
    mbtiType,
    scores,
    recommendedMajors,
  });

  // Fetch populated data
  const populatedResult = await MbtiResult.findById(newResult._id).populate(
    "recommendedMajors",
  );

  return populatedResult;
};

const getMbtiHistory = async (userId) => {
  return await MbtiResult.find({ user: userId })
    .populate({
      path: "recommendedMajors",
      populate: {
        path: "universities",
        model: "University",
      },
    })
    .sort({ createdAt: -1 });
};

const generateAiAnalysis = async (resultId) => {
  try {
    const result =
      await MbtiResult.findById(resultId).populate("recommendedMajors");
    if (!result) {
      throw new Error("MBTI result not found");
    }

    const mbtiDescriptions = {
      INTJ: "Nhà chiến lược - Tư duy logic, độc lập, tầm nhìn xa",
      INTP: "Nhà tư duy - Tò mò, phân tích, thích lý thuyết",
      ENTJ: "Nhà điều hành - Quyết đoán, lãnh đạo, tổ chức",
      ENTP: "Nhà tranh biện - Sáng tạo, linh hoạt, thích thử thách",
      INFJ: "Nhà tư vấn - Lý tưởng, thấu cảm, hướng nội",
      INFP: "Nhà hòa giải - Nhạy cảm, lý tưởng, trung thành",
      ENFJ: "Nhà giáo huấn - Truyền cảm hứng, nhiệt huyết, thấu hiểu",
      ENFP: "Nhà vận động - Năng động, sáng tạo, cởi mở",
      ISTJ: "Nhà logistics - Thực tế, trách nhiệm, kỷ luật",
      ISFJ: "Nhà bảo vệ - Tận tụy, ấm áp, chu đáo",
      ESTJ: "Nhà quản lý - Thực tế, quyết đoán, truyền thống",
      ESFJ: "Nhà cung cấp - Hòa đồng, tận tâm, chu đáo",
      ISTP: "Nhà kỹ thuật - Thực tế, linh hoạt, thích khám phá",
      ISFP: "Nhà nghệ sĩ - Nhạy cảm, yêu cái đẹp, tự do",
      ESTP: "Nhà doanh nhân - Năng động, thực tế, quyết đoán",
      ESFP: "Nhà giải trí - Vui vẻ, nhiệt tình, sống cho hiện tại",
    };

    const typeDescription =
      mbtiDescriptions[result.mbtiType] || "Loại tính cách MBTI";
    const majorsText = result.recommendedMajors
      .slice(0, 5)
      .map((m) => m.name)
      .join(", ");

    const prompt = `Tôi vừa hoàn thành bài kiểm tra MBTI. Kết quả của tôi là:
- Loại MBTI: ${result.mbtiType} (${typeDescription})
- Điểm số chi tiết: E=${result.scores.E}, I=${result.scores.I}, S=${result.scores.S}, N=${result.scores.N}, T=${result.scores.T}, F=${result.scores.F}, J=${result.scores.J}, P=${result.scores.P}

Ngành học gợi ý: ${majorsText}

Hãy phân tích chi tiết:
1. Ý nghĩa của kết quả MBTI này với tôi
2. Ưu điểm và khả năng của tôi dựa vào loại MBTI này
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
      mbtiType: result.mbtiType,
      analysis: analysisText,
    };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
};

module.exports = {
  getQuestions,
  submitMbtiTest,
  getMbtiHistory,
  generateAiAnalysis,
};
