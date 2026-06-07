const express = require("express");
const router = express.Router();
const { exportPdf } = require("../controllers/pdf.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.get("/export", authMiddleware, exportPdf);

module.exports = router;
