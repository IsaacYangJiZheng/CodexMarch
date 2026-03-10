const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blockBookingSchema = new Schema({
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },
  floor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Floor",
    required: true,
  }],
  room: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "rooms",
    required: true,
  }],
  blockingStart: {
    type: Date,
    required: true,
  },
  blockingEnd: {
    type: Date,
    required: true,
  },
  blockTimeSlot: [{
    type: String,
    required: true,
  }],
  isFullBranch: {
    type: Boolean,
    default: false,
  },
  isFullDay: {
    type: Boolean,
    default: false,
  },
  blockingStatus: {
    type: String,
  },
  approvalStatus: {
    type: String,
  },
  createdBy: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("BlockBooking", blockBookingSchema);
