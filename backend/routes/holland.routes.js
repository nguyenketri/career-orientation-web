const express = require("express");
const router = express.Router();

const {
  getQuestions,
  submitTest,
} = require("../controllers/holland.controller");

router.get("/questions", getQuestions);
router.post("/submit", submitTest);

module.exports = router;
