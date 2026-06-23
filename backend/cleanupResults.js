const mongoose = require("mongoose");
require("dotenv").config({ path: "backend/.env" });
const HollandResult = require("./models/hollandResult.model");
const MbtiResult = require("./models/mbtiResult.model");
const User = require("./models/user.model");

async function cleanupResults() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // Get all valid user IDs
    const users = await User.find({}, "_id");
    const validUserIds = new Set(users.map((u) => u._id.toString()));
    console.log(`Found ${validUserIds.size} valid users.`);

    // Cleanup Holland Results
    const hollandResults = await HollandResult.find({});
    let hollandDeleted = 0;
    for (const res of hollandResults) {
      if (res.user && !validUserIds.has(res.user.toString())) {
        await HollandResult.deleteOne({ _id: res._id });
        hollandDeleted++;
      }
    }
    console.log(`Deleted ${hollandDeleted} orphaned Holland results.`);

    // Cleanup MBTI Results
    const mbtiResults = await MbtiResult.find({});
    let mbtiDeleted = 0;
    for (const res of mbtiResults) {
      if (res.user && !validUserIds.has(res.user.toString())) {
        await MbtiResult.deleteOne({ _id: res._id });
        mbtiDeleted++;
      }
    }
    console.log(`Deleted ${mbtiDeleted} orphaned MBTI results.`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  } catch (error) {
    console.error("Error cleaning up results:", error);
    process.exit(1);
  }
}

cleanupResults();
