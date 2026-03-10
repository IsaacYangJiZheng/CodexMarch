const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const memberPackageBalanceLogSchema = new Schema({
  user: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "members",
    required: true,
  },
  memberBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MemberBooking",
    required: true,
  },
  memberPackage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "memberPackage",
    required: true,
  },
  before: {
    type: Object,
    required: true,
  },
  after: {
    type: Object,
    required: true,
  },
  approvedBy: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  approvedAt: {
    type: Date,
  },
  cancellationReason: {
    type: String,
  },
});

module.exports = mongoose.model(
  "MemberPackageBalanceLogSchema",
  memberPackageBalanceLogSchema
);
