const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  paymentNumber: {
    type: String,
    required: true,
  },
  orderNumber: {
    type: String,
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "members",
    required: true,
  },
  payDate: { type: Date, default: Date.now },
  payType: { type: String, required: true },
  payMethod: { type: String, required: true },
  payAmount: { type: Number, required: true },
  payReference: { type: String },
  status: { type: String },
  paymentGateWayNo: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String },
  createdBy: { type: String },
});

paymentSchema.pre("save", function (next) {
  const user = this;
  this.updatedAt = Date.now();
  this.updatedBy = user.uid;
  next();
});

module.exports = mongoose.model("Payments", paymentSchema);
