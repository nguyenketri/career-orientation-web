const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");

const {
  recommendSubjects,
  getAnalysisHistory,
  recommendScore,
  recommendHolland,
  getRecommendQuota,
} = require("../controllers/recommend.controller");

// NEW:
router.post("/subjects", authMiddleware, recommendSubjects);
router.get("/history", authMiddleware, getAnalysisHistory);

// POST /api/recommend/score (old)
router.post("/score", authMiddleware, recommendScore);
// POST /api/recommend/holland (old)
router.post("/holland", authMiddleware, recommendHolland);
router.get("/quota", authMiddleware, getRecommendQuota);

module.exports = router;
