const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  optionalAuthMiddleware,
} = require("../middlewares/auth.middleware");

const {
  recommendSubjects,
  getAnalysisHistory,
  getAnalysisDetail,
  recommendScore,
  recommendHolland,
  getRecommendQuota,
} = require("../controllers/recommend.controller");

// NEW:
router.post("/subjects", optionalAuthMiddleware, recommendSubjects);
router.get("/history", authMiddleware, getAnalysisHistory);
router.get("/history/:id", authMiddleware, getAnalysisDetail);

// POST /api/recommend/score (old)
router.post("/score", authMiddleware, recommendScore);
// POST /api/recommend/holland (old)
router.post("/holland", authMiddleware, recommendHolland);
router.get("/quota", optionalAuthMiddleware, getRecommendQuota);

module.exports = router;
