const express = require("express");
const router = express.Router();

const {
  recommendScore,
  recommendHolland,
} = require("../controllers/recommend.controller");

// POST /api/recommend/score
router.post("/score", recommendScore);
// POST /api/recommend/holland
router.post("/holland", recommendHolland);
module.exports = router;
