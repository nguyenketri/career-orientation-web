const jwt = require("jsonwebtoken");

// middleware: kiểm tra user đã login chưa
const authMiddleware = (req, res, next) => {
  try {
    // lấy token từ header
    const authHeader = req.headers.authorization;
    // kiểm tra có token không
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized - No token",
      });
    }
    // lấy token ( bỏ chữ Bearer)
    const token = authHeader.split(" ")[1];
    // verify token
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    // lưu thông tin user vào request
    req.user = decode;
    // cho request đi tiếp
    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized - Invalid token",
    });
  }
};

module.exports = authMiddleware;
