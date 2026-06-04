const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { requirePlan } = require("../middlewares/subscription.middleware");

const {
  getQuestions,
  submitTest,
  generateAiAnalysis,
} = require("../controllers/holland.controller");

router.get("/questions", getQuestions);
router.post("/submit", submitTest);
router.post(
  "/ai-analysis/:resultId",
  authMiddleware,
  requirePlan(["PREMIUM"]),
  generateAiAnalysis,
);

module.exports = router;
