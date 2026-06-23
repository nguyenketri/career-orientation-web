const mongoose = require("mongoose");
const User = require("./models/user.model");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

async function promoteToAdmin() {
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

    const result = await User.updateMany(
      { role: "user" },
      { $set: { role: "admin" } },
    );

    console.log(
      `Successfully promoted ${result.modifiedCount} users to admin.`,
    );
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

promoteToAdmin();
