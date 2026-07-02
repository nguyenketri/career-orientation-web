const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const Payment = require("../models/payment.model");
const HollandResult = require("../models/hollandResult.model");
const MbtiResult = require("../models/mbtiResult.model");
const { createNotification } = require("../services/notification.service");

// Phải khớp với PLAN_DURATIONS ở payment.controller.js
const PLAN_DURATIONS = {
  PAID: 30 * 24 * 60 * 60 * 1000, // 30 days
  PREMIUM: 90 * 24 * 60 * 60 * 1000, // 90 days
};
const PLAN_LABEL = { PAID: "TIÊU CHUẨN", PREMIUM: "CAO CẤP" };

// Lấy thống kê tổng quan cho Admin
exports.getAdminStats = async (req, res) => {
  try {
    const now = new Date();
    const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalUsers = await User.countDocuments({ isDeleted: { $ne: true } });
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

    const totalSubscriptions = await User.countDocuments({
      isDeleted: { $ne: true },
      subscriptionPlan: { $ne: "FREE" },
    });

    // Người dùng mới trong tháng này (dùng cho thẻ "Người dùng mới")
    const newUsersThisMonth = await User.countDocuments({
      isDeleted: { $ne: true },
      createdAt: { $gte: startThisMonth },
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
        newUsersThisMonth,
        hollandTotal: totalHollandTests,
        mbtiTotal: totalMbtiTests,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching admin stats: " + error.message,
    });
  }
};

// Escape ký tự đặc biệt regex để tránh lỗi/khai thác khi search bằng chuỗi user nhập
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// % tăng trưởng so với kỳ trước — null khi không có dữ liệu kỳ trước để so sánh
const growthPct = (current, previous) => {
  if (!previous) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

// Thống kê tổng quan cho trang Quản lý Người dùng (4 thẻ đầu trang)
exports.getUserManagementStats = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const baseFilter = { isDeleted: { $ne: true } };

    const [
      total,
      activeCount,
      newThisWeek,
      newLastWeek,
      premiumCount,
    ] = await Promise.all([
      User.countDocuments(baseFilter),
      User.countDocuments({ ...baseFilter, status: "ACTIVE" }),
      User.countDocuments({ ...baseFilter, createdAt: { $gte: sevenDaysAgo } }),
      User.countDocuments({
        ...baseFilter,
        createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
      }),
      User.countDocuments({ ...baseFilter, subscriptionPlan: "PREMIUM" }),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        total,
        activeCount,
        activePct: total > 0 ? Math.round((activeCount / total) * 1000) / 10 : 0,
        newThisWeek,
        newLastWeek,
        weekGrowthPct: growthPct(newThisWeek, newLastWeek),
        premiumCount,
        premiumPct: total > 0 ? Math.round((premiumCount / total) * 1000) / 10 : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching user management stats: " + error.message,
    });
  }
};

// Lấy danh sách tất cả người dùng (có phân trang, tìm kiếm, lọc gói/trạng thái/ngày tham gia)
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search || "").trim();
    const { plan, status, joinedFrom, role } = req.query;

    const filter = { isDeleted: { $ne: true } };
    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }
    if (plan && ["FREE", "PAID", "PREMIUM"].includes(plan)) {
      filter.subscriptionPlan = plan;
    }
    if (status && ["ACTIVE", "INACTIVE"].includes(status)) {
      filter.status = status;
    }
    if (role && ["user", "admin"].includes(role)) {
      filter.role = role;
    }
    if (joinedFrom) {
      const fromDate = new Date(joinedFrom);
      if (!isNaN(fromDate.getTime())) {
        filter.createdAt = { $gte: fromDate };
      }
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
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

    await createNotification({
      userId: user._id,
      type: "ACCOUNT_STATUS",
      title:
        newStatus === "ACTIVE"
          ? "Tài khoản đã được kích hoạt lại"
          : "Tài khoản đã bị vô hiệu hóa",
      message:
        newStatus === "ACTIVE"
          ? "Tài khoản của bạn đã được quản trị viên kích hoạt lại. Chúc bạn tiếp tục trải nghiệm tốt trên caZup!"
          : "Tài khoản của bạn đã bị quản trị viên vô hiệu hóa. Vui lòng liên hệ hỗ trợ nếu đây là nhầm lẫn.",
      link: "/profile",
    });

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

// Tạo tài khoản mới trực tiếp bởi Admin
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, subscriptionPlan } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Vui lòng nhập đầy đủ tên, email và mật khẩu.",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Mật khẩu phải có ít nhất 6 ký tự.",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        status: "error",
        message: "Email đã được sử dụng.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: ["user", "admin"].includes(role) ? role : "user",
      subscriptionPlan: ["FREE", "PAID", "PREMIUM"].includes(subscriptionPlan)
        ? subscriptionPlan
        : "FREE",
    });

    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({
      status: "success",
      message: "Tạo tài khoản thành công",
      data: userData,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error creating user: " + error.message,
    });
  }
};

