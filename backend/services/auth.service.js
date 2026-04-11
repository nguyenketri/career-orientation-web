const User = require("../models/user.model");
const bcrypt = require("bcrypt");

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

module.exports = { registerUser };
