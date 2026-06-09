const Groq = require("groq-sdk");
const universityService = require("../services/university.service");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const analyzeComparison = async (req, res) => {
  try {
    const { selectedMajors } = req.body;

    if (
      !selectedMajors ||
      !Array.isArray(selectedMajors) ||
      selectedMajors.length < 2
    ) {
      return res.status(400).json({
        message: "Please select at least 2 majors to compare.",
      });
    }

    // Prepare data for AI
    const comparisonData = selectedMajors.map((item, index) => {
      return {
        index: index + 1,
        university: item.university?.name,
        major: item.major?.name,
        tuitionFee: item.tuitionFee,
        admissionScore: item.admissionScore,
        facilities: item.university?.facilities || [],
        rating: item.university?.rating,
        reviewCount: item.university?.reviewCount,
        address: item.university?.address,
      };
    });

    const prompt = `
      You are an expert educational consultant. Analyze the following comparison between ${selectedMajors.length} university majors and provide a professional, insightful analysis for a high school student.

      Data:
      ${JSON.stringify(comparisonData, null, 2)}

      Requirements:
      1. Analyze the pros and cons of each option based on tuition, admission scores, facilities, and student reviews.
      2. Compare them against each other.
      3. Provide a concise, encouraging, and smart piece of advice to help the student choose.
      4. Use a professional yet friendly tone.
      5. The response must be in Vietnamese.
      6. Format the response with clear headings and bullet points for readability.
      7. Keep the analysis focused and "high-value" (đáng tiền).

      Structure:
      - Phân tích chi tiết từng lựa chọn (Ưu & Nhược điểm)
      - So sánh tổng quan
      - Lời khuyên từ chuyên gia AI
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });
    const text = chatCompletion.choices[0]?.message?.content || "";

    res.status(200).json({ analysis: text });
  } catch (error) {
    console.error("AI Analysis Error Details:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
    });
    res.status(500).json({
      message: "Failed to generate AI analysis.",
      error: error.message,
    });
  }
};

const getPublicComparison = async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res
        .status(400)
        .json({ message: "No IDs provided for comparison." });
    }

    const idList = ids.split(",");
    const data = await universityService.getUniversityMajorsByIds(idList);

    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ message: "No matching university majors found." });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Public Comparison Error:", error);
    res.status(500).json({
      message: "Internal server error while fetching public comparison.",
    });
  }
};

module.exports = {
  analyzeComparison,
  getPublicComparison,
};
