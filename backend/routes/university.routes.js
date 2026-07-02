// routes/university.routes.js
const express = require("express");
const router = express.Router();

const {
  getAllUniversities,
  getUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  getAllUniversityMajors,
  getUniversityMajorDetail,
} = require("../controllers/university.controller");

const {
  authMiddleware,
  optionalAuthMiddleware,
} = require("../middlewares/auth.middleware");

// PUBLIC: list all universities
router.get("/", getAllUniversities);
// PUBLIC: list all university-major combinations
router.get("/majors/all", getAllUniversityMajors);
// PUBLIC: detail of one major at one university (optional auth => tính độ tương thích)
router.get("/majors/:id", optionalAuthMiddleware, getUniversityMajorDetail);
router.get("/:id", getUniversityById);

// PROTECTED (requires auth middleware) – for admin CRUD
router.post("/", authMiddleware, createUniversity);
router.put("/:id", authMiddleware, updateUniversity);
router.delete("/:id", authMiddleware, deleteUniversity);

module.exports = router;
