import axiosClient from "../api/axios";

// Lấy danh sách thông báo (phân trang, có thể lọc chỉ lấy chưa đọc)
export const getNotifications = async (page = 1, limit = 10, unreadOnly = false) => {
  const response = await axiosClient.get("/notifications", {
    params: { page, limit, ...(unreadOnly ? { unread: "true" } : {}) },
  });
  return response.data;
};

// Lấy số lượng thông báo chưa đọc (dùng cho badge trên icon chuông)
export const getUnreadCount = async () => {
  const response = await axiosClient.get("/notifications/unread-count");
  return response.data;
};

// Đánh dấu 1 thông báo đã đọc
export const markNotificationAsRead = async (id) => {
  const response = await axiosClient.patch(`/notifications/${id}/read`);
  return response.data;
};

// Đánh dấu tất cả thông báo đã đọc
export const markAllNotificationsAsRead = async () => {
  const response = await axiosClient.patch("/notifications/read-all");
  return response.data;
};
