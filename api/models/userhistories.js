const mongoose = require("mongoose");
const { Schema } = mongoose;

const userHistory = new Schema(
  {
    userId: String, // Reference to the user document
    timestamp: { type: Date, default: Date.now }, // Date and time of activity
    activityType: String,
    activityDetails: {
      url: String, // (for page views)
      data: {}, // (for searches)
      action: String,
    },
  },
  {
    timestamps: true,
  }
);

// Performance indexes for high-traffic queries
userHistory.index({ userId: 1, timestamp: -1 }); // For user activity history
userHistory.index({ activityType: 1, timestamp: -1 }); // For activity type filtering
userHistory.index({ timestamp: -1 }); // For sorting by time

module.exports = mongoose.model("userHistory", userHistory);
