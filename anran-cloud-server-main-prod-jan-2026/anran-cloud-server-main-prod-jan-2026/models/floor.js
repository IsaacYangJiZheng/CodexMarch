const mongoose = require("mongoose");

const floorSchema = new mongoose.Schema({
  branchName: { type: mongoose.Schema.Types.ObjectId, ref: "branch" },
  floorNo: { type: String, required: true },
  floorDetail: { type: String, required: true },
  floorImage: { type: String },
  floorPlan: { type: String },
  floorOrder: { type: Number, default: 1 },
  floorStatus: { type: Boolean, required: true },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
});

floorSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Soft delete method
floorSchema.methods.softDelete = function () {
  this.deletedAt = Date.now();
  return this.save();
};

const Floor = mongoose.model("Floor", floorSchema);

module.exports = Floor;
