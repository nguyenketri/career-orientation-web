const User = require("../models/user.model");

// Số ngày trong 1 chu kỳ gói, dùng để vẽ progress bar thời gian còn lại
const PLAN_CYCLE_DAYS = { PAID: 30, PREMIUM: 90 };

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    const userData = user.toObject();
    userData.subscriptionDaysRemaining = null;
    userData.subscriptionCycleDays = null;
    if (userData.subscriptionPlan !== "FREE" && userData.subscriptionExpiry) {
      const msLeft = new Date(userData.subscriptionExpiry) - new Date();
      userData.subscriptionDaysRemaining = Math.max(
        0,
        Math.ceil(msLeft / (24 * 60 * 60 * 1000)),
      );
      userData.subscriptionCycleDays =
        PLAN_CYCLE_DAYS[userData.subscriptionPlan] || null;
    }

    return res.status(200).json({ status: "success", data: userData });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// Giới hạn ảnh base64 ~2MB (đã nén JPEG phía client) để tránh phình DB document
const MAX_AVATAR_LENGTH = 2 * 1024 * 1024;

exports.updateProfile = async (req, res) => {
  try {
    const { name, dob, phone, bio, avatar } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    if (name) user.name = name;
    if (dob) user.dob = dob;
    if (phone !== undefined) user.phone = phone; // allow clearing phone
    if (bio !== undefined) user.bio = bio; // allow clearing bio
    if (avatar) {
      if (!avatar.startsWith("data:image/") || avatar.length > MAX_AVATAR_LENGTH) {
        return res
          .status(400)
          .json({ status: "error", message: "Ảnh đại diện không hợp lệ hoặc quá lớn." });
      }
      user.avatar = avatar;
    }

    await user.save();

    // Xóa password khỏi kết quả trả về
    const updatedUser = user.toObject();
    delete updatedUser.password;

    return res.status(200).json({
      status: "success",
      data: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
