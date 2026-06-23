const mongoose = require("mongoose");
const University = require("./models/university.model");
require("dotenv").config({ path: "./backend/.env" });

async function inspect() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const universities = await University.find({}).select("name image");
    console.log("All Universities:");
    universities.forEach((u) => {
      console.log(`Name: ${u.name} | Image: ${u.image}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

inspect();
