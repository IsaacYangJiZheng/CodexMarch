const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const dailySalesReportLogSchema = new Schema({
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  totalDiscount: {
    type: Number,
    default: 0,
  },
  totalTax: {
    type: Number,
    default: 0,
  },
  totalReceived: {
    type: Number,
    default: 0,
  },
  confirmedBy: {
    type: String,
    required: true,
  },
  confirmationStatus: { type: String },
  confirmedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DailySalesReportLog", dailySalesReportLogSchema);
