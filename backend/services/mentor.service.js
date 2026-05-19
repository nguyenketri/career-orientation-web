const { GoogleGenerativeAI } = require("@google/generative-ai");
const ChatHistory = require("../models/chatHistory.model");
const User = require("../models/user.model");

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

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
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const session = await getChatSession(userId, sessionId);

  // Chuẩn bị lịch sử trò chuyện cho Gemini
  const formattedHistory = session.messages.map(msg => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  // Tạo ngữ cảnh ban đầu (System Prompt) bằng cách thêm vào mảng history nếu mảng rỗng
  if (formattedHistory.length === 0) {
    formattedHistory.push({
      role: "user",
      parts: [{ text: "Hãy đóng vai trò là một chuyên gia tư vấn hướng nghiệp tại nền tảng caZup. Bạn thân thiện, hiểu biết, và chuyên trả lời các câu hỏi về định hướng nghề nghiệp, chọn trường, chọn ngành, học phí, điểm chuẩn. Phản hồi của bạn cần ngắn gọn, đi thẳng vào vấn đề. Nếu có thể hãy tạo điểm nhấn bằng emoji." }],
    });
    formattedHistory.push({
      role: "model",
      parts: [{ text: "Chào bạn! Mình là caZup Mentor - Chuyên gia Hướng Nghiệp của bạn. Mình sẵn sàng giúp bạn giải đáp mọi thắc mắc về định hướng nghề nghiệp, ngành học và lựa chọn trường. Bạn có câu hỏi gì cần hỗ trợ hôm nay không? 😊" }],
    });
  }

  const chat = model.startChat({
    history: formattedHistory,
  });

  // Lưu tin nhắn của user
  session.messages.push({ role: "user", content: message });
  
  // Lấy phản hồi từ AI
  const result = await chat.sendMessage(message);
  const responseText = result.response.text();

  // Lưu tin nhắn của hệ thống
  session.messages.push({ role: "model", content: responseText });

  await session.save();

  return {
    response: responseText,
    history: session.messages,
  };
};

const getChatSessions = async (userId) => {
  return await ChatHistory.find({ user: userId }).sort({ updatedAt: -1 }).select("sessionId title updatedAt");
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
