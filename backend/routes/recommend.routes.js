const express = require("express");
const router = express.Router();

const { recommendScore } = require("../controllers/recommend.controller");

// POST /api/recommend/score
router.post("/score", recommendScore);

module.exports = router;
