const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register Service
const registerUser = async (data) => {
  // DESTRUCTURING DATA get FIELDs
  const { name, email, password } = data;
  // CHECK USER EXIST BY EMAIL
  const exist = await User.findOne({ email });
  if (exist) {
    throw new Error("Email already exists");
  }
  // USE BCRYPT HASH PASSWORD
  const hashedPassword = await bcrypt.hash(password, 10);
  // CREATE NEW USER
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return user;
};

// Login service
const loginUser = async (data) => {
  const { email, password } = data;

  // check user tồn tại
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  // check status
  if (user.status === "INACTIVE") {
    throw new Error("Tài khoản của bạn đã bị vô hiệu hóa");
  }

  // so sánh password
  const isMAtch = await bcrypt.compare(password, user.password);
  if (!isMAtch) {
    throw new Error("Invalid password");
  }
  // Ẩn ko cho hiện password lên response
  user.password = undefined;
  // Tạo JWT token
  const token = jwt.sign(
    { id: user._id }, // payload
    process.env.JWT_SECRET, // secret key
    { expiresIn: "1d" }, // Thời gian sống
  );
  return {
    user,
    token,
  };
};

// Google Login Service
const googleLogin = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find user by googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      // Create new user if not exists
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        role: "user",
      });
    } else if (!user.googleId) {
      // Update googleId if user exists but wasn't linked to Google
      user.googleId = googleId;
      await user.save();
    }

    // Remove password from response
    user.password = undefined;

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return {
      user,
      token,
    };
  } catch (error) {
    throw new Error("Google authentication failed: " + error.message);
  }
};

// Forgot Password Service
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("No user found with this email address");
  }

  // Generate random reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Set token and expiry (1 hour)
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Password Reset Request",
    text: `You requested a password reset. Please click on the following link to reset your password: ${resetUrl}. This link expires in 1 hour.`,
    html: `<p>You requested a password reset. Please click on the following link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a><p>This link expires in 1 hour.</p>`,
  };

  await transporter.sendMail(mailOptions);
  return { message: "Reset password email sent successfully" };
};

// Reset Password Service
const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Password reset token is invalid or has expired");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;

  // Clear reset token and expiry
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
  return { message: "Password has been reset successfully" };
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  forgotPassword,
  resetPassword,
};
