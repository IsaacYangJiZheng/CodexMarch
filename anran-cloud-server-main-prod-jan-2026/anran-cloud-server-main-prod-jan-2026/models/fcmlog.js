const mongoose = require("mongoose");

const fcmlogSchema = new mongoose.Schema({
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MemberDevice",
    required: true,
  },
  notification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "memberNotification",
    required: true,
  },
  response: { type: String },
  status: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

fcmlogSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Fcmlog = mongoose.model("fcmlog", fcmlogSchema);

module.exports = Fcmlog;
