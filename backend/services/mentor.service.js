const Groq = require("groq-sdk");
const ChatHistory = require("../models/chatHistory.model");
const User = require("../models/user.model");
const MbtiResult = require("../models/mbtiResult.model");
const HollandResult = require("../models/hollandResult.model");

// Hãy chắc chắn bạn đã tạo file .env ở thư mục gốc chứa GROQ_API_KEY hợp lệ
const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.error(
    "❌ LỖI NGHIÊM TRỌNG: Không tìm thấy GROQ_API_KEY trong biến môi trường!",
  );
}

const groq = new Groq({ apiKey });

// Lưu ý: Quota (số câu hỏi/ngày) đã được kiểm tra & cộng dồn ở tầng controller
// thông qua quotaService.checkQuota/incrementQuota (nguồn giới hạn duy nhất,
// khớp với QUOTA_LIMITS và trang Pricing). Không kiểm tra lại quota ở đây để
// tránh 2 hệ thống đếm khác nhau gây chặn nhầm.

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

const sendChatMessage = async (userId, sessionId, message, imageBase64 = null) => {
  try {
    const user = await User.findById(userId);
    const plan = user.subscriptionPlan || "FREE";

    // Xây dựng System Instruction dựa trên thông tin người dùng (Cá nhân hóa cho Premium)
    let systemInstruction = `Bạn là caZup AI Mentor - Chuyên gia tư vấn định hướng NGÀNH HỌC và TRƯỜNG ĐẠI HỌC tại Việt Nam.

Nhiệm vụ của bạn:
1. Tư vấn về chọn ngành, chọn trường, học phí, điểm chuẩn, môi trường học tập.
2. KHI NGƯỜI DÙNG GỬI ẢNH: Bạn CÓ KHẢ NĂNG nhìn thấy và phân tích ảnh. Hãy đọc kỹ nội dung ảnh và đưa ra tư vấn cụ thể dựa trên ảnh đó. Các loại ảnh phổ biến:
   - Kết quả trắc nghiệm Holland/MBTI → phân tích loại tính cách, gợi ý ngành phù hợp
   - Bảng điểm THPT/học bạ → phân tích điểm mạnh, gợi ý tổ hợp xét tuyển và trường phù hợp
   - Thông tin trường đại học → so sánh, nhận xét ưu nhược điểm
   - Kết quả gợi ý ngành từ caZup → giải thích và tư vấn thêm
3. Không tư vấn các chủ đề hoàn toàn ngoài giáo dục đại học.
4. Phản hồi thân thiện, chuyên nghiệp, dùng emoji phù hợp.
5. Ngôn ngữ: Tiếng Việt.`;

    if (plan === "PREMIUM") {
      // Lấy kết quả trắc nghiệm MỚI NHẤT từ MbtiResult/HollandResult (nguồn dữ
      // liệu thật) thay vì User.careerPath — trường này không bao giờ được ghi
      // nên trước đây luôn hiển thị "Chưa làm trắc nghiệm" dù user đã test.
      const [mbtiResult, hollandResult] = await Promise.all([
        MbtiResult.findOne({ user: userId }).sort({ createdAt: -1 }),
        HollandResult.findOne({ user: userId }).sort({ createdAt: -1 }),
      ]);

      systemInstruction += `\n\nThông tin người dùng (Dành riêng cho gói Premium):
- Loại hình Holland: ${hollandResult?.hollandType || "Chưa làm trắc nghiệm"}
- Nhóm tính cách MBTI: ${mbtiResult?.mbtiType || "Chưa làm trắc nghiệm"}
Hãy sử dụng thông tin này để đưa ra lời khuyên cá nhân hóa nhất cho họ.`;
    }

    const session = await getChatSession(userId, sessionId);

    // Nội dung tin nhắn user hiện tại (có thể có ảnh)
    let userContent;
    if (imageBase64) {
      userContent = [
        ...(message ? [{ type: "text", text: message }] : [{ type: "text", text: "Hãy phân tích hình ảnh này và tư vấn cho tôi." }]),
        {
          type: "image_url",
          image_url: { url: imageBase64 },
        },
      ];
    } else {
      userContent = message;
    }

    // Lưu tin nhắn user vào database (chỉ lưu text, không lưu base64)
    const savedContent = imageBase64
      ? `[🖼️ Hình ảnh đính kèm]${message ? " " + message : ""}`
      : message;
    session.messages.push({ role: "user", content: savedContent });

    // Chuẩn bị lịch sử trò chuyện đúng chuẩn của Groq (OpenAI format)
    const chatMessages = [
      { role: "system", content: systemInstruction },
      ...session.messages.slice(0, -1).map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })),
      { role: "user", content: userContent },
    ];

    // Gọi API Groq
    let chatCompletion;
    if (imageBase64) {
      // Thử lần lượt các vision model có sẵn trên Groq
      const VISION_MODELS = [
        "meta-llama/llama-4-scout-17b-16e-instruct",
        "meta-llama/llama-4-maverick-17b-128e-instruct",
        "llama-3.2-11b-vision-preview",
        "llama-3.2-90b-vision-preview",
      ];

      let lastVisionError = null;
      for (const vModel of VISION_MODELS) {
        try {
          console.log(`[Mentor] Trying vision model: ${vModel}`);
          chatCompletion = await groq.chat.completions.create({
            messages: chatMessages,
            model: vModel,
          });
          console.log(`[Mentor] Vision model success: ${vModel}`);
          break;
        } catch (visionErr) {
          lastVisionError = visionErr;
          console.warn(`[Mentor] Vision model ${vModel} failed: ${visionErr.message}`);
        }
      }

      if (!chatCompletion) {
        console.error("[Mentor] All vision models failed:", lastVisionError?.message);
        throw new Error(
          "Hệ thống phân tích ảnh hiện không khả dụng. Vui lòng mô tả nội dung ảnh bằng text hoặc thử lại sau.",
        );
      }
    } else {
      chatCompletion = await groq.chat.completions.create({
        messages: chatMessages,
        model: "llama-3.3-70b-versatile",
      });
    }

    const responseText =
      chatCompletion.choices[0]?.message?.content ||
      "Xin lỗi, tôi không thể tạo phản hồi lúc này.";

    // 3. Lưu phản hồi của AI vào database
    session.messages.push({ role: "model", content: responseText });

    // 4. Tự động tạo tiêu đề nếu là tin nhắn đầu tiên
    if (session.messages.length <= 2 && session.title === "New Chat") {
      const titleSource = message || (imageBase64 ? "Phân tích hình ảnh" : "Cuộc hội thoại mới");
      try {
        const titleCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "Bạn là một trợ lý giúp tạo tiêu đề ngắn gọn (tối đa 6 từ) cho cuộc hội thoại dựa trên tin nhắn của người dùng. Trả về trực tiếp tiêu đề, không thêm dấu ngoặc kép hay bất kỳ giải thích nào. Ví dụ: 'Tư vấn ngành CNTT', 'So sánh Đại học FPT và HUST'.",
            },
            { role: "user", content: titleSource },
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
        session.title =
          titleSource.split(" ").slice(0, 5).join(" ").substring(0, 40) + "...";
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

    throw new Error(`Lỗi AI: ${error.message}`);
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
