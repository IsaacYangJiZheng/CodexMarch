const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const memberDepositSchema = new Schema({
  depositNumber: {
    type: String,
    required: true,
  },
  orderNumber: {
    type: String,
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "members",
    required: true,
  },
  payDate: { type: Date, default: Date.now },
  referenceNumber: { type: String, required: true },
  payMethod: { type: String, required: true },
  payAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: String },
});

memberDepositSchema.pre("save", function (next) {
  const user = this;
  this.updatedAt = Date.now();
  this.updatedBy = user.uid;
  next();
});

module.exports = mongoose.model("MemberDeposits", memberDepositSchema);
