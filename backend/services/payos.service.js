const { PayOS } = require("@payos/node");

// Initialize PayOS
const payOS = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

/**
 * Create a payment link via payOS
 * @param {Object} paymentData { orderCode, amount, description, cancelUrl, returnUrl }
 */
exports.createPaymentLink = async (paymentData) => {
  try {
    console.log(
      "[PayOS Service] Creating payment link with data:",
      JSON.stringify(paymentData, null, 2),
    );
    const paymentLink = await payOS.paymentRequests.create(paymentData);

    // PayOS might return an error object with a 'code' property instead of throwing an exception
    if (paymentLink && paymentLink.code && paymentLink.code !== 0) {
      const error = new Error(paymentLink.description || "PayOS API Error");
      error.code = paymentLink.code;
      error.details = paymentLink;
      throw error;
    }

    console.log("[PayOS Service] Payment link created successfully");
    return paymentLink;
  } catch (error) {
    console.error(
      "[PayOS Service] Error creating payment link. Full error:",
      error,
    );
    if (error.response) {
      console.error(
        "[PayOS Service] Error Response Data:",
        error.response.data,
      );
      console.error(
        "[PayOS Service] Error Response Status:",
        error.response.status,
      );
    }
    throw error;
  }
};

/**
 * Verify a webhook payload from payOS
 * @param {Object} payload The request body from payOS
 * @param {string} signature The signature from the request header
 */
exports.verifyWebhook = async (payload, signature) => {
  try {
    console.log(
      "[PayOS Service] Verifying webhook with payload:",
      JSON.stringify(payload),
    );
    console.log(
      "[PayOS Service] Using Checksum Key:",
      process.env.PAYOS_CHECKSUM_KEY ? "Present" : "MISSING",
    );
    const isValid = await payOS.webhooks.verify(payload, signature);
    console.log("[PayOS Service] Webhook verification result:", isValid);
    return isValid;
  } catch (error) {
    console.error("[PayOS Service] Error verifying webhook:", error);
    return false;
  }
};
