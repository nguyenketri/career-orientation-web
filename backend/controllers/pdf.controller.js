const { generateTestResultPdf } = require("../services/pdf.service");
const User = require("../models/user.model");

const exportPdf = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || user.subscriptionPlan !== "PREMIUM") {
      return res
        .status(403)
        .json({ message: "Premium plan required for PDF export" });
    }

    await generateTestResultPdf(userId, res);
  } catch (error) {
    console.error("PDF Export Error:", error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
};

module.exports = { exportPdf };