// Cập nhật thông tin tài khoản (tên, vai trò, gói dịch vụ) bởi Admin
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, role, subscriptionPlan, subscriptionDays } = req.body;

    const user = await User.findOne({ _id: userId, isDeleted: { $ne: true } });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (name) user.name = name;
    if (role && ["user", "admin"].includes(role)) user.role = role;

    const planChanged =
      subscriptionPlan &&
      ["FREE", "PAID", "PREMIUM"].includes(subscriptionPlan) &&
      subscriptionPlan !== user.subscriptionPlan;

    if (planChanged) {
      user.subscriptionPlan = subscriptionPlan;
      if (subscriptionPlan === "FREE") {
        user.subscriptionExpiry = null;
      } else {
        const days = Number(subscriptionDays) > 0 ? Number(subscriptionDays) : 30;
        user.subscriptionExpiry = new Date(
          Date.now() + days * 24 * 60 * 60 * 1000,
        );
      }
    }

    await user.save();

    if (planChanged) {
      await createNotification({
        userId: user._id,
        type: "PAYMENT_SUCCESS",
        title: "Gói dịch vụ đã được cập nhật",
        message:
          subscriptionPlan === "FREE"
            ? "Quản trị viên đã chuyển tài khoản của bạn về gói CƠ BẢN (FREE)."
            : `Quản trị viên đã kích hoạt gói ${PLAN_LABEL[subscriptionPlan] || subscriptionPlan} cho tài khoản của bạn.`,
        link: "/pricing",
      });
    }

    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      status: "success",
      message: "Cập nhật tài khoản thành công",
      data: userData,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating user: " + error.message,
    });
  }
};

// Xóa (mềm) tài khoản — ẩn khỏi danh sách quản lý, có thể khôi phục sau này,
// không xóa vĩnh viễn dữ liệu liên quan (lịch sử test, thanh toán...).
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (String(req.user.id) === String(userId)) {
      return res.status(400).json({
        status: "error",
        message: "Bạn không thể tự xóa tài khoản của chính mình.",
      });
    }

    const user = await User.findOne({ _id: userId, isDeleted: { $ne: true } });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Đã xóa tài khoản",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error deleting user: " + error.message,
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
    console.log("[AdminReport] Generating report for admin...");

    // 1. Tổng quan
    const totalUsers = await User.countDocuments();
    const totalHolland = await HollandResult.countDocuments();
    const totalMbti = await MbtiResult.countDocuments();
    const totalTests = totalHolland + totalMbti;

    const revenueData = await Payment.aggregate([
      { $match: { status: "SUCCESS" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // 2. Phân bổ gói cước
    const planDistribution = await User.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$subscriptionPlan", "FREE"] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 3. Xu hướng doanh thu (6 tháng gần nhất)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueTrend = await Payment.aggregate([
      {
        $match: {
          status: "SUCCESS",
          createdAt: { $gte: sixMonthsAgo },
        },
      },
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
      holland: totalHolland || 0,
      mbti: totalMbti || 0,
    };

    console.log("[AdminReport] Report generated successfully with data:", {
      totalUsers,
      totalRevenue,
      totalTests,
    });

    res.status(200).json({
      status: "success",
      data: {
        summary: {
          totalUsers: totalUsers || 0,
          totalRevenue: totalRevenue || 0,
          totalTests: totalTests || 0,
        },
        planDistribution: planDistribution || [],
        revenueTrend: revenueTrend || [],
        testDistribution: testDistribution,
      },
    });
  } catch (error) {
    console.error("[AdminReport] Error during report generation:", error);
    res.status(500).json({
      status: "error",
      message: "Error generating report: " + error.message,
    });
  }
};

// Lấy doanh thu chi tiết theo từng tháng trong năm hiện tại
exports.getMonthlyRevenue = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const revenueData = await Payment.aggregate([
      {
        $match: {
          status: "SUCCESS",
          createdAt: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Tạo mảng đầy đủ 12 tháng để tránh thiếu tháng không có doanh thu
    const monthlyRevenue = [];
    for (let i = 1; i <= 12; i++) {
      const monthData = revenueData.find((d) => d._id === i);
      monthlyRevenue.push({
        month: `T${i}`,
        amount: monthData ? monthData.amount : 0,
      });
    }

    res.status(200).json({
      status: "success",
      data: monthlyRevenue,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching monthly revenue: " + error.message,
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
      const duration = PLAN_DURATIONS[payment.planType];
      if (duration) {
        const user = await User.findById(payment.user);
        if (user) {
          const now = new Date();
          const baseDate =
            user.subscriptionExpiry && new Date(user.subscriptionExpiry) > now
              ? new Date(user.subscriptionExpiry)
              : now;
          const newExpiry = new Date(baseDate.getTime() + duration);
          user.subscriptionPlan = payment.planType;
          user.subscriptionExpiry = newExpiry;
          await user.save();

          await createNotification({
            userId: user._id,
            type: "PAYMENT_SUCCESS",
            title: "Thanh toán thành công 🎉",
            message: `Gói ${PLAN_LABEL[payment.planType] || payment.planType} của bạn đã được kích hoạt đến hết ngày ${newExpiry.toLocaleDateString("vi-VN")}.`,
            link: "/payment-history",
          });
        }
      }
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
