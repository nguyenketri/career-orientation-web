const { GoogleGenerativeAI } = require("@google/generative-ai");
const ChatHistory = require("../models/chatHistory.model");
const User = require("../models/user.model");

// Hãy chắc chắn bạn đã tạo file .env ở thư mục gốc chứa GEMINI_API_KEY hợp lệ
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("⚠️ CẢNH BÁO: Không tìm thấy GEMINI_API_KEY trong file .env!");
}

const genAI = new GoogleGenerativeAI(
  apiKey || "AIzaSyBo1Rd5g1pCL0FG0jOibrDX7fTQYnB_J90",
);

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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const session = await getChatSession(userId, sessionId);

    // Chuẩn bị lịch sử trò chuyện đúng chuẩn của Gemini
    const formattedHistory = session.messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Tạo ngữ cảnh ban đầu (System Prompt) nếu phòng chat mới tinh
    if (formattedHistory.length === 0) {
      formattedHistory.push({
        role: "user",
        parts: [
          {
            text: "Hãy đóng vai trò là một chuyên gia tư vấn hướng nghiệp tại nền tảng caZup. Bạn thân thiện, hiểu biết, và chuyên trả lời các câu hỏi về định hướng nghề nghiệp, chọn trường, chọn ngành, học phí, điểm chuẩn. Phản hồi của bạn cần ngắn gọn, đi thẳng vào vấn đề. Nếu có thể hãy tạo điểm nhấn bằng emoji.",
          },
        ],
      });
      formattedHistory.push({
        role: "model",
        parts: [
          {
            text: "Chào bạn! Mình là caZup Mentor - Chuyên gia Hướng Nghiệp của bạn. Mình sẵn sàng giúp bạn giải đáp mọi thắc mắc về định hướng nghề nghiệp, ngành học và lựa chọn trường. Bạn có câu hỏi gì cần hỗ trợ hôm nay không? 😊",
          },
        ],
      });
    }

    const chat = model.startChat({
      history: formattedHistory,
    });

    // 1. Lưu tin nhắn thực tế của user vào database trước khi gọi API
    session.messages.push({ role: "user", content: message });

    // 2. Gọi API Google Gemini
    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    // 3. Lưu phản hồi của AI vào database
    session.messages.push({ role: "model", content: responseText });

    // 4. Đồng bộ xuống Database
    await session.save();

    return {
      response: responseText,
      history: session.messages,
    };
  } catch (error) {
    // In trực tiếp lỗi chi tiết ra màn hình đen Server để bắt bệnh chính xác
    console.error("❌ LỖI TẠI HÀM SEND_CHAT_MESSAGE:", error.message);
    throw error; // Đẩy lỗi ra ngoài để Controller xử lý trả lỗi văn minh về Frontend
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
