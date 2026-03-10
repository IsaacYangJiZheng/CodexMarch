const mongoose = require("mongoose");

const branchFinanceSchema = new mongoose.Schema({
  branch: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "branch",
    },
  ],
  paymentKey: { type: String },
  apiKey: { type: String },
  taxStatus: { type: Boolean, required: true },
  taxPercent: { type: Number },
  branchPercent: { type: Number },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "staff" },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "staff" },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "staff" },
});

branchFinanceSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  this.updatedBy = next.user;
  next();
});

// Soft delete method
branchFinanceSchema.methods.softDelete = function () {
  this.deletedAt = Date.now();
  return this.save();
};

const BranchFinance = mongoose.model("BranchFinance", branchFinanceSchema);

module.exports = BranchFinance;
