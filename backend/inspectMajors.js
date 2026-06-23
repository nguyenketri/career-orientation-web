const mongoose = require("mongoose");
require("dotenv").config({ path: "./backend/.env" });

async function inspectMajors() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const majors = await mongoose.connection.db
      .collection("universitymajors")
      .find({})
      .limit(5)
      .toArray();
    console.log("Sample universitymajors data:");
    console.log(JSON.stringify(majors, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error inspecting majors:", err);
    process.exit(1);
  }
}

inspectMajors();
