const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema({
  voucherType: { type: String, required: true },
  // voucherName: { type: String, required: true },
  voucherCode: { type: String, required: true },
  voucherDescription: { type: String, required: true },
  rewardType: { type: String, required: true },
  rewardValue: { type: String, required: true },
  validityType: { type: String, required: true },
  validityValue: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

voucherSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Voucher = mongoose.model("Voucher", voucherSchema);

module.exports = Voucher;
