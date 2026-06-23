const mongoose = require("mongoose");
const University = require("./models/university.model");
const Major = require("./models/major.model");
const UniversityMajor = require("./models/universityMajor.model");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

async function fixBenchmarkData() {
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

    const updates = [
      {
        universityName: "Đại học Kinh tế Quốc dân",
        majorName: "Kỹ thuật Phần mềm",
        currentScore: 29.0,
        history: [
          { year: 2025, admissionScore: 29.0 },
          { year: 2024, admissionScore: 28.5 },
          { year: 2023, admissionScore: 28.0 },
        ],
      },
      {
        universityName: "Đại học Sư phạm Kỹ thuật TP.HCM",
        majorName: "Răng Hàm Mặt",
        currentScore: 29.0,
        history: [
          { year: 2025, admissionScore: 29.0 },
          { year: 2024, admissionScore: 28.0 },
          { year: 2023, admissionScore: 27.0 },
        ],
      },
    ];

    for (const update of updates) {
      const university = await University.findOne({
        name: update.universityName,
        isDeleted: false,
      });
      const major = await Major.findOne({
        name: update.majorName,
        isDeleted: false,
      });

      if (!university || !major) {
        console.log(
          `Could not find university or major for ${update.universityName} - ${update.majorName}`,
        );
        continue;
      }

      await UniversityMajor.findOneAndUpdate(
        { university: university._id, major: major._id, isDeleted: false },
        {
          admissionScore: update.currentScore,
          admissionHistory: update.history,
        },
        { upsert: true, new: true },
      );
      console.log(
        `Updated data for ${update.universityName} - ${update.majorName}`,
      );
    }

    console.log("\nData update completed successfully.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

fixBenchmarkData();
