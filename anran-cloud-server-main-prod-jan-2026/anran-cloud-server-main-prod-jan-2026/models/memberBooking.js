const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingMemberSchema = new Schema({
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
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  bookingNo: {
    type: String,
    required: true,
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "members",
    required: true,
  },
  memberPackage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "memberPackage",
    required: true,
  },
  pax: {
    type: Number,
    required: true,
  },
  malePax: {
    type: Number,
  },
  femalPax: {
    type: Number,
  },
  bookingstatus: {
    type: String,
    default: "Booked",
  },
  checkin_date: {
    type: Date,
    default: null,
  },
  checkout_date: {
    type: Date,
    default: null,
  },
  bookingType: {
    type: String,
    default: "Online",
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  cancellationReason: {
    type: String,
  },
  remarks: { type: String },
});

module.exports = mongoose.model("MemberBooking", bookingMemberSchema);
