const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Counter = require("./counterSchema");

const paymentSchemaOld = new Schema({
  method: { type: String, required: true },
  amount: { type: Number, required: true },
});

const membersSchemaOld = new Schema({
  package_date: {
    type: Date,
    default: Date.now,
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "members",
    required: true,
  },
  packageid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "items",
    required: true,
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "branch",
  },
  package: {
    type: String,
  },
  quantity: {
    type: Number,
  },
  price: {
    type: Number,
  },
  tax: {
    type: Number,
    default: 0,
  },
  tax_price: {
    type: Number,
    default: 0,
  },
  times: {
    type: Number,
  },
  used: {
    type: Number,
    default: 0,
  },
  balance: {
    type: Number,
  },
  purchasetype: {
    type: String,
    default: "Purchased",
  },
  transferfrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "memberPackage",
    default: null,
  },
  transferedtimes: {
    type: Number,
    default: 0,
  },
  paymenttype: {
    type: String,
  },
  invoicenumber: {
    type: String,
  },
  purchasemode: {
    type: String,
    default: "Direct",
  },
  validdate: {
    type: Date,
  },
  booking_date: {
    type: Date,
  },
  paymentmethod: [paymentSchemaOld],
});

module.exports = mongoose.model("memberPackage", membersSchemaOld);
