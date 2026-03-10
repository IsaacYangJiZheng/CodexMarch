const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const otpLogSchema = new Schema({
  customerName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  sentAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  result: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("otp_logs", otpLogSchema);