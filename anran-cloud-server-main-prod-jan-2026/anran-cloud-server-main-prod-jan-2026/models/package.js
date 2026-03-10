const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
  packageName: { type: String, required: true },
  packageCode: { type: String, required: true },
  packagePrice: { type: Number, required: true },
  packageCategory: { type: String, required: true },
  packageImageURL: { type: String },
  packageImageData: { type: String },
  packageOrder: { type: Number, default: 1 },
  packageUnlimitedStatus: { type: Boolean, required: true },
  packageUsageLimit: { type: Number },
  branchGroup: { type: String, require: true },
  packageTransferableStatus: { type: Boolean, required: true },
  packageValidity: { type: String, require: true },
  packageFixedValidityDate1: { type: Date },
  packageFixedValidityDate2: { type: Date },
  branchGroup: { type: String, require: true },
  branchName: [{ type: mongoose.Schema.Types.ObjectId, ref: "Branch" }],
  allBranchStatus: { type: Boolean, required: true },
  packagePublishStatus: { type: Boolean, required: true },
  packageAvailabilityMode: { type: Boolean, required: true },
  maxQtyType: { type: String },
  maxQty: { type: Number },
  isAlways: { type: Boolean, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  isWalkInSaleOnly: { type: Boolean, required: true, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  isInstant: { type: Boolean, default: false },
});

packageSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Package = mongoose.model("Package", packageSchema);

module.exports = Package;
