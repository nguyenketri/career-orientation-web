const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/auth.middleware");
const adminController = require("../controllers/admin.controller");

// Tất cả các route admin đều yêu cầu đăng nhập và quyền admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Thống kê
router.get("/stats", adminController.getAdminStats);

// Quản lý người dùng
router.get("/users", adminController.getAllUsers);
router.put("/users/role", adminController.updateUserRole);
router.delete("/users/:userId", adminController.deleteUser);

// Quản lý thanh toán
router.get("/payments", adminController.getAllPayments);
router.put("/payments/status", adminController.updatePaymentStatus);

module.exports = router;
