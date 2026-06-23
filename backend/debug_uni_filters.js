const mongoose = require("mongoose");
require("dotenv").config({ path: "./backend/.env" });
require("./models/university.model");

async function debug() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const University = mongoose.model("University");

    const locations = await University.distinct("location");
    console.log("\n--- Distinct Locations in DB ---");
    console.log(locations);

    const types = await University.distinct("type");
    console.log("\n--- Distinct Types in DB ---");
    console.log(types);

    const sampleUnis = await University.find({}).limit(10);
    console.log("\n--- Sample Universities ---");
    sampleUnis.forEach((u) => {
      console.log(`Name: ${u.name}, Location: ${u.location}, Type: ${u.type}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

debug();
