const express = require("express");
const router = express.Router();
const comparisonController = require("../controllers/comparison.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.post("/analyze", authMiddleware, comparisonController.analyzeComparison);
router.get("/public", comparisonController.getPublicComparison);

module.exports = router;
