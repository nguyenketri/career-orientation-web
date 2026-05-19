const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const mentorController = require("../controllers/mentor.controller");

// All routes are protected
router.use(authMiddleware);

router.post("/send", mentorController.sendMessage);
router.get("/sessions", mentorController.getSessions);
router.get("/sessions/:sessionId", mentorController.getSessionMessages);

module.exports = router;
