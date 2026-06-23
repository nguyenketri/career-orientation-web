const mongoose = require("mongoose");
require("dotenv").config({ path: "backend/.env" });
const ScoreAnalysis = require("./models/scoreAnalysis.model");
const User = require("./models/user.model");

async function cleanupScoreAnalysis() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // Get all valid user IDs
    const users = await User.find({}, "_id");
    const validUserIds = new Set(users.map((u) => u._id.toString()));
    console.log(`Found ${validUserIds.size} valid users.`);

    // Cleanup Score Analysis
    const analyses = await ScoreAnalysis.find({});
    let deletedCount = 0;
    for (const item of analyses) {
      if (item.user && !validUserIds.has(item.user.toString())) {
        await ScoreAnalysis.deleteOne({ _id: item._id });
        deletedCount++;
      }
    }
    console.log(`Deleted ${deletedCount} orphaned score analysis records.`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  } catch (error) {
    console.error("Error cleaning up score analysis:", error);
    process.exit(1);
  }
}

cleanupScoreAnalysis();
