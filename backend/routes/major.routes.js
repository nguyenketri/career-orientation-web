const express = require("express");
const router = express.Router();

const {
  createMajor,
  getAllMajors,
  getMajorById,
} = require("../controllers/major.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// POST /api/majors
router.post("/", authMiddleware, createMajor);
// GET /api/majors
router.get("/", getAllMajors);
// GET /api/majors/:id
router.get("/:id", getMajorById);

module.exports = router;
