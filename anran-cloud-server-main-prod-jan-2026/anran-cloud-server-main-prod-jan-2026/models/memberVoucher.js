const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const memberVoucherSchema = new Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "members",
    required: true,
  },
  voucher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Voucher",
  },
  issuedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
  },
  issuedDate: {
    type: Date,
    default: Date.now,
  },
  used: {
    type: Boolean,
    default: false,
  },
  usedDate: {
    type: Date,
  },
  usedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "branch",
  },
  voucherType: {
    type: String,
  },
  validDate: {
    type: Date,
    required: true,
  },
  isExpired: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("memberVoucher", memberVoucherSchema);
