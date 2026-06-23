const mongoose = require("mongoose");
require("dotenv").config({ path: "backend/.env" });
const ChatHistory = require("./models/chatHistory.model");
const User = require("./models/user.model");

async function cleanupChatHistories() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // Get all valid user IDs
    const users = await User.find({}, "_id");
    const validUserIds = new Set(users.map((u) => u._id.toString()));
    console.log(`Found ${validUserIds.size} valid users.`);

    // Find all chat histories
    const chatHistories = await ChatHistory.find({});
    let deletedCount = 0;

    for (const chat of chatHistories) {
      if (chat.user && !validUserIds.has(chat.user.toString())) {
        await ChatHistory.deleteOne({ _id: chat._id });
        deletedCount++;
      }
    }

    console.log(
      `Successfully deleted ${deletedCount} orphaned chat history records.`,
    );

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  } catch (error) {
    console.error("Error cleaning up chat histories:", error);
    process.exit(1);
  }
}

cleanupChatHistories();
