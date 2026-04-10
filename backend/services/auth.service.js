const User = require("../models/user.model");
const bcrypt = require("bcrypt");

exports.registerUser = async (data) => {
  const { name, email, password } = data;

  const exist = await User.findOne({ email });
  if (exist) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return user;
};
