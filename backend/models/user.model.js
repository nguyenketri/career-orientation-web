const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    avatar: {
      type: String,
      default: "https://api.dicebear.com/7.x/avataaars/svg?seed=cazup",
    },
    dob: {
      type: Date,
    },
    phone: {
      type: String,
    },
    bio: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    subscriptionPlan: {
      type: String,
      enum: ["FREE", "PAID", "PREMIUM"],
      default: "FREE",
    },
    subscriptionExpiry: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    careerPath: {
      hollandType: {
        type: String,
        default: null,
      },
      hollandScore: {
        type: Object,
        default: null,
      },
      mbtiType: {
        type: String,
        default: null,
      },
      mbtiScore: {
        type: Object,
        default: null,
      },
      recommendedMajors: [
        {
          majorId: mongoose.Schema.Types.ObjectId,
          majorName: String,
          matchScore: Number,
          addedAt: { type: Date, default: Date.now },
        },
      ],
      recommendedUniversities: [
        {
          universityId: mongoose.Schema.Types.ObjectId,
          universityName: String,
          matchScore: Number,
          addedAt: { type: Date, default: Date.now },
        },
      ],
      lastUpdatedAt: Date,
    },
    mentorSessionHistory: [
      {
        sessionId: String,
        topic: String,
        messageCount: Number,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    dailyUsage: {
      mentorQuestions: {
        count: { type: Number, default: 0 },
        lastUsed: { type: Date, default: Date.now },
      },
      comparisonCount: {
        count: { type: Number, default: 0 },
        lastUsed: { type: Date, default: Date.now },
      },
      recommendations: {
        count: { type: Number, default: 0 },
        lastUsed: { type: Date, default: Date.now },
      },
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    googleId: String,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
