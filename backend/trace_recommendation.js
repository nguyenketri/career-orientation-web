const mongoose = require("mongoose");
require("dotenv").config({ path: "./backend/.env" });
require("./models/universityMajor.model");
require("./models/university.model");
require("./models/major.model");

const { recommendBySubjects } = require("./services/recommend.service");

async function trace() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const testScores = {
      math: 9,
      physics: 9,
      chemistry: 9,
      literature: 9,
      english: 9,
    };
    // Test with a very low tuition limit to see if it filters
    const testFilters = {
      location: "Hà Nội",
      type: "Public",
      maxTuition: 35 * 1000000, // 35 Million
    };
    const testPagination = { page: 1, limit: 50 };

    console.log("\n--- Testing Tuition Filter ---");
    console.log("Max Tuition Limit:", testFilters.maxTuition);

    const result = await recommendBySubjects(
      null,
      testScores,
      testFilters,
      testPagination,
    );

    console.log("\n--- Final Result from Service ---");
    console.log("Total results:", result.total);

    result.recommendations.forEach((rec, idx) => {
      console.log(
        `${idx + 1}. ${rec.university?.name} - Fee: ${rec.tuitionFee} (${rec.tuitionFee ? (rec.tuitionFee / 1000000).toFixed(1) + "M" : "N/A"})`,
      );
    });

    const overLimit = result.recommendations.filter(
      (rec) => rec.tuitionFee > testFilters.maxTuition,
    );
    if (overLimit.length > 0) {
      console.log("\n❌ BUG FOUND: Some results exceed the tuition limit!");
      overLimit.forEach((rec) =>
        console.log(`- ${rec.university?.name}: ${rec.tuitionFee}`),
      );
    } else {
      console.log(
        "\n✅ SUCCESS: All results are within the tuition limit or have no fee.",
      );
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

trace();
