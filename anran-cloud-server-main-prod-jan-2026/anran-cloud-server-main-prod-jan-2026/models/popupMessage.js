const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const popupMessageSchema = new Schema({
  messageDetails: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "popupMessageDetails",
    required: true,
  }],
  messageContentType: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  imageDataUrl: {
    type: String,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  statusActive: {
    type: Boolean,
    required: true,
  },
  displayOrder: {
    type: Number,
    default: 1,
  },
  publish: {
    type: Boolean,
    required: true,
  },
  isDeleted: { type: Boolean, default: false },
});
module.exports = mongoose.model("popupMessages", popupMessageSchema);
