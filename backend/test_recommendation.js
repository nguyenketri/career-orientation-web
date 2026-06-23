const mongoose = require("mongoose");
require("dotenv").config({ path: "./backend/.env" });
require("./models/universityMajor.model");
require("./models/university.model");
require("./models/major.model");

const { recommendBySubjects } = require("./services/recommend.service");

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const testScores = {
      math: 8,
      physics: 8,
      chemistry: 8,
      literature: 7,
      english: 7,
    };
    const testFilters = {
      location: "",
      type: "",
      maxTuition: 200 * 1000000,
    };
    const testPagination = { page: 1, limit: 10 };

    console.log("\nTesting with scores:", testScores);
    console.log("Filters:", testFilters);

    const result = await recommendBySubjects(
      null,
      testScores,
      testFilters,
      testPagination,
    );

    console.log("\n--- Result ---");
    console.log("Combinations found:", result.combinations);
    console.log("Total recommendations:", result.total);
    console.log(
      "Recommendations:",
      JSON.stringify(result.recommendations, null, 2),
    );

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

test();
