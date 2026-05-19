const mentorService = require("../services/mentor.service");

exports.sendMessage = async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    if (!sessionId || !message) {
      return res.status(400).json({ status: "error", message: "sessionId and message are required" });
    }

    const data = await mentorService.sendChatMessage(req.user.id, sessionId, message);

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
      return res.status(400).json({ status: "error", message: "sessionId is required" });
    }

    const data = await mentorService.getChatSessionMessages(req.user.id, sessionId);
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
