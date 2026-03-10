const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const memberPackageTransferSchema = new Schema({
  transactionNo: {
    type: String,
  },
  transferDate: {
    type: Date,
    default: Date.now,
  },
  originalPurchaseInvoice: {
    type: String,
  },
  memberFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "members",
  },
  memberTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "members",
  },
  fromMemberPackage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "memberPackage",
  },
  toMemberPackage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "memberPackage",
    default: null,
  },
  transferSessionCount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "Success",
  },
  notes: {
    type: String,
  },
  createdBy: {
    type: String,
  },
  cancelBy: {
    type: String,
  },
});

module.exports = mongoose.model(
  "memberPackageTransfer",
  memberPackageTransferSchema
);
