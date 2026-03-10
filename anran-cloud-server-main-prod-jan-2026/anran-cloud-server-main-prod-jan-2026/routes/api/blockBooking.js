const express = require("express");
const mongoose = require("mongoose");
const BlockBooking = require("../../models/blockBooking");
const Booking = require("../../models/booking");
const Staff = require("../../models/staff");
const auth = require("./jwtfilter"); 
const router = express.Router();

router.post("/new-block-booking", auth, async (req, res) => {
  try {
    const { branch, floor, room, blockingStart, blockingEnd, isFullBranch, isFullDay, blockTimeSlot } = req.body;
    const approvalStatus = req.user && req.user.uid === 'admin';

    const floorArr = (Array.isArray(floor) ? floor : [floor]).filter(f => f);
    const roomArr = (Array.isArray(room) ? room : [room]).filter(r => r);

    const { error } = await validateBlockBooking({
      branch,
      floorArr,
      roomArr,
      blockingStart,
      blockingEnd,
      isFullDay,
      blockTimeSlot,
    });
    if (error) {
      return res.status(400).json({ status: "error", message: error });
    }

    const newBlockBooking = new BlockBooking({
      branch,
      floor: floorArr,
      room: roomArr,
      blockingStart,
      blockingEnd,
      approvalStatus,
      isFullBranch,
      isFullDay,
      blockTimeSlot,
      blockingStatus: "Scheduled",
      createdBy: req.user ? req.user.uid : null,
    });

    await newBlockBooking.save();

    res.status(201).json({
      status: "ok",
      data: newBlockBooking,
      message: "Block booking created successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.post("/findAll", auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await BlockBooking.updateMany(
      {
        blockingEnd: { $lt: today },
        blockingStatus: "Scheduled"
      },
      { $set: { blockingStatus: "Completed" } }
    );

    const {
      branch,
      startDate,
      endDate,
      status,
    } = req.body;
    const filters = {};
    if (status) filters.approvalStatus = status;
    if (startDate || endDate) {
      filters.blockingStart = {};
      if (startDate)
        filters.blockingStart.$gte = new Date(
          new Date(startDate).setHours(0, 0, 0, 0)
        );
      if (endDate)
        filters.blockingStart.$lte = new Date(
          new Date(endDate).setHours(23, 59, 59, 999)
        );
    }
    if (branch) filters["branch.convertedId"] = branch;

    if (req.user.uid !== "admin" && !branch) {
      const staff = await Staff.findOne({ _id: req.user.uid }).populate(
        "branch"
      );
      if (!staff || !staff.branch || !staff.branch.length) {
        return res
          .status(404)
          .send({ message: "No branches found for the user" });
      }

      const branchIds = staff.branch.map((branch) => branch._id);
      filters["branch._id"] = { $in: branchIds };
    }

    const obj = await BlockBooking.aggregate([
      {
        $lookup: {
          from: "branches",
          localField: "branch",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                branchName: 1,
              },
            },
          ],
          as: "branch",
        },
      },
      {
        $addFields: {
          branch: {
            $arrayElemAt: ["$branch", 0],
          },
        },
      },
      {
        $addFields: {
          "branch.convertedId": { $toString: "$branch._id" },
        },
      },
      {
        $lookup: {
          from: "floors",
          localField: "floor",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                floorNo: 1,
              },
            },
          ],
          as: "floor",
        },
      },
      {
        $lookup: {
          from: "rooms",
          localField: "room",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                room_no: 1,
              },
            },
          ],
          as: "room",
        },
      },
      {
        $match: {
          ...filters,
        },
      },
      {
        $project: {
          branch: 1,
          floor: 1,
          room: 1,
          blockingStart: 1,
          blockingEnd: 1,
          blockingStatus: 1,
          approvalStatus: 1,
          isFullDay: 1,
          blockTimeSlot: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/check-block-booking", auth, async (req, res) => {
  try {
    const obj = await BlockBooking.find({})
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/check-blocking-by-date", auth, async (req, res) => {
  try {
    const { branch, floor, date } = req.body;
    if (!branch || !floor || !date) {
      return res.status(400).json({ status: "error", message: "branch, floor, and date are required" });
    }

    const dayStart = new Date(new Date(date).setHours(0, 0, 0, 0));
    const dayEnd = new Date(new Date(date).setHours(23, 59, 59, 999));

    const blocks = await BlockBooking.find({
      branch,
      floor: { $in: [floor] },
      blockingStatus: 'Scheduled',
      $or: [
        { blockingStart: { $lte: dayEnd }, blockingEnd: { $gte: dayStart } },
        { blockingStart: { $gte: dayStart, $lte: dayEnd } },
        { blockingEnd: { $gte: dayStart, $lte: dayEnd } }
      ]
    });
    res.status(200).json({ status: "ok", data: blocks });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.post("/update-block-booking", auth, async (req, res) => {
  try {
    const { _id, branch, floor, room, blockingStart, blockingEnd, isFullBranch, isFullDay, blockTimeSlot } = req.body;
    const approvalStatus = req.user && req.user.uid === 'admin';

    const floorArr = (Array.isArray(floor) ? floor : [floor]).filter(f => f);
    const roomArr = (Array.isArray(room) ? room : [room]).filter(r => r);

    // Use shared validation, exclude current block booking by _id
    const { error } = await validateBlockBooking({
      branch,
      floorArr,
      roomArr,
      blockingStart,
      blockingEnd,
      isFullDay,
      blockTimeSlot,
      excludeId: _id,
    });
    if (error) {
      return res.status(400).json({ status: "error", message: error });
    }

    const updatedBlockBooking = await BlockBooking.findByIdAndUpdate(
      _id,
      {
        branch,
        floor: Array.isArray(floor) ? floor : [floor],
        room: Array.isArray(room) ? room : [room],
        blockingStart,
        blockingEnd,
        approvalStatus,
        isFullBranch,
        isFullDay,
        blockTimeSlot,
      },
      { new: true }
    );

    if (!updatedBlockBooking) {
      return res.status(404).json({ status: "error", message: "Block booking not found." });
    }

    res.status(201).json({
      status: "ok",
      data: updatedBlockBooking,
      message: "Block booking created successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.post("/delete-block-booking", auth, async (req, res) => {
  try {
    const { _id } = req.body;
    const updatedBlockBooking = await BlockBooking.findByIdAndUpdate(
      _id,
      { blockingStatus: "Deleted" },
      { new: true }
    );
    if (!updatedBlockBooking) {
      return res.status(404).json({ status: "error", message: "Block booking not found." });
    }
    res.status(200).json({
      status: "ok",
      message: "Block booking deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

async function validateBlockBooking({ branch, floorArr, roomArr, blockingStart, blockingEnd, isFullDay, blockTimeSlot, excludeId }) {
  // If isFullDay, set blockingStart and blockingEnd to cover the whole day
  let start = new Date(blockingStart);
  start.setUTCDate(start.getUTCDate() - 1); // previous day
  start.setUTCHours(16, 0, 0, 0);
  let end = new Date(blockingEnd);
  end.setUTCHours(15, 59, 59, 999);
  // console.log("Start:", start, "End:", end, blockTimeSlot);
  // 1. Check for overlapping block bookings (excluding self if updating)
  const blockBookingQuery = {
    branch,
    blockingStatus: 'Scheduled',
    floor: { $in: floorArr },
    room: { $in: roomArr },
    blockingStart: { $lt: end },
    blockingEnd: { $gt: start },
    ...(blockTimeSlot && blockTimeSlot.length > 0 ? { blockTimeSlot: { $in: blockTimeSlot } } : {}),
  };
  if (excludeId) blockBookingQuery._id = { $ne: excludeId };
  const overlappingBlock = await BlockBooking.findOne(blockBookingQuery);
  if (overlappingBlock) {
    return { error: "Overlapping block booking exists for this branch, floor, and room." };
  }

  // 2. Check for existing bookings
  const bookingQuery = {
    branch,
    floor: { $in: floorArr },
    room: { $in: roomArr },
    start: { $lt: end },
    end: { $gt: start },
  };
  // console.log("Booking Query:", bookingQuery);
  const overlappingBooking = await Booking.findOne(bookingQuery);
  if (overlappingBooking) {
    return { error: "Cannot block: there are existing bookings for the selected branch/floor/room and time." };
  }

  return { error: null };
}

module.exports = router;
