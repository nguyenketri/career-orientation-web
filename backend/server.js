require("dotenv").config();
const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const majorRoutes = require("./routes/major.routes");
const recommendRoutes = require("./routes/recommend.routes");
const hollandRoutes = require("./routes/holland.routes");
const hollandResultRoutes = require("./routes/hollandResult.route");
const mbtiRoutes = require("./routes/mbti.routes");
const mentorRoutes = require("./routes/mentor.routes");
const universityRoutes = require("./routes/university.routes");
const userRoutes = require("./routes/user.routes");
const paymentRoutes = require("./routes/payment.routes");
const app = express();

app.use(cors());
// middleware : biến JSON -> OBJECT JS
app.use(express.json());

// ROUTER AUTHEN
app.use("/api/auth", authRoutes);
// ROUTER MAJOR
app.use("/api/majors", majorRoutes);
// ROUTER RECOMEND
app.use("/api/recommend", recommendRoutes);
// ROUTER HOLLAND TEST
app.use("/api/holland", hollandRoutes);
// ROUTER MBTI TEST
app.use("/api/mbti", mbtiRoutes);
// ROUTER MENTOR AI
app.use("/api/mentor", mentorRoutes);
// ROUTER PAYMENT
app.use("/api/payments", paymentRoutes);
// ROUTER UNIVERSITIES
app.use("/api/universities", universityRoutes);
// ROUTER USERS
app.use("/api/users", userRoutes);
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
