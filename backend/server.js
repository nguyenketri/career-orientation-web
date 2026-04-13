require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const majorRoutes = require("./routes/major.routes");
const app = express();

// middleware : biến JSON -> OBJECT JS
app.use(express.json());

// ROUTER AUTHEN
app.use("/api/auth", authRoutes);
// ROUTER MAJOR
app.use("/api/majors", majorRoutes);
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
