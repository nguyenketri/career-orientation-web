const mongoose = require("mongoose");
const User = require("./models/user.model");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

async function revertRoles() {
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

    // Set everyone to 'user' first
    await User.updateMany({}, { $set: { role: "user" } });

    // Set only admin@gmail.com to 'admin'
    const adminResult = await User.updateOne(
      { email: "admin@gmail.com" },
      { $set: { role: "admin" } },
    );

    if (adminResult.matchedCount === 0) {
      console.log("Warning: admin@gmail.com not found in database.");
    } else {
      console.log(
        "Successfully reverted roles. Only admin@gmail.com is now an admin.",
      );
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

revertRoles();
