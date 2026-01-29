const mongoose = require("mongoose");
const { Schema } = mongoose;

const remarks = new Schema(
  {
    remarks: String,
    userId: String,
    objectiveId: String,
    deleted: { type: Boolean, default: false },
    // parentRemarkId: { type: String, default: null }, // Add this field
  },
  {
    timestamps: true,
  }
);

// Performance indexes for high-traffic queries
remarks.index({ objectiveId: 1, deleted: 1 }); // For objective remarks lookup
remarks.index({ userId: 1, deleted: 1 }); // For user remarks lookup
remarks.index({ createdAt: -1 }); // For sorting by creation date

module.exports = mongoose.model("remarks", remarks);
