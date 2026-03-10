const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const roomSchema = new Schema({
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
  },
  room_no: {
    type: String,
    required: true,
  },
  floor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Floor",
  },
  roomCapacity: {
    type: Number,
    required: true,
  },
  room_floor_plan: {
    type: String,
  },
  room_floor_url: {
    type: String,
  },
  room_gender: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  sortorder: {
    type: Number,
    default: 1,
  },
  status_active: {
    type: Boolean,
    required: true,
  },
  isDeleted: { type: Boolean, default: false },
});
module.exports = mongoose.model("rooms", roomSchema);
