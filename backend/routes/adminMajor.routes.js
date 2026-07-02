const express = require("express");
const router = express.Router();
const adminMajorController = require("../controllers/adminMajor.controller");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/auth.middleware");

// All routes in this file require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Thống kê tổng quan
router.get("/stats", adminMajorController.getManagementStats);

// University Routes
router.get("/universities", adminMajorController.getUniversities);
router.post("/universities", adminMajorController.createUniversity);
router.put("/universities/:id", adminMajorController.updateUniversity);
router.delete("/universities/:id", adminMajorController.deleteUniversity);

// Major Routes
router.get("/majors", adminMajorController.getMajors);
router.post("/majors", adminMajorController.createMajor);
router.put("/majors/:id", adminMajorController.updateMajor);
router.delete("/majors/:id", adminMajorController.deleteMajor);

// University-Major Mapping Routes
router.get("/university-majors", adminMajorController.getUniversityMajors);
router.post("/university-majors", adminMajorController.createUniversityMajor);
router.put(
  "/university-majors/:id",
  adminMajorController.updateUniversityMajor,
);
router.delete(
  "/university-majors/:id",
  adminMajorController.deleteUniversityMajor,
);

module.exports = router;
