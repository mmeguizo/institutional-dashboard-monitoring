const mongoose = require("mongoose");
const { Schema } = mongoose;

const logs = new Schema(
  {
    method: {},
    params: {},
    query: {},
    url: {},
    body: {},
    status: {},
    duration: {},
    date: {},
    statusCode: {},
    ip: {},
    user: {},
    deleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Performance indexes for high-traffic queries
logs.index({ date: -1 }); // For sorting by date
logs.index({ user: 1, date: -1 }); // For user activity lookups
logs.index({ url: 1, date: -1 }); // For URL-based analytics
logs.index({ deleted: 1 }); // For filtering deleted logs

module.exports = mongoose.model("Logs", logs);

/*

method: req.method,
      params: req.params,
      query: req.query,
      url: req.originalUrl,
      body: req.body,
      status: res.statusCode,
      duration: `${duration}ms`,
      date: Date.now(),
      statusCode: res.statusCode,
      ip: req.socket.remoteAddress,

*/
