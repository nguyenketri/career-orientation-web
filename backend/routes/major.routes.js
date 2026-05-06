const express = require("express");
const router = express.Router();

const {
  createMajor,
  getAllMajors,
} = require("../controllers/major.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// POST /api/majors
router.post("/", authMiddleware, createMajor);
// GET /api/majors
router.get("/", getAllMajors);

module.exports = router;
