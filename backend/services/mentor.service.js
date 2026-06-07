const Groq = require("groq-sdk");
const ChatHistory = require("../models/chatHistory.model");
const User = require("../models/user.model");

// Hãy chắc chắn bạn đã tạo file .env ở thư mục gốc chứa GROQ_API_KEY hợp lệ
const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.warn("⚠️ CẢNH BÁO: Không tìm thấy GROQ_API_KEY trong file .env!");
}

const groq = new Groq({ apiKey });

// Daily question limits by plan
const DAILY_LIMITS = {
  FREE: 7,
  PAID: 50,
  PREMIUM: Infinity,
};

// Helper to check daily usage
const checkDailyQuota = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const plan = user.subscriptionPlan || "FREE";
  const limit = DAILY_LIMITS[plan];

  // Count messages sent by this user today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sessionCount = await ChatHistory.countDocuments({
    user: userId,
    createdAt: { $gte: today },
  });

  // Each chat session has at least 1 message (user's first message)
  const estimatedDailyMessages = sessionCount;

  if (estimatedDailyMessages >= limit) {
    throw new Error(
      `Daily question limit reached for ${plan} plan (${limit}/day). Try again tomorrow or upgrade your plan.`,
    );
  }

  return { plan, limit, used: estimatedDailyMessages };
};

const getChatSession = async (userId, sessionId) => {
  let session = await ChatHistory.findOne({ user: userId, sessionId });
  if (!session) {
    session = await ChatHistory.create({
      user: userId,
      sessionId,
      messages: [],
    });
  }
  return session;
};

const sendChatMessage = async (userId, sessionId, message) => {
  try {
    // Check daily quota before processing
    const quota = await checkDailyQuota(userId);
    console.log(`[Mentor] User ${userId} quota status:`, quota);

    const user = await User.findById(userId);
    const plan = user.subscriptionPlan || "FREE";

    // Xây dựng System Instruction dựa trên thông tin người dùng (Cá nhân hóa cho Premium)
    let systemInstruction = `Bạn là caZup AI Mentor - Chuyên gia tư vấn định hướng NGÀNH HỌC và TRƯỜNG ĐẠI HỌC.
Nhiệm vụ của bạn:
1. Chỉ tập trung tư vấn về chọn ngành, chọn trường, học phí, điểm chuẩn, môi trường học tập.
2. TUYỆT ĐỐI KHÔNG tư vấn về các vấn đề nghề nghiệp chuyên sâu sau khi ra trường, tình yêu, cuộc sống hay các chủ đề ngoài giáo dục đại học.
3. Nếu người dùng hỏi ngoài phạm vi, hãy khéo léo từ chối và nhắc họ quay lại chủ đề chọn ngành/trường.
4. Phản hồi thân thiện, chuyên nghiệp, sử dụng emoji phù hợp.
5. Ngôn ngữ: Tiếng Việt.`;

    if (plan === "PREMIUM" && user.careerPath) {
      const { hollandType, mbtiType } = user.careerPath;
      systemInstruction += `\n\nThông tin người dùng (Dành riêng cho gói Premium):
- Loại hình Holland: ${hollandType || "Chưa làm trắc nghiệm"}
- Nhóm tính cách MBTI: ${mbtiType || "Chưa làm trắc nghiệm"}
Hãy sử dụng thông tin này để đưa ra lời khuyên cá nhân hóa nhất cho họ.`;
    }

    const session = await getChatSession(userId, sessionId);

    // Chuẩn bị lịch sử trò chuyện đúng chuẩn của Groq (OpenAI format)
    const messages = [
      { role: "system", content: systemInstruction },
      ...session.messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    // 1. Lưu tin nhắn thực tế của user vào database trước khi gọi API
    session.messages.push({ role: "user", content: message });

    // 2. Gọi API Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
    });

    const responseText =
      chatCompletion.choices[0]?.message?.content ||
      "Xin lỗi, tôi không thể tạo phản hồi lúc này.";

    // 3. Lưu phản hồi của AI vào database
    session.messages.push({ role: "model", content: responseText });

    // 4. Tự động tạo tiêu đề nếu là tin nhắn đầu tiên
    if (session.messages.length <= 2 && session.title === "New Chat") {
      try {
        const titleCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "Bạn là một trợ lý giúp tạo tiêu đề ngắn gọn (tối đa 6 từ) cho cuộc hội thoại dựa trên tin nhắn của người dùng. Trả về trực tiếp tiêu đề, không thêm dấu ngoặc kép hay bất kỳ giải thích nào. Ví dụ: 'Tư vấn ngành CNTT', 'So sánh Đại học FPT và HUST'.",
            },
            { role: "user", content: message },
          ],
          model: "llama-3.3-70b-versatile",
        });
        const generatedTitle = titleCompletion.choices[0]?.message?.content
          ?.replace(/["']/g, "")
          .trim();
        if (generatedTitle) {
          session.title = generatedTitle;
        }
      } catch (titleError) {
        console.error("Error generating title:", titleError);
        // Fallback to first few words of message
        session.title =
          message.split(" ").slice(0, 5).join(" ").substring(0, 40) + "...";
      }
    }

    // 5. Đồng bộ xuống Database
    await session.save();

    return {
      response: responseText,
      history: session.messages,
    };
  } catch (error) {
    // In trực tiếp lỗi chi tiết ra màn hình đen Server để bắt bệnh chính xác
    console.error("❌ LỖI TẠI HÀM SEND_CHAT_MESSAGE:", error.message);

    if (error.message?.includes("429") || error.status === 429) {
      throw new Error(
        "Hệ thống AI đang bận do quá nhiều yêu cầu (Quota Limit). Vui lòng thử lại sau 1 phút hoặc nâng cấp gói để được ưu tiên. 😊",
      );
    }

    throw new Error(
      "Xin lỗi, Mentor đang gặp chút trục trặc kỹ thuật. Bạn thử lại sau nhé!",
    );
  }
};

const getChatSessions = async (userId) => {
  return await ChatHistory.find({ user: userId })
    .sort({ updatedAt: -1 })
    .select("sessionId title updatedAt");
};

const getChatSessionMessages = async (userId, sessionId) => {
  const session = await ChatHistory.findOne({ user: userId, sessionId });
  return session ? session.messages : [];
};

module.exports = {
  sendChatMessage,
  getChatSessions,
  getChatSessionMessages,
};
