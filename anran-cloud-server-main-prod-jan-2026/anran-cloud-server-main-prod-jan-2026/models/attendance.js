const mongoose = require("mongoose");
const attendanceSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date },
  duration: { type: String },
  checkInImageUrl: { type: String },
  checkOutImageUrl: { type: String },
  allowOT: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

attendanceSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
