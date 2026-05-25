const express = require("express");
const router = express.Router();
const mbtiController = require("../controllers/mbti.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { requirePlan } = require("../middlewares/subscription.middleware");

// PUBLIC: get questions
router.get("/questions", mbtiController.getQuestions);

// PROTECTED: submit and get history
router.post("/submit", authMiddleware, mbtiController.submitTest);
router.get("/history", authMiddleware, mbtiController.getHistory);

module.exports = router;
