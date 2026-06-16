const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");

router.get("/me", authMiddleware, userController.getProfile);
router.put("/me", authMiddleware, userController.updateProfile);

router.post("/link-result", authMiddleware, async (req, res) => {
  try {
    const { resultId, type } = req.body;
    const HollandResult = require("../models/hollandResult.model");
    const MbtiResult = require("../models/mbtiResult.model");
    const Model = type === "holland" ? HollandResult : MbtiResult;
    const result = await Model.findById(resultId);
    if (!result) return res.status(404).json({ message: "Result not found" });

    result.user = req.user.id;
    await result.save();
    res
      .status(200)
      .json({ message: "Result linked successfully", data: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
