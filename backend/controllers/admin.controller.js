const User = require("../models/user.model");
const Payment = require("../models/payment.model");
const HollandResult = require("../models/hollandResult.model");
const MbtiResult = require("../models/mbtiResult.model");

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

    const totalHollandTests = await HollandResult.countDocuments();
    const totalMbtiTests = await MbtiResult.countDocuments();

    // Note: recentUsers is now handled by paginated getAllUsers,
    // but we keep a small set here for the initial dashboard load if needed.
    const recentUsers = await User.find()
      .select("name email subscriptionPlan createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    const totalSubscriptions = await User.countDocuments({
      subscriptionPlan: { $ne: "FREE" },
    });

    res.status(200).json({
      status: "success",
      data: {
        totalUsers,
        totalPayments,
        successfulPayments,
        totalRevenue: revenue.length > 0 ? revenue[0].total : 0,
        totalTests: totalHollandTests + totalMbtiTests,
        totalSubscriptions,
        recentUsers,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching admin stats: " + error.message,
    });
  }
};

// Lấy danh sách tất cả người dùng (có phân trang)
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: "success",
      data: {
        users,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
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

// Cập nhật trạng thái hoạt động của người dùng (Active <-> Inactive)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    user.status = newStatus;
    await user.save();

    res.status(200).json({
      status: "success",
      message: `User status updated to ${newStatus}`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error toggling user status: " + error.message,
    });
  }
};

// Lấy tất cả lịch sử thanh toán (có phân trang)
exports.getAllPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Payment.countDocuments();
    const payments = await Payment.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: "success",
      data: {
        payments,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[Admin] Error fetching payments:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching payments: " + error.message,
    });
  }
};

// Lấy báo cáo chi tiết cho Admin
exports.getAdminReport = async (req, res) => {
  try {
    // 1. Tổng quan
    const totalUsers = await User.countDocuments();
    const totalTests =
      (await HollandResult.countDocuments()) +
      (await MbtiResult.countDocuments());
    const revenueData = await Payment.aggregate([
      { $match: { status: "SUCCESS" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // 2. Phân bổ gói cước
    const planDistribution = await User.aggregate([
      { $group: { _id: "$subscriptionPlan", count: { $sum: 1 } } },
    ]);

    // 3. Xu hướng doanh thu (6 tháng gần nhất)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueTrend = await Payment.aggregate([
      { $match: { status: "SUCCESS", createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 4. Phân bổ loại test
    const testDistribution = {
      holland: await HollandResult.countDocuments(),
      mbti: await MbtiResult.countDocuments(),
    };

    res.status(200).json({
      status: "success",
      data: {
        summary: {
          totalUsers,
          totalRevenue,
          totalTests,
        },
        planDistribution,
        revenueTrend,
        testDistribution,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error generating report: " + error.message,
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
