const express = require("express");
const router = express.Router();
const mbtiController = require("../controllers/mbti.controller");
const {
  authMiddleware,
  optionalAuthMiddleware,
} = require("../middlewares/auth.middleware");
const { requirePlan } = require("../middlewares/subscription.middleware");

// PROTECTED: get questions
router.get("/questions", optionalAuthMiddleware, mbtiController.getQuestions);

// PROTECTED: submit and get history
router.post("/submit", optionalAuthMiddleware, mbtiController.submitTest);
router.get("/history", authMiddleware, mbtiController.getHistory);
// get by id
router.get("/:id", optionalAuthMiddleware, async (req, res) => {
  try {
    const MbtiResult = require("../models/mbtiResult.model");
    const { limitMajorsByPlan } = require("../utils/planLimits");

    const result = await MbtiResult.findById(req.params.id).populate({
      path: "recommendedMajors",
      populate: {
        path: "universities",
        model: "University",
      },
    });
    if (!result) return res.status(404).json({ message: "Not found" });

    const plan = req.user?.subscriptionPlan || "FREE";
    const data = result.toObject();
    data.recommendedMajors = limitMajorsByPlan(data.recommendedMajors, plan);

    res.status(200).json({ status: "success", data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
