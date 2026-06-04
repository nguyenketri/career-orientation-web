const User = require("../models/user.model");
const Payment = require("../models/payment.model");

// Lấy thống kê tổng quan cho Admin
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPayments = await Payment.countDocuments();
    const successfulPayments = await Payment.countDocuments({
      status: "SUCCESS",
    });

    const revenue = await Payment.aggregate([
      { $match: { status: "SUCCESS" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        totalUsers,
        totalPayments,
        successfulPayments,
        totalRevenue: revenue.length > 0 ? revenue[0].total : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching admin stats: " + error.message,
    });
  }
};

// Lấy danh sách tất cả người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching users: " + error.message,
    });
  }
};

// Cập nhật vai trò người dùng (User <-> Admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid role. Must be 'user' or 'admin'",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: `User role updated to ${role}`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating user role: " + error.message,
    });
  }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error deleting user: " + error.message,
    });
  }
};

// Lấy tất cả lịch sử thanh toán
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });

    console.log("[Admin] Payments found (no populate):", payments.length);
    if (payments.length > 0) {
      console.log("[Admin] First payment user field:", payments[0].user);
    }

    res.status(200).json({
      status: "success",
      data: payments,
    });
  } catch (error) {
    console.error("[Admin] Error fetching payments:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching payments: " + error.message,
    });
  }
};

// Cập nhật trạng thái thanh toán thủ công
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId, status } = req.body;
    if (!["PENDING", "SUCCESS", "FAILED"].includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid status",
      });
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { status },
      { new: true },
    );

    if (!payment) {
      return res.status(404).json({
        status: "error",
        message: "Payment not found",
      });
    }

    // Nếu cập nhật thành công, cập nhật gói cước cho user
    if (status === "SUCCESS") {
      await User.findByIdAndUpdate(payment.user, {
        subscriptionPlan: payment.planType,
        subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });
    }

    res.status(200).json({
      status: "success",
      message: "Payment status updated",
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating payment status: " + error.message,
    });
  }
};
