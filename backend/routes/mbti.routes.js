const express = require("express");
const router = express.Router();
const mbtiController = require("../controllers/mbti.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { requirePlan } = require("../middlewares/subscription.middleware");

// PROTECTED: get questions
router.get("/questions", authMiddleware, mbtiController.getQuestions);

// PROTECTED: submit and get history
router.post("/submit", mbtiController.submitTest);
router.get("/history", authMiddleware, mbtiController.getHistory);
// get by id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const MbtiResult = require("../models/mbtiResult.model");
    const UniversityMajor = require("../models/universityMajor.model");

    const result = await MbtiResult.findById(req.params.id).populate({
      path: "recommendedMajors",
      populate: {
        path: "universities",
        model: "University",
      },
    });
    if (!result) return res.status(404).json({ message: "Not found" });

    res.status(200).json({ status: "success", data: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
