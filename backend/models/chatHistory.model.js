const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "model"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const chatHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    messages: [messageSchema],
    title: {
      type: String,
      default: "New Chat",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
chatHistorySchema.index({ user: 1, sessionId: 1 });

module.exports = mongoose.model("ChatHistory", chatHistorySchema);
