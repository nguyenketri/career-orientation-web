const mongoose = require("mongoose");
require("dotenv").config({ path: "./backend/.env" });
require("./models/universityMajor.model");
require("./models/university.model");

async function debug() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const UniversityMajor = mongoose.model("UniversityMajor");
    const University = mongoose.model("University");

    const sampleMajors = await UniversityMajor.find({}).limit(5);
    console.log("\n--- Sample UniversityMajor Data ---");
    console.log(JSON.stringify(sampleMajors, null, 2));

    for (const major of sampleMajors) {
      const uni = await University.findById(major.university);
      console.log(
        `\nMajor ${major._id} linked to University ${major.university}:`,
      );
      console.log(`- University exists: ${!!uni}`);
      if (uni) {
        console.log(`- University isDeleted: ${uni.isDeleted}`);
        console.log(`- University name: ${uni.name}`);
      }
    }

    const combinations = await UniversityMajor.distinct("subjectCombination");
    console.log("\n--- Available Subject Combinations in DB ---");
    console.log(combinations);

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

debug();
