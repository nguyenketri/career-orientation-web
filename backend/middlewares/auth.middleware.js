const jwt = require("jsonwebtoken");

// middleware: kiểm tra user đã login chưa
const User = require("../models/user.model");

const authMiddleware = async (req, res, next) => {
  console.log(`[Auth Middleware] Request to: ${req.originalUrl}`);
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized - No token provided",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Bảo mật nâng cao: Kiểm tra xem user còn tồn tại trong DB không
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized - User no longer exists",
      });
    }

    // Lưu thông tin user vào request để các middleware/controller sau sử dụng
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
    };

    next();
  } catch (error) {
    const message =
      error.name === "TokenExpiredError"
        ? "Session expired. Please login again."
        : "Unauthorized - Invalid token";

    return res.status(401).json({
      status: "error",
      message: message,
    });
  }
};

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      req.user = null;
      return next();
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
    };
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

const adminMiddleware = (req, res, next) => {
  console.log("AdminMiddleware - User:", req.user);
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    console.log(
      "AdminMiddleware - Access Denied for role:",
      req.user ? req.user.role : "no user",
    );
    return res.status(403).json({
      status: "error",
      message: "Forbidden - Admin access required",
    });
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  adminMiddleware,
};
