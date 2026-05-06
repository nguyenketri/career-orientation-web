const express = require("express");
const router = express.Router();

const {
  createMajor,
  getAllMajors,
  getMajorById,
  updateMajor,
  deleteMajor,
} = require("../controllers/major.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// POST /api/majors
router.post("/", authMiddleware, createMajor);
// GET /api/majors
router.get("/", getAllMajors);
// GET /api/majors/:id
router.get("/:id", getMajorById);
// PUT /api/majors/:id
router.put("/:id", authMiddleware, updateMajor);
// DELETE /api/majors/:id
router.delete("/:id", authMiddleware, deleteMajor);

module.exports = router;
