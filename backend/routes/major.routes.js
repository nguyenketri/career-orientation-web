const express = require("express");
const router = express.Router();

const { createMajor } = require("../controllers/major.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// POST /api/majors
router.post("/", authMiddleware, createMajor);

module.exports = router;
