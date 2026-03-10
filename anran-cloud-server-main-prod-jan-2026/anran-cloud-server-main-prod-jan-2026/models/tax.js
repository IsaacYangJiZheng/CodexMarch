const mongoose = require("mongoose");

const taxSchema = new mongoose.Schema({
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "branch" },
  category: { type: String, required: true },
  taxType: { type: String, required: true },
  taxValue: { type: String, required: true },
  effectiveDate: { type: String, required: true },
  closeDate: { type: String },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

taxSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Tax = mongoose.model("Tax", taxSchema);

module.exports = Tax;
