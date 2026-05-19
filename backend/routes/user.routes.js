const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");

// All routes are protected
router.use(authMiddleware);

router.get("/me", userController.getProfile);
router.put("/me", userController.updateProfile);

module.exports = router;
