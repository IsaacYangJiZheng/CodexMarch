const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const orderSchema = new Schema({
  orderDate: {
    type: Date,
    default: Date.now,
  },
  orderNumber: {
    type: String,
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "members",
    required: true,
  },
  orderBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },
  // items: [{ type: mongoose.Schema.Types.ObjectId, ref: "orderItems" }],
  orderTotalAmount: {
    type: Number,
    default: 0,
  },
  orderTotalDiscountAmount: {
    type: Number,
    default: 0,
  },
  taxCode: {
    type: String,
  },
  taxValue: {
    type: Number,
    default: 0,
  },
  orderTotalTaxAmount: {
    type: Number,
    default: 0,
  },
  orderTotalNetAmount: {
    type: Number,
    default: 0,
  },
  orderMode: {
    type: String,
    default: "Direct",
  },
  status: { type: String },
  description: { type: String },
  payments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payments",
    },
  ],
  orderGateWayNo: {
    type: String,
  },
  remarks: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String },
  createdBy: { type: String },
});

orderSchema.pre("save", function (next) {
  const user = this;
  this.updatedAt = Date.now();
  this.updatedBy = user.uid;
  next();
});

module.exports = mongoose.model("Orders", orderSchema);
