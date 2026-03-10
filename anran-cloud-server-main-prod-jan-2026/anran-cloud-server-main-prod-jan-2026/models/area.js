const mongoose = require("mongoose");

const areaSchema = new mongoose.Schema({
  areaCode: { type: String, required: true },
  areaName: { type: String, required: true },
  areaOrder: { type: Number, default: 1 },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

areaSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Area = mongoose.model("Area", areaSchema);

module.exports = Area;
