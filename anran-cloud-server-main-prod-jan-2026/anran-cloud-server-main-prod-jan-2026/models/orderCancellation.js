const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const orderCancellationSchema = new Schema({
  ordersId: { type: mongoose.Schema.Types.ObjectId, ref: "Orders", required: true },
  ordersDate: { type: Date, default: Date.now },
  ordersNumber: { type: String },
  ordersBranch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  ordersTotalAmount: { type: Number, default: 0 },
  ordersTotalDiscountAmount: { type: Number, default: 0 },
  ordersTaxCode: { type: String },
  ordersTaxValue: { type: Number, default: 0 },
  ordersTotalTaxAmount: { type: Number, default: 0 },
  ordersTotalNetAmount: { type: Number, default: 0 },
  payments: [{
    paymentsNumber: { type: String, required: true },
    paymentsDate: { type: Date, default: Date.now },
    paymentsType: { type: String, required: true },
    paymentsMethod: { type: String, required: true },
    paymentsAmount: { type: Number, required: true },
    paymentsReference: { type: String },
  }],
  items: [{
    orderItemsPackage: {type: mongoose.Schema.Types.ObjectId, ref: "Package" },
    orderItemsUnitPrice: { type: Number },
    orderItemsQuantity: { type: Number },
  }],
  member: { type: mongoose.Schema.Types.ObjectId, ref: "members", required: true },
  status: { type: String, default: "Pending" },
  cancellationReason: { type: String, required: true },
  otherReason: { type: String },
  cancellationFrom: { type: String },
  createdBy: { type: String, required: true },
  isCreated: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
});
module.exports = mongoose.model("orderCancellation", orderCancellationSchema);
