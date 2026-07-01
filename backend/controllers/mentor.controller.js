const mentorService = require("../services/mentor.service");
const quotaService = require("../services/quota.service");

exports.sendMessage = async (req, res) => {
  try {
    const { sessionId, message, imageBase64 } = req.body;
    if (!sessionId || (!message && !imageBase64)) {
      return res.status(400).json({
        status: "error",
        message: "sessionId and message (or image) are required",
      });
    }

    const hasQuota = await quotaService.checkQuota(
      req.user.id,
      "mentorQuestions",
    );
    if (!hasQuota) {
      return res.status(403).json({
        status: "error",
        message:
          "Bạn đã hết lượt đặt câu hỏi cho hôm nay. Vui lòng nâng cấp gói để tiếp tục trò chuyện!",
        code: "QUOTA_EXCEEDED",
      });
    }

    const data = await mentorService.sendChatMessage(
      req.user.id,
      sessionId,
      message || "",
      imageBase64 || null,
    );
    await quotaService.incrementQuota(req.user.id, "mentorQuestions");

    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const data = await mentorService.getChatSessions(req.user.id);
    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getSessionMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res
        .status(400)
        .json({ status: "error", message: "sessionId is required" });
    }

    const data = await mentorService.getChatSessionMessages(
      req.user.id,
      sessionId,
    );
    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
