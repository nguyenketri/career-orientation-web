const User = require("../models/user.model");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    return res.status(200).json({ status: "success", data: user });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, dob, phone, bio } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    if (name) user.name = name;
    if (dob) user.dob = dob;
    if (phone !== undefined) user.phone = phone; // allow clearing phone
    if (bio !== undefined) user.bio = bio;       // allow clearing bio

    await user.save();
    
    // Xóa password khỏi kết quả trả về
    const updatedUser = user.toObject();
    delete updatedUser.password;

    return res.status(200).json({ status: "success", data: updatedUser, message: "Profile updated successfully" });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
