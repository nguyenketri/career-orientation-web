const mongoose = require("mongoose");
const University = require("./models/university.model");
const Major = require("./models/major.model");
const UniversityMajor = require("./models/universityMajor.model");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

async function findMissingScores() {
  try {
    const uri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      process.env.DATABASE_URL;
    if (!uri) {
      throw new Error(
        "MongoDB URI not found in environment variables. Please check your .env file.",
      );
    }
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    const targetUniversities = [
      "Đại học Kinh tế Quốc dân",
      "Đại học Sư phạm Kỹ thuật TP.HCM",
    ];
    const targetMajors = ["Kỹ thuật Phần mềm", "Răng Hàm Mặt"];

    const universities = await University.find({
      name: { $in: targetUniversities },
      isDeleted: false,
    });

    const majors = await Major.find({
      name: { $in: targetMajors },
      isDeleted: false,
    });

    const uniIds = universities.map((u) => u._id);
    const majorIds = majors.map((m) => m._id);

    const records = await UniversityMajor.find({
      university: { $in: uniIds },
      major: { $in: majorIds },
      isDeleted: false,
    }).populate("university major");

    console.log("\n--- Records Found ---");
    records.forEach((rec) => {
      console.log(`\nUniversity: ${rec.university.name}`);
      console.log(`Major: ${rec.major.name}`);
      console.log(`ID: ${rec._id}`);
      console.log(`Current Score: ${rec.admissionScore}`);
      console.log(`History: ${JSON.stringify(rec.admissionHistory)}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

findMissingScores();
