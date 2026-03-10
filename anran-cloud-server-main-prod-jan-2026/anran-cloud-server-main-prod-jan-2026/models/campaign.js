const mongoose = require("mongoose");

const campaignPackageSchema = new Schema({
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
    required: true,
  },
  campaign_price: { type: Number },
  campaign_limit: { type: Number },
});

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  period_from: {
    type: Date,
    required: true,
  },
  period_to: {
    type: Date,
    required: true,
  },
  packages: [campaignPackageSchema],
  quantity: {
    type: Number,
    default: 1,
  },
});

module.exports = mongoose.model("Campaign", campaignSchema);
