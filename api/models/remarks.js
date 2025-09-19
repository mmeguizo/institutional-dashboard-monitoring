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

module.exports = mongoose.model("remarks", remarks);
