const express = require("express");

const {
  saveHollandResult,
  getMyHollandResults,
} = require("../controllers/hollandResult.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// save holland result
router.post("/", authMiddleware, saveHollandResult);
// get history
router.get("/me", authMiddleware, getMyHollandResults);
module.exports = router;
