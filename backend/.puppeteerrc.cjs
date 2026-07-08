const { join } = require("path");

// Ép Puppeteer luôn cài & tìm trình duyệt trong cùng một thư mục cố định
// (backend/.cache/puppeteer), bất kể lệnh cài đặt (npm install/postinstall)
// hay tiến trình server chạy từ working directory nào. Trước đây server.js
// tự set process.env.PUPPETEER_CACHE_DIR ở runtime — nhưng lúc build/cài đặt
// (npx puppeteer browsers install ...) biến này chưa tồn tại nên trình duyệt
// bị tải vào một thư mục khác, dẫn đến lúc chạy thật không tìm thấy Chrome
// (PDF export lỗi 500 trên production).
module.exports = {
  cacheDirectory: join(__dirname, ".cache", "puppeteer"),
};
