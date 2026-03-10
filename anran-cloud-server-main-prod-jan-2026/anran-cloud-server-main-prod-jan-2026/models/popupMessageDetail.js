const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const popupMessageDetailSchema = new Schema({
  popupMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "popupMessages",
    required: true,
  },
  messageTitle: {
    type: String,
    required: true,
  },
  messageShortDescription: {
    type: String,
    required: true,
  },
  messageContent: {
    type: String,
    required: true,
  },
  country: {
    type: String,
  }
});
module.exports = mongoose.model("popupMessageDetails", popupMessageDetailSchema);
