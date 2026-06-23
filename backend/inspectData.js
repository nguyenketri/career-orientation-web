const mongoose = require("mongoose");
require("dotenv").config({ path: ".env" });
const UniversityMajor = require("./models/universityMajor.model");
const University = require("./models/university.model");
const Major = require("./models/major.model");

async function inspect() {
  await mongoose.connect(process.env.MONGO_URI);
  const data = await UniversityMajor.find().populate("university major");
  data.forEach((item) => {
    console.log(
      `Uni: ${item.university?.name}, Major: ${item.major?.name}, Tuition: ${item.tuitionFee}, History: ${JSON.stringify(item.admissionHistory)}`,
    );
  });
  await mongoose.disconnect();
}
inspect();
