const mongoose = require("mongoose");
const User = require("./models/user.model");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

async function checkUsers() {
  try {
    const uri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      process.env.DATABASE_URL;
    if (!uri) {
      throw new Error("MongoDB URI not found in environment variables.");
    }
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    const users = await User.find({}).select("email role");
    console.log("\n--- Users List ---");
    users.forEach((user) => {
      console.log(`Email: ${user.email}, Role: ${user.role}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUsers();
