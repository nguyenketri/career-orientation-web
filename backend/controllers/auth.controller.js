const {
  registerUser,
  loginUser,
  googleLogin,
} = require("../services/auth.service");

const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);

    // 201 = created
    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: user,
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);

    // 200 = OK
    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({
        status: "error",
        message: "ID Token is required",
      });
    }

    const result = await googleLogin(idToken);

    res.status(200).json({
      status: "success",
      message: "Google login successful",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

module.exports = { register, login, googleAuth };
