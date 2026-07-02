const notificationService = require("../services/notification.service");

// GET /api/notifications?page=&limit=&unread=true
exports.getMyNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, unread } = req.query;
    const data = await notificationService.getNotifications(req.user.id, {
      page: Number(page),
      limit: Number(limit),
      unreadOnly: unread === "true",
    });
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    return res.status(200).json({ status: "success", data: { count } });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(
      req.user.id,
      req.params.id,
    );
    if (!notification) {
      return res
        .status(404)
        .json({ status: "error", message: "Không tìm thấy thông báo." });
    }
    return res.status(200).json({ status: "success", data: notification });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// PATCH /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    return res.status(200).json({ status: "success" });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};
