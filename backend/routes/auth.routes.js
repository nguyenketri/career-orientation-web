const express = require("express");
const router = express.Router();
const {
  register,
  login,
  googleAuth,
} = require("../controllers/auth.controller");

// ROUTE REGISTER
router.post("/register", register);
// ROUTE LOGIN
router.post("/login", login);
// ROUTE GOOGLE LOGIN
router.post("/google", googleAuth);

module.exports = router;
