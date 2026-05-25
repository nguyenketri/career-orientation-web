const express = require("express");

const {
  saveHollandResult,
  getMyHollandResults,
} = require("../controllers/hollandResult.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// save holland result
router.post("/save", authMiddleware, saveHollandResult);
// get history
router.get("/history", authMiddleware, getMyHollandResults);
module.exports = router;
