const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { Schema } = mongoose;

const goallistsSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    goals: { type: String, required: true, lowercase: true },
    objectives: [
      {
        id: { type: String, unique: true },
        objective: { type: String, lowercase: true },
        createdBy: { type: String },
        createdAt: { type: Date, default: Date.now },
        deleted: { type: Boolean, default: false },
      },
    ],
    date_added: { type: Date, required: true, default: Date.now },
    createdBy: { type: String },
    createdAt: { type: Date, default: Date.now },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Performance indexes for high-traffic queries
goallistsSchema.index({ deleted: 1 }); // For filtering active goal lists
goallistsSchema.index({ createdBy: 1, deleted: 1 }); // For creator-based queries
goallistsSchema.index({ createdAt: -1 }); // For sorting by creation date

// Export the Goals model
module.exports = mongoose.model("Goallists", goallistsSchema);
