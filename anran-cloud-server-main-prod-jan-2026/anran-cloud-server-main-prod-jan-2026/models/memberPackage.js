const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const memberPackageSchema = new Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "members",
    required: true,
  },
  orderItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OrderItems",
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
  },
  purchaseBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  used: {
    type: Number,
    default: 0,
  },
  originalBalance: {
    type: Number,
  },
  currentBalance: {
    type: Number,
  },
  purchaseType: {
    type: String,
    default: "Purchased",
  },
  transferNo: {
    type: String,
  },
  transferId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "memberPackageTransfer",
    default: null,
  },
  transferFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "memberPackage",
    default: null,
  },
  transferredTimes: {
    type: Number,
    default: 0,
  },
  firstUsedDate: {
    type: Date,
  },
  firstUsedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
  },
  lastUsedDate: {
    type: Date,
  },
  lastUsedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
  },
  packageValidity: { type: String },
  validDate: {
    type: Date,
  },
  booking: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "booking",
    },
  ],
  isDeleted: { type: Boolean, default: false },
  isExpired: { type: Boolean, default: false },
  isFirstUsed: { type: Boolean, default: false },
  remarks: { type: String },
});

module.exports = mongoose.model("memberPackage", memberPackageSchema);
