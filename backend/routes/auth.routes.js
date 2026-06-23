const express = require("express");
const router = express.Router();
const {
  register,
  login,
  googleAuth,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");

// ROUTE REGISTER
router.post("/register", register);
// ROUTE LOGIN
router.post("/login", login);
// ROUTE GOOGLE LOGIN
router.post("/google", googleAuth);
// ROUTE FORGOT PASSWORD
router.post("/forgot-password", forgotPassword);
// ROUTE RESET PASSWORD
router.post("/reset-password", resetPassword);

module.exports = router;
