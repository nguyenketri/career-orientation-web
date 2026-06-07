const express = require("express");

const {
  saveHollandResult,
  getMyHollandResults,
} = require("../controllers/hollandResult.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

// save holland result
router.post("/save", authMiddleware, saveHollandResult);
// get history
router.get("/me", authMiddleware, getMyHollandResults);
// get by id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const HollandResult = require("../models/hollandResult.model");
    const UniversityMajor = require("../models/universityMajor.model");

    const result = await HollandResult.findById(req.params.id).populate({
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
