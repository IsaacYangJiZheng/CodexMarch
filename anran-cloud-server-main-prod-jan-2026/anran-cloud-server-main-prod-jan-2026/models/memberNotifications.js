const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const messagesSchema = new Schema({
  notificationCategory: {
    type: String,
    required: true,
  },
  notificationType: {
    type: String,
    required: true,
  },
  notificationTitle: {
    type: String,
    required: true,
  },
  notificationMsg: {
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
  notificationColor: {
    type: String,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  status: {
    type: String,
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "members",
  },
  entityName: {
    type: String,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  isRead: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  sendAt: { type: Date, default: Date.now },
  readAt: { type: Date },
});
module.exports = mongoose.model("memberNotification", messagesSchema);
