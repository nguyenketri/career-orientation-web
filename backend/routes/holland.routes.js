const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  optionalAuthMiddleware,
} = require("../middlewares/auth.middleware");
const { requirePlan } = require("../middlewares/subscription.middleware");

const {
  getQuestions,
  submitTest,
  generateAiAnalysis,
} = require("../controllers/holland.controller");

router.get("/questions", optionalAuthMiddleware, getQuestions);
router.post("/submit", optionalAuthMiddleware, submitTest);
router.post(
  "/ai-analysis/:resultId",
  authMiddleware,
  requirePlan(["PREMIUM"]),
  generateAiAnalysis,
);

module.exports = router;
