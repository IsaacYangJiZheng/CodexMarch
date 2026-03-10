const mongoose = require("mongoose");

const memberCartSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "members",
    required: true,
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unitAmount: { type: Number, required: true },
  discountType: {
    type: String,
  },
  discountPrice: {
    type: Number,
  },
  discountAmount: { type: Number },
  finalAmount: { type: Number, required: true },
  dayAges: {
    type: Number,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

memberCartSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const MemberCart = mongoose.model("memberCart", memberCartSchema);

module.exports = MemberCart;
