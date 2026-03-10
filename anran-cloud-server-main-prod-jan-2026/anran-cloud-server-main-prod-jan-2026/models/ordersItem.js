const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
  order: {
    type: String,
    required: true,
  },
  orderNo: {
    type: String,
    required: true,
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
  },
  packageCategory: {
    type: String,
    ref: "Package",
  },
  unitPrice: {
    type: Number,
  },
  quantity: {
    type: Number,
  },
  discountType: {
    type: String,
  },
  discountPrice: {
    type: Number,
  },
  unitAmount: { type: Number, required: true },
  taxCode: {
    type: String,
  },
  taxValue: {
    type: Number,
    default: 0,
  },
  taxAmount: {
    type: Number,
    default: 0,
  },
  netAmount: { type: Number, required: true },
});

module.exports = mongoose.model("OrderItems", orderItemSchema);
