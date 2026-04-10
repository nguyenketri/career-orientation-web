require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const app = express();

// connectDB
connectDB();

// middleware
app.use(express.json());

// route test
app.get("/", (req, res) => {
  res.send("API running....");
});
app.use("/api/auth", authRoutes);
// start server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
