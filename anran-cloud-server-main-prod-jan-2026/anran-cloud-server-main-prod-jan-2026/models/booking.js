const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },
  floor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Floor",
    required: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "rooms",
    required: true,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MemberBooking",
    },
  ],
  title: {
    type: String,
  },
  pax: {
    type: Number,
  },
  availableSlot: {
    type: Number,
  },
  bookingType: {
    type: String,
  },
  remarks: {
    type: String,
  },
});

module.exports = mongoose.model("Booking", bookingSchema);
