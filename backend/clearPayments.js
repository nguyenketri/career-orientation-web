const mongoose = require("mongoose");
require("dotenv").config({ path: "backend/.env" });
const Payment = require("./models/payment.model");

async function clearPayments() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    const result = await Payment.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} payment records.`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  } catch (error) {
    console.error("Error clearing payments:", error);
    process.exit(1);
  }
}

clearPayments();
