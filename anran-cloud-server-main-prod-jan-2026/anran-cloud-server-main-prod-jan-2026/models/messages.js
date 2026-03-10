const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const messagesSchema = new Schema({
  messageType: {
    type: String,
    required: true,
  },
  msgName: {
    type: String,
    required: true,
  },
  msgCode: {
    type: String,
    required: true,
  },
  msg: {
    type: String,
    required: true,
  },
  msgContentType: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  imageDataUrl: {
    type: String,
  },
  msgBgColor: {
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
  always: {
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
module.exports = mongoose.model("messages", messagesSchema);
