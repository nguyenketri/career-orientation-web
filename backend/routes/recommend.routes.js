const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");

const {
  recommendSubjects,
  getAnalysisHistory,
  recommendScore,
  recommendHolland,
} = require("../controllers/recommend.controller");

// NEW:
router.post("/subjects", authMiddleware, recommendSubjects);
router.get("/history", authMiddleware, getAnalysisHistory);

// POST /api/recommend/score (old)
router.post("/score", recommendScore);
// POST /api/recommend/holland (old)
router.post("/holland", recommendHolland);

module.exports = router;
