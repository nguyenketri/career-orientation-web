const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
module.exports = { registerUser, loginUser };
