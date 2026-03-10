const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "members",
    required: true,
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  added_date: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Cart", cartSchema);
