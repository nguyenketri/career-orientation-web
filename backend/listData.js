const mongoose = require("mongoose");
require("dotenv").config();

const University = require("./models/university.model");
const Major = require("./models/major.model");

async function listData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    const unis = await University.find().select("name");
    const majors = await Major.find().select("name");

    console.log("\n--- Universities ---");
    unis.forEach((u) => console.log(u.name));

    console.log("\n--- Majors ---");
    majors.forEach((m) => console.log(m.name));
  } catch (error) {
    console.error("Error listing data:", error);
  } finally {
    await mongoose.disconnect();
  }
}

listData();
