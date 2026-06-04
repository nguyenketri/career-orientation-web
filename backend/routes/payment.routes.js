const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const paymentController = require("../controllers/payment.controller");

// Public endpoints (invoked by Casso/SePay payment hub)
router.post("/webhook", paymentController.webhookPayment);

// Public mock simulation endpoint for development testing (Disabled for production)
router.post("/mock-webhook", paymentController.mockWebhook);

// Protected endpoints (invoked by frontend web app)
router.post("/create", authMiddleware, paymentController.createPayment);
router.get(
  "/status/:paymentId",
  authMiddleware,
  paymentController.getPaymentStatus,
);
router.get("/history", authMiddleware, paymentController.getPaymentHistory);

module.exports = router;
