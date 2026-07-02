const Notification = require("../models/notification.model");

// Tạo thông báo — không để lỗi ở đây làm hỏng luồng nghiệp vụ chính
// (thanh toán, đăng ký, v.v.), chỉ log lại và trả về null.
const createNotification = async ({
  userId,
  type,
  title,
  message,
  link = null,
}) => {
  try {
    return await Notification.create({
      user: userId,
      type,
      title,
      message,
      link,
    });
  } catch (err) {
    console.error("[Notification] Failed to create:", err.message);
    return null;
  }
};

const getNotifications = async (
  userId,
  { page = 1, limit = 10, unreadOnly = false } = {},
) => {
  const filter = { user: userId };
  if (unreadOnly) filter.isRead = false;
  const skip = (page - 1) * limit;

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  return {
    items,
    total,
    page: Number(page),
    totalPages: Math.max(1, Math.ceil(total / limit)),
    unreadCount,
  };
};

const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ user: userId, isRead: false });
};

const markAsRead = async (userId, notificationId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true },
  );
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true },
  );
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
