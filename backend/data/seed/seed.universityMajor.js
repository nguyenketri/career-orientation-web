const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const University = require("../../models/university.model");
const Major = require("../../models/major.model");
const UniversityMajor = require("../../models/universityMajor.model");

const seedUniversityMajors = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/cazup";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding UniversityMajors...");

    // 1. Fetch all universities and majors
    const universities = await University.find({});
    const majors = await Major.find({});

    if (universities.length === 0 || majors.length === 0) {
      console.error(
        "Missing Universities or Majors in database. Please seed them first.",
      );
      process.exit(1);
    }

    console.log(
      `Found ${universities.length} universities and ${majors.length} majors.`,
    );

    // 2. Clear existing UniversityMajor data to avoid duplicates
    await UniversityMajor.deleteMany({});
    console.log("Cleared existing UniversityMajor data.");

    const universityMajorData = [];

    // 3. For each major, assign it to 1-3 random universities
    for (const major of majors) {
      const numUniversities = Math.floor(Math.random() * 3) + 1; // 1 to 3 universities per major

      // Shuffle universities and pick the first 'numUniversities'
      const shuffledUnis = [...universities].sort(() => 0.5 - Math.random());
      const selectedUnis = shuffledUnis.slice(0, numUniversities);

      for (const uni of selectedUnis) {
        universityMajorData.push({
          university: uni._id,
          major: major._id,
          admissionScore: Math.floor(Math.random() * (30 - 15 + 1)) + 15, // 15 to 30
          tuitionFee:
            Math.floor(Math.random() * (60000000 - 15000000 + 1)) + 15000000, // 15M to 60M
          subjectCombination: ["A00", "A01", "B00", "D01"][
            Math.floor(Math.random() * 4)
          ],
        });
      }
    }

    // 4. Insert data in bulk
    await UniversityMajor.insertMany(universityMajorData);
    console.log(
      `Successfully seeded ${universityMajorData.length} UniversityMajor documents.`,
    );

    mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding UniversityMajors:", error);
    process.exit(1);
  }
};

seedUniversityMajors();
