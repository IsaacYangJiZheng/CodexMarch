const mongoose = require("mongoose");
const BlockBooking = require("../../models/blockBooking");

async function isFullDayBookingBlocked(branch, bookingDate) {
  if (!branch || !bookingDate) {
    throw new Error("branch and date are required");
  }
  // Parse date to get start and end of the day
  const dayStart = new Date(new Date(bookingDate).setHours(0, 0, 0, 0));
  const dayEnd = new Date(new Date(bookingDate).setHours(23, 59, 59, 999));
  // Find all block bookings for the branch and floor that overlap with the date
  const blocks = await BlockBooking.countDocuments({
    branch,
    blockingStatus: "Scheduled",
    isFullDay: true,
    $or: [
      { blockingStart: { $lte: dayEnd }, blockingEnd: { $gte: dayStart } },
      { blockingStart: { $gte: dayStart, $lte: dayEnd } },
      { blockingEnd: { $gte: dayStart, $lte: dayEnd } },
    ],
  });
  if (blocks > 0) {
    return true;
  }
  return false;
}

module.exports = {
  isFullDayBookingBlocked,
};
