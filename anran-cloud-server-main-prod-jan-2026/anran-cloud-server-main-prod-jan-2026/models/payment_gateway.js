const mongoose = require("mongoose");

const paymentGatewaySchema = new mongoose.Schema({
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "branch" },
  provider: { type: String, required: true },
  providerKey1: { type: String, required: true },
  providerKey2: { type: String, required: true },
  currency: { type: String, required: true },
  allowedMethod: { type: Object, required: true },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

paymentGatewaySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const PaymentGateway = mongoose.model("PaymentGateway", paymentGatewaySchema);

module.exports = PaymentGateway;
