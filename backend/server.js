require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
process.env.PUPPETEER_CACHE_DIR = "./.cache/puppeteer";
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const majorRoutes = require("./routes/major.routes");
const recommendRoutes = require("./routes/recommend.routes");
const hollandRoutes = require("./routes/holland.routes");
const hollandResultRoutes = require("./routes/hollandResult.route");
const mbtiRoutes = require("./routes/mbti.routes");
const mentorRoutes = require("./routes/mentor.routes");
const comparisonRoutes = require("./routes/comparison.routes");
const pdfRoutes = require("./routes/pdf.routes");
const universityRoutes = require("./routes/university.routes");
const userRoutes = require("./routes/user.routes");
const notificationRoutes = require("./routes/notification.routes");
const paymentRoutes = require("./routes/payment.routes");
const adminRoutes = require("./routes/admin.routes");
const adminMajorRoutes = require("./routes/adminMajor.routes");
const adminQuestionRoutes = require("./routes/adminQuestion.routes");
const app = express();

app.use(cors());
app.use(cookieParser());
// middleware : biến JSON -> OBJECT JS (tăng giới hạn để nhận base64 ảnh)
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ROUTER AUTHEN
app.use("/api/auth", authRoutes);
// ROUTER MAJOR
app.use("/api/majors", majorRoutes);
// ROUTER RECOMEND
app.use("/api/recommend", recommendRoutes);
// ROUTER HOLLAND TEST
app.use("/api/holland", hollandRoutes);
// ROUTER HOLLAND RESULTS
app.use("/api/holland-results", hollandResultRoutes);
// ROUTER MBTI TEST
app.use("/api/mbti", mbtiRoutes);
// ROUTER MENTOR AI
app.use("/api/mentor", mentorRoutes);
// ROUTER COMPARISON
app.use("/api/comparison", comparisonRoutes);
// ROUTER PDF
app.use("/api/pdf", pdfRoutes);
// ROUTER PAYMENT
app.use("/api/payments", paymentRoutes);
// ROUTER UNIVERSITIES
app.use("/api/universities", universityRoutes);
// ROUTER USERS
app.use("/api/users", userRoutes);
// ROUTER NOTIFICATIONS
app.use("/api/notifications", notificationRoutes);
// ROUTER ADMIN
app.use("/api/admin", adminRoutes);
app.use("/api/admin/majors", adminMajorRoutes);
app.use("/api/admin/questions", adminQuestionRoutes);

// 404 Handler for API
app.use("/api", (req, res) => {
  res.status(404).json({
    status: "error",
    message: `API endpoint ${req.originalUrl} not found`,
  });
});
// PORT SERVER
const PORT = process.env.PORT || 3000;

// START SERVER
const startServer = async () => {
  try {
    // CONNECT DB
    await connectDB();
    // SERVER RUNNING PORT
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("DB connection failed", err);
  }
};
// CALL FUNCTION START SERVER
startServer();
