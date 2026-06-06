const express = require("express");
const router = express.Router();
const adminQuestionController = require("../controllers/adminQuestion.controller");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/auth.middleware");

// All routes in this file require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// MBTI Question Routes
router.get("/mbti", adminQuestionController.getMbtiQuestions);
router.post("/mbti", adminQuestionController.createMbtiQuestion);
router.put("/mbti/:id", adminQuestionController.updateMbtiQuestion);
router.delete("/mbti/:id", adminQuestionController.deleteMbtiQuestion);

// Holland Question Routes
router.get("/holland", adminQuestionController.getHollandQuestions);
router.post("/holland", adminQuestionController.createHollandQuestion);
router.put("/holland/:id", adminQuestionController.updateHollandQuestion);
router.delete("/holland/:id", adminQuestionController.deleteHollandQuestion);

module.exports = router;
