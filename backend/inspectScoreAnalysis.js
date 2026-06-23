const mongoose = require("mongoose");
const ScoreAnalysis = require("./models/scoreAnalysis.model");

async function inspect() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/career_orientation",
    );
    console.log("Connected to MongoDB");

    const records = await ScoreAnalysis.find().sort({ createdAt: -1 }).limit(5);
    console.log("\n--- Last 5 ScoreAnalysis Records ---");
    records.forEach((r, i) => {
      console.log(`\nRecord ${i + 1}: ID ${r._id}`);
      console.log("Filters:", JSON.stringify(r.filters, null, 2));
      console.log("CreatedAt:", r.createdAt);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
}

inspect();
