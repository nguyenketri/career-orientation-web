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
router.get("/report", adminController.getAdminReport);
router.get("/monthly-revenue", adminController.getMonthlyRevenue);

// Quản lý người dùng
router.get("/users", adminController.getAllUsers);
router.post("/users", adminController.createUser);
router.put("/users/role", adminController.updateUserRole);
router.put("/users/:userId", adminController.updateUser);
router.patch("/users/:userId/status", adminController.toggleUserStatus);
router.delete("/users/:userId", adminController.deleteUser);

// Quản lý thanh toán
router.get("/payments", adminController.getAllPayments);
router.put("/payments/status", adminController.updatePaymentStatus);

module.exports = router;
