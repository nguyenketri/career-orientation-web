const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

// API cần login mới dùng được
router.post("/", authMiddleware, (req, res) => {
  res.json({
    status: "Success",
    message: "Auth middleware working",
    user: req.user,
  });
});

module.exports = router;
