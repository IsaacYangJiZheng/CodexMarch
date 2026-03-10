const express = require("express");
const mongoose = require("mongoose");
const Booking = require("../../models/booking");
const MemberDevice = require("../../models/memberDevice");
const MemberBooking = require("../../models/memberBooking");
const MemberPackage = require("../../models/memberPackage");
const MemberPackageBalanceLog = require("../../models/memberPackageBalanceLog");
const Members = require("../../models/members");
const OrderItems = require("../../models/ordersItem");
const Orders = require("../../models/orders");
const router = express.Router();
const moment = require("moment");
const Branch = require("../../models/branch");
const Floor = require("../../models/floor");
const Rooms = require("../../models/rooms");
const auth = require("./jwtfilter");
const Staff = require("../../models/staff");
const Package = require("../../models/package");
const dayjs = require("dayjs");
const {
  sendBookingConfirmNotification,
  sendBookingCancelNotification,
} = require("../../helper/notification");
const {
  convertDateMalaysiaTZ,
  convertTimeMalaysiaTZ,
} = require("../../helper/utils");

router.get("/all", async (req, res) => {
  try {
    updateBookingStatus();
    const booking = await Booking.find()
      .populate({
        path: "members",
        populate: [
          {
            path: "member",
            model: "members",
          },
          {
            path: "memberPackage",
            model: "memberPackage",
          },
        ],
      })
      .populate({
        path: "room",
      })
      .populate({
        path: "branch",
      })
      .populate({
        path: "floor",
      });
    res.send(booking);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/all/v2", async (req, res) => {
  try {
    updateBookingStatus();
    const booking = await Booking.aggregate([
      {
        $lookup: {
          from: "branches",
          localField: "branch",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                branchCode: 1,
                branchName: 1,
              },
            },
          ],
          as: "branches",
        },
      },
      {
        $addFields: {
          branch: {
            $arrayElemAt: ["$branches", 0],
          },
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
          as: "floors",
        },
      },
      {
        $addFields: {
          floor: {
            $arrayElemAt: ["$floors", 0],
          },
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
          as: "rooms",
        },
      },
      {
        $addFields: {
          room: {
            $arrayElemAt: ["$rooms", 0],
          },
        },
      },
      {
        $lookup: {
          from: "memberbookings",
          localField: "members",
          foreignField: "_id",
          pipeline: [
            {
              $lookup: {
                from: "members",
                localField: "member",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      memberFullName: 1,
                      mobileNumber: 1,
                      profileImageUrl: 1,
                    },
                  },
                ],
                as: "member",
              },
            },
            {
              $addFields: {
                member: {
                  $arrayElemAt: ["$member", 0],
                },
              },
            },
            {
              $lookup: {
                from: "memberPackages",
                localField: "memberPackage",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      package: 1,
                    },
                  },
                  // {
                  //   $lookup: {
                  //     from: "packages",
                  //     localField: "memberPackages.package",
                  //     foreignField: "_id",
                  //     pipeline: [
                  //       {
                  //         $project: {
                  //           packageName: 1,
                  //           packageCode: 1,
                  //         },
                  //       },
                  //     ],
                  //     as: "package",
                  //   },
                  // },
                ],
                as: "memberPackage",
              },
            },
            {
              $project: {
                pax: 1,
                bookingstatus: 1,
                member: 1,
              },
            },
          ],
          as: "members",
        },
      },
      {
        $unwind: "$members",
      },
      {
        $project: {
          bookingNo: 1,
          branch: 1,
          floor: 1,
          room: 1,
          start: 1,
          end: 1,
          members: 1,
          bookingDate: 1,
        },
      },
    ]);

    res.send(booking);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/all/v3", async (req, res) => {
  try {
    updateBookingStatus();
    const booking = await MemberBooking.aggregate([
      {
        $lookup: {
          from: "branches",
          localField: "branch",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                branchCode: 1,
                branchName: 1,
              },
            },
          ],
          as: "branches",
        },
      },
      {
        $addFields: {
          branch: {
            $arrayElemAt: ["$branches", 0],
          },
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
          as: "floors",
        },
      },
      {
        $addFields: {
          floor: {
            $arrayElemAt: ["$floors", 0],
          },
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
          as: "rooms",
        },
      },
      {
        $addFields: {
          room: {
            $arrayElemAt: ["$rooms", 0],
          },
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "member",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                memberFullName: 1,
                mobileNumber: 1,
                profileImageUrl: 1,
              },
            },
          ],
          as: "members",
        },
      },
      {
        $addFields: {
          member: {
            $arrayElemAt: ["$members", 0],
          },
        },
      },
      {
        $lookup: {
          from: "memberpackages",
          localField: "memberPackage",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                package: 1,
              },
            },
            {
              $lookup: {
                from: "packages",
                localField: "package",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      packageName: 1,
                      packageCode: 1,
                    },
                  },
                ],
                as: "package",
              },
            },
            {
              $addFields: {
                package: {
                  $arrayElemAt: ["$package", 0],
                },
              },
            },
          ],
          as: "memberPackage",
        },
      },
      {
        $addFields: {
          memberPackage: {
            $arrayElemAt: ["$memberPackage", 0],
          },
        },
      },
      {
        $project: {
          bookingNo: 1,
          branch: 1,
          floor: 1,
          room: 1,
          start: 1,
          end: 1,
          member: 1,
          bookingDate: 1,
          memberPackage: 1,
          bookingstatus: 1,
          checkin_date: 1,
          pax: 1,
        },
      },
      {
        $sort: {
          bookingDate: -1,
        },
      },
    ]);

    res.send(booking);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/findAll", auth, async (req, res) => {
  try {
    const {
      memberName,
      mobileNumber,
      bookingNumber,
      branch,
      startDate,
      endDate,
      packageId,
      status,
    } = req.body;
    const filters = {};
    if (bookingNumber) filters.bookingNo = new RegExp(bookingNumber, "i");
    if (status) filters.bookingstatus = status;
    if (startDate || endDate) {
      filters.bookingDate = {};
      if (startDate)
        filters.bookingDate.$gte = new Date(
          new Date(startDate).setHours(0, 0, 0, 0)
        );
      if (endDate)
        filters.bookingDate.$lte = new Date(
          new Date(endDate).setHours(23, 59, 59, 999)
        );
    }
    if (branch) filters["branch.convertedId"] = branch;

    const memberFilters = {};
    if (memberName)
      memberFilters["member.memberFullName"] = new RegExp(memberName, "i");
    if (mobileNumber)
      memberFilters["member.mobileNumber"] = new RegExp(mobileNumber, "i");

    const packageFilters = {};
    if (packageId) packageFilters["memberPackage.package._id"] = packageId;

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

    const obj = await MemberBooking.aggregate([
      {
        $lookup: {
          from: "branches",
          localField: "branch",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                branchCode: 1,
                branchName: 1,
              },
            },
          ],
          as: "branches",
        },
      },
      {
        $addFields: {
          branch: {
            $arrayElemAt: ["$branches", 0],
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
          as: "floors",
        },
      },
      {
        $addFields: {
          floor: {
            $arrayElemAt: ["$floors", 0],
          },
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
          as: "rooms",
        },
      },
      {
        $addFields: {
          room: {
            $arrayElemAt: ["$rooms", 0],
          },
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "member",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                memberFullName: 1,
                mobileNumber: 1,
                profileImageUrl: 1,
              },
            },
          ],
          as: "members",
        },
      },
      {
        $addFields: {
          member: {
            $arrayElemAt: ["$members", 0],
          },
        },
      },
      {
        $lookup: {
          from: "memberpackages",
          localField: "memberPackage",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                package: 1,
              },
            },
            {
              $lookup: {
                from: "packages",
                localField: "package",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      packageName: 1,
                      packageCode: 1,
                    },
                  },
                ],
                as: "package",
              },
            },
            {
              $addFields: {
                package: {
                  $arrayElemAt: ["$package", 0],
                },
              },
            },
          ],
          as: "memberPackage",
        },
      },
      {
        $addFields: {
          memberPackage: {
            $arrayElemAt: ["$memberPackage", 0],
          },
        },
      },
      {
        $match: {
          ...filters,
          ...memberFilters,
          ...packageFilters,
        },
      },
      {
        $project: {
          bookingNo: 1,
          branch: 1,
          floor: 1,
          room: 1,
          start: 1,
          end: 1,
          member: 1,
          bookingDate: 1,
          memberPackage: 1,
          bookingstatus: 1,
          checkin_date: 1,
          bookingType: 1,
          pax: 1,
        },
      },
      {
        $sort: {
          bookingDate: -1,
        },
      },
    ]);
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/today/v3", async (req, res) => {
  try {
    let todayStart = new Date(new Date().setHours(0, 0, 0));
    let todayEnd = new Date(new Date().setHours(23, 59, 59, 999));
    const booking = await MemberBooking.aggregate([
      {
        $match: {
          start: {
            $gte: new Date(todayStart),
            $lte: new Date(todayEnd),
          },
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "branch",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                branchCode: 1,
                branchName: 1,
              },
            },
          ],
          as: "branches",
        },
      },
      {
        $addFields: {
          branch: {
            $arrayElemAt: ["$branches", 0],
          },
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
          as: "floors",
        },
      },
      {
        $addFields: {
          floor: {
            $arrayElemAt: ["$floors", 0],
          },
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
          as: "rooms",
        },
      },
      {
        $addFields: {
          room: {
            $arrayElemAt: ["$rooms", 0],
          },
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "member",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                memberFullName: 1,
                mobileNumber: 1,
                profileImageUrl: 1,
              },
            },
          ],
          as: "members",
        },
      },
      {
        $addFields: {
          member: {
            $arrayElemAt: ["$members", 0],
          },
        },
      },
      {
        $lookup: {
          from: "memberpackages",
          localField: "memberPackage",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                package: 1,
              },
            },
            {
              $lookup: {
                from: "packages",
                localField: "package",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      packageName: 1,
                      packageCode: 1,
                    },
                  },
                ],
                as: "package",
              },
            },
            {
              $addFields: {
                package: {
                  $arrayElemAt: ["$package", 0],
                },
              },
            },
          ],
          as: "memberPackage",
        },
      },
      {
        $addFields: {
          memberPackage: {
            $arrayElemAt: ["$memberPackage", 0],
          },
        },
      },
      {
        $project: {
          bookingNo: 1,
          branch: 1,
          floor: 1,
          room: 1,
          start: 1,
          end: 1,
          member: 1,
          bookingDate: 1,
          memberPackage: 1,
          bookingstatus: 1,
          checkin_date: 1,
          pax: 1,
        },
      },
      {
        $sort: {
          bookingDate: -1,
        },
      },
    ]);

    res.send(booking);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/today/findAll", auth, async (req, res) => {
  try {
    const {
      memberName,
      mobileNumber,
      bookingNumber,
      branch,
      startDate,
      endDate,
      packageId,
      status,
    } = req.body;
    let todayStart = new Date(new Date().setHours(0, 0, 0));
    let todayEnd = new Date(new Date().setHours(23, 59, 59, 999));
    const filters = {};
    if (bookingNumber) filters.bookingNo = new RegExp(bookingNumber, "i");
    if (status) filters.bookingstatus = status;
    if (startDate || endDate) {
      filters.bookingDate = {};
      if (startDate)
        filters.bookingDate.$gte = new Date(
          new Date(startDate).setHours(0, 0, 0, 0)
        );
      if (endDate)
        filters.bookingDate.$lte = new Date(
          new Date(endDate).setHours(23, 59, 59, 999)
        );
    }
    if (branch) filters["branch.convertedId"] = branch;

    const memberFilters = {};
    if (memberName)
      memberFilters["member.memberFullName"] = new RegExp(memberName, "i");
    if (mobileNumber)
      memberFilters["member.mobileNumber"] = new RegExp(mobileNumber, "i");

    const packageFilters = {};
    if (packageId) packageFilters["memberPackage.package._id"] = packageId;

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

    const obj = await MemberBooking.aggregate([
      {
        $match: {
          bookingDate: {
            $gte: new Date(todayStart),
            $lte: new Date(todayEnd),
          },
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "branch",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                branchCode: 1,
                branchName: 1,
              },
            },
          ],
          as: "branches",
        },
      },
      {
        $addFields: {
          branch: {
            $arrayElemAt: ["$branches", 0],
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
          as: "floors",
        },
      },
      {
        $addFields: {
          floor: {
            $arrayElemAt: ["$floors", 0],
          },
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
          as: "rooms",
        },
      },
      {
        $addFields: {
          room: {
            $arrayElemAt: ["$rooms", 0],
          },
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "member",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                memberFullName: 1,
                mobileNumber: 1,
                profileImageUrl: 1,
              },
            },
          ],
          as: "members",
        },
      },
      {
        $addFields: {
          member: {
            $arrayElemAt: ["$members", 0],
          },
        },
      },
      {
        $lookup: {
          from: "memberpackages",
          localField: "memberPackage",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                package: 1,
              },
            },
            {
              $lookup: {
                from: "packages",
                localField: "package",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      packageName: 1,
                      packageCode: 1,
                    },
                  },
                ],
                as: "package",
              },
            },
            {
              $addFields: {
                package: {
                  $arrayElemAt: ["$package", 0],
                },
              },
            },
          ],
          as: "memberPackage",
        },
      },
      {
        $addFields: {
          memberPackage: {
            $arrayElemAt: ["$memberPackage", 0],
          },
        },
      },
      {
        $match: {
          ...filters,
          ...memberFilters,
          ...packageFilters,
        },
      },
      {
        $project: {
          bookingNo: 1,
          branch: 1,
          floor: 1,
          room: 1,
          start: 1,
          end: 1,
          member: 1,
          bookingDate: 1,
          memberPackage: 1,
          bookingstatus: 1,
          checkin_date: 1,
          bookingType: 1,
          pax: 1,
        },
      },
      {
        $sort: {
          bookingDate: -1,
        },
      },
    ]);
    res.send(obj);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/get-booking-list", async (req, res) => {
  const { roomId, startDate, endDate } = req.query;
  try {
    // const ss = startDate + "T00:00:00.00Z";
    // const ee = endDate + "T23:59:59.00Z";
    let ss = new Date(new Date(startDate).setHours(0, 0, 0));
    let ee = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    // const booking = await Booking.find({
    //   room: roomId,
    //   start: { $gte: ss, $lte: ee },
    // })
    //   .populate("members")
    //   .populate("members.member");
    const booking = await Booking.aggregate([
      {
        $addFields: {
          color: "#e91e63",
        },
      },
      {
        $addFields: {
          convertedRoomId: {
            $toString: "$room",
          },
        },
      },
      {
        $match: {
          $and: [
            { convertedRoomId: { $eq: roomId } },
            {
              start: {
                $gte: ss, // ex: 2020-11-25T00:00:00.00Z
                $lte: ee, // ex: 2020-11-25T23:59:59.00Z
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "memberbookings",
          localField: "members",
          foreignField: "_id",
          pipeline: [
            {
              $lookup: {
                from: "members",
                localField: "member",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      memberFullName: 1,
                      mobileNumber: 1,
                      profileImageUrl: 1,
                    },
                  },
                ],
                as: "member",
              },
            },
            {
              $lookup: {
                from: "memberpackages",
                localField: "memberPackage",
                foreignField: "_id",
                pipeline: [
                  {
                    $lookup: {
                      from: "packages",
                      localField: "package",
                      foreignField: "_id",
                      pipeline: [
                        {
                          $project: {
                            packageName: 1,
                            packageCode: 1,
                          },
                        },
                      ],
                      as: "package",
                    },
                  },
                  {
                    $addFields: {
                      package: {
                        $arrayElemAt: ["$package", 0],
                      },
                    },
                  },
                  {
                    $project: {
                      package: 1,
                      purchaseDate: 1,
                      currentBalance: 1,
                    },
                  },
                ],
                as: "packages",
              },
            },
            {
              $project: {
                pax: 1,
                bookingstatus: 1,
                member: 1,
                packages: 1,
              },
            },
          ],
          as: "members",
        },
      },
      {
        $project: {
          bookingNo: 1,
          start: 1,
          end: 1,
          members: 1,
          bookingstatus: 1,
          pax: 1,
          color: 1,
          availableSlot: 1,
          title: 1,
        },
      },
    ]);
    res.json(booking);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/floor/get-booking-list", async (req, res) => {
  const { floorId, startDate, endDate } = req.query;
  try {
    // const ss = startDate + "T00:00:00.00Z";
    // const ee = endDate + "T23:59:59.00Z";
    let ss = new Date(new Date(startDate).setHours(0, 0, 0));
    let ee = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    // const booking = await Booking.find({
    //   room: roomId,
    //   start: { $gte: ss, $lte: ee },
    // })
    //   .populate("members")
    //   .populate("members.member");
    const booking = await Booking.aggregate([
      {
        $addFields: {
          color: "#e91e63",
        },
      },
      {
        $addFields: {
          convertedFloorId: {
            $toString: "$floor",
          },
        },
      },
      {
        $match: {
          $and: [
            { convertedFloorId: { $eq: floorId } },
            {
              start: {
                $gte: ss, // ex: 2020-11-25T00:00:00.00Z
                $lte: ee, // ex: 2020-11-25T23:59:59.00Z
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "memberbookings",
          localField: "members",
          foreignField: "_id",
          pipeline: [
            {
              $lookup: {
                from: "members",
                localField: "member",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      memberFullName: 1,
                      mobileNumber: 1,
                      profileImageUrl: 1,
                    },
                  },
                ],
                as: "memberData",
              },
            },
            {
              $addFields: {
                member: {
                  $arrayElemAt: ["$memberData", 0],
                },
              },
            },
            {
              $project: {
                pax: 1,
                bookingstatus: 1,
                member: 1,
                memberPackage: 1,
                malePax: 1,
                femalPax: 1,
                pax: 1,
                checkin_date: 1,
                checkout_date: 1,
              },
            },
          ],
          as: "members",
        },
      },
      // {
      //   $unwind: "$booking",
      // },
      {
        $addFields: {
          pax: { $sum: "$members.pax" }, // Replace pax with the total pax from members
        },
      },
      {
        $addFields: {
          resourceId: "$room",
        },
      },
      {
        $project: {
          branch: 1,
          floor: 1,
          room: 1,
          resourceId: 1,
          bookingNo: 1,
          start: 1,
          end: 1,
          members: 1,
          bookingstatus: 1,
          pax: 1,
          color: 1,
          availableSlot: 1,
          title: 1,
        },
      },
    ]);
    res.json(booking);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/get-events", async (req, res) => {
  const { roomId, startDate, endDate } = req.query;
  const ss = dayjs(startDate);
  const ee = dayjs(endDate);
  const range = getDaysBetween(ss, ee);
  range.map((dd) => {
    var timeSlots = getTimeSlotsForDay(dd);
    timeSlots.map(async (slot) => {
      var slotEnd = slot.add(60, "minute");
      const { maleCount: blockedMaleCount, femaleCount: blockedFemaleCount } =
        await checkBookingCount(roomId, slot, slotEnd);
    });
    var tt = blockedMaleCount + blockedFemaleCount;
    if (tt == 0) {
      // console.log("No booking found");
    } else {
      // console.log("booking found");
    }
  });
  res.status(500).send("error");
});

router.get("/get-booking", async (req, res) => {
  const { roomId, startDate, endDate } = req.query;
  try {
    const ss = dayjs(startDate);
    const ee = dayjs(endDate);
    const booking = await Booking.find({
      room: roomId,
      start: { $gte: ss, $lte: ee },
    });
    res.json(booking);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/instant-booking", auth, async (req, res) => {
  try {
    const { branch, floor, room, start, members, pax, package } = req.body;

    const bookingNo = await generateRunningNumber(branch);
    const end = dayjs(start).add(1, "hour").toISOString();

    // Create a new booking
    let existingBooking = await Booking.findOne({
      branch,
      floor,
      room,
      start,
      end,
    });
    if (existingBooking) {
      // Update existing booking
      existingBooking.pax = Number(existingBooking.pax) + Number(pax);
      existingBooking.title = `${existingBooking.pax} person booked`;
      await existingBooking.save();

      // Create a new member booking record linked to the existing booking
      const memberBooking = new MemberBooking({
        booking: existingBooking._id,
        branch,
        floor,
        room,
        start,
        end,
        bookingNo,
        member: members,
        pax,
        memberPackage: package,
        bookingType: "Instant",
      });

      await memberBooking.save();

      if (package) {
        const mpObj = await MemberPackage.findById(package);
        if (mpObj && mpObj.originalBalance !== 99999) {
          await MemberPackage.findByIdAndUpdate(
            package,
            { $inc: { currentBalance: -pax, used: pax } },
            { new: true }
          );
        } else {
          await MemberPackage.findByIdAndUpdate(
            package,
            { $inc: { used: pax } },
            { new: true }
          );
        }
      }

      // Associate the new member booking with the existing booking
      existingBooking.members.push(memberBooking);
      await existingBooking.save();

      await sendBookingConfirmNotification(memberBooking);

      res.json({
        message: "Instant booking updated successfully!",
        bookingId: existingBooking._id,
      });
    } else {
      // No existing booking, create a new one
      const booking = new Booking({
        branch,
        floor,
        room,
        start,
        end,
        pax,
        title: `${pax} person booked`,
        bookingType: "Instant",
      });

      await booking.save();

      const memberBooking = new MemberBooking({
        booking: booking._id,
        branch,
        floor,
        room,
        start,
        end,
        bookingNo,
        member: members,
        pax,
        memberPackage: package,
        bookingType: "Instant",
      });

      await memberBooking.save();

      if (package) {
        const mpObj = await MemberPackage.findById(package);
        if (mpObj && mpObj.originalBalance !== 99999) {
          await MemberPackage.findByIdAndUpdate(
            package,
            { $inc: { currentBalance: -pax, used: pax } },
            { new: true }
          );
        } else {
          await MemberPackage.findByIdAndUpdate(
            package,
            { $inc: { used: pax } },
            { new: true }
          );
        }
      }

      booking.members = memberBooking;
      await booking.save();

      await sendBookingConfirmNotification(memberBooking);

      res.json({
        message: "Instant booking successful!",
        bookingId: booking._id,
      });
    }
    // const booking = new Booking({
    //   branch: branch,
    //   floor: floor,
    //   room: room,
    //   start,
    //   end,
    //   pax,
    //   title: `${pax} person booked`,
    //   bookingType: "Instant",
    // });

    // await booking.save();

    // // Create member booking record
    // const memberBooking = new MemberBooking({
    //   booking: booking._id,
    //   branch: branch,
    //   floor: floor,
    //   room: room,
    //   start,
    //   end,
    //   bookingNo,
    //   member: members,
    //   pax,
    //   memberPackage: package,
    // });

    // await memberBooking.save();

    // if (package) {
    //   const mpObj = await MemberPackage.findById(package);
    //   if (mpObj && mpObj.originalBalance !== 99999) {
    //     console.log("pax", pax);
    //     await MemberPackage.findByIdAndUpdate(
    //       package,
    //       {
    //         $inc: { currentBalance: -pax, used: pax },
    //       },
    //       { new: true }
    //     );
    //   } else {
    //     await MemberPackage.findByIdAndUpdate(
    //       package,
    //       {
    //         $inc: { used: pax },
    //       },
    //       { new: true }
    //     );
    //   }
    // }

    // // Associate member booking with the booking
    // booking.members = memberBooking;
    // await booking.save();

    // // Send confirmation notification
    // await sendBookingConfirmNotification(memberBooking);

    // res.json({
    //   message: "Instant booking successful!",
    //   bookingId: booking._id,
    // });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/new-booking", auth, async (req, res) => {
  try {
    const {
      branchId,
      floorId,
      roomId,
      start,
      end,
      member,
      package,
      pax,
      // title,
      malecount,
      femalecount,
    } = req.body;

    // const memberDevices = await MemberDevice.find({ user: member });
    // const versions = memberDevices.map((dev) => {
    //   const parts = dev.version.split(".");
    //   return parseInt(parts[parts.length - 1], 10) || 0;
    // });

    // if (versions.length > 0 && versions.every((v) => v <= 8)) {
    //   const ll =
    //     "System deducted you are using older version of the app. Please update your app to the latest version before making booking. Sorry for any inconvenience caused(系统提示您使用的是旧版本APP，请更新APP后再进行预订，不便之处，敬请谅解)";
    //   return res.status(400).json({
    //     message: ll,
    //   });
    // }
    // const dateCheck = new Date("2025-06-10T00:00:00.000Z");
    // if (new Date(start) <= dateCheck) {
    //   return res.status(400).json({
    //     message:
    //       "Mobile Bookings cannot be made for dates on or before June 10th, 2025. Sorry for any inconvenience caused.",
    //   });
    // }

    if (true) {
      return res.status(400).json({
        message:
          "Currently Mobile Bookings has been disabled until further notice. Sorry for any inconvenience caused. (目前，移动预订功能已暂停服务，直至另行通知。不便之处，敬请谅解)",
      });
    }

    // Fetch the memberPackage and check validDate
    const memberPackage = await MemberPackage.findById(package);
    if (!memberPackage) {
      return res.status(404).json({ message: "Member package not found" });
    }

    if (memberPackage.validDate) {
      const validDate = new Date(memberPackage.validDate);
      if (new Date(start) > validDate || new Date(end) > validDate) {
        const vDate = convertDateMalaysiaTZ(validDate);
        const vTime = convertTimeMalaysiaTZ(validDate);
        return res.status(400).json({
          message: `The booking date exceeds the package validity. Valid until: ${vDate}, Time: ${vTime}`,
        });
      }
    }

    const bookingRoom = await Rooms.findOne({ _id: roomId });
    const bookingFloor = await Floor.findOne({ _id: floorId });
    const bookingBranch = await Branch.findOne({ _id: branchId });
    const { blockedMaleCount, blockedFemaleCount, bookingId } =
      await checkBookingCount(roomId, start, end);
    const total_booked_count = blockedMaleCount + blockedFemaleCount;
    if (total_booked_count >= bookingRoom.roomCapacity) {
      res.status(500).json({ message: "Fully Booked already" });
    } else {
      // res.status(500).json({ error: "Fully Booked already" });
      const total_persons = parseInt(malecount) + parseInt(femalecount);
      const overall_total = total_booked_count + total_persons;
      const bookingNo = await generateRunningNumber(branchId);
      if (total_booked_count == 0) {
        // new booking
        title = overall_total + " person booked";
        const availableSlot = bookingRoom.roomCapacity - overall_total;
        const booking = new Booking({
          branch: bookingBranch._id,
          floor: bookingFloor._id,
          room: bookingRoom._id,
          start,
          end,
          title,
          pax: overall_total,
          availableSlot,
        });
        await booking.save();
        const memberbooking = new MemberBooking({
          booking: booking._id,
          branch: bookingBranch._id,
          floor: bookingFloor._id,
          room: bookingRoom._id,
          start,
          end,
          bookingNo,
          member,
          memberPackage: package,
          pax: total_persons,
          malePax: malecount,
          femalPax: femalecount,
          bookingType: "Mobile",
        });
        await memberbooking.save();
        const mpObj = await MemberPackage.findById(package);
        if (mpObj.originalBalance === 99999) {
          booking.members = memberbooking;
          await booking.save();
          await sendBookingConfirmNotification(memberbooking);
          res.send("OK");
        } else {
          await MemberPackage.findByIdAndUpdate(package, {
            $inc: {
              currentBalance: total_persons * -1,
            },
          });
          booking.members = memberbooking;
          await booking.save();
          await sendBookingConfirmNotification(memberbooking);
          res.send("OK");
        }
      } else {
        // existing booking
        const total_persons = parseInt(malecount) + parseInt(femalecount);
        const overall_total = total_booked_count + total_persons;
        title = overall_total + " person booked";
        const availableSlot = bookingRoom.roomCapacity - overall_total;
        const memberbooking = new MemberBooking({
          booking: bookingId,
          branch: bookingBranch._id,
          floor: bookingFloor._id,
          room: bookingRoom._id,
          start,
          end,
          bookingNo,
          member,
          memberPackage: package,
          pax: total_persons,
          malePax: malecount,
          femalPax: femalecount,
          bookingType: "Mobile",
        });
        await memberbooking.save();
        const mpObj = await MemberPackage.findById(package);
        if (mpObj.originalBalance === 99999) {
          bookingId.members.push(memberbooking);
          bookingId.availableSlot = availableSlot;
          bookingId.pax = overall_total;
          bookingId.title = title;
          await bookingId.save();
          await sendBookingConfirmNotification(memberbooking);
          res.send("OK");
        } else {
          await MemberPackage.findByIdAndUpdate(package, {
            $inc: {
              currentBalance: total_persons * -1,
            },
          });
          bookingId.members.push(memberbooking);
          bookingId.availableSlot = availableSlot;
          bookingId.pax = overall_total;
          bookingId.title = title;
          await bookingId.save();
          await sendBookingConfirmNotification(memberbooking);
          res.send("OK");
        }
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/new-booking/web", auth, async (req, res) => {
  try {
    const {
      branchId,
      floorId,
      roomId,
      start,
      end,
      member,
      package,
      pax,
      // title,
      malecount,
      femalecount,
    } = req.body;
    // console.log(start);
    // Fetch the memberPackage and check validDate
    const memberPackage = await MemberPackage.findById(package);
    if (!memberPackage) {
      return res.status(404).json({ message: "Member package not found" });
    }

    if (memberPackage.validDate) {
      const validDate = new Date(memberPackage.validDate);
      if (new Date(start) > validDate || new Date(end) > validDate) {
        const vDate = convertDateMalaysiaTZ(validDate);
        const vTime = convertTimeMalaysiaTZ(validDate);
        return res.status(400).json({
          message: `The booking date exceeds the package validity. Valid until: ${vDate}, Time: ${vTime}`,
        });
      }
    }

    const bookingRoom = await Rooms.findOne({ _id: roomId });
    const bookingFloor = await Floor.findOne({ _id: floorId });
    const bookingBranch = await Branch.findOne({ _id: branchId });
    const { blockedMaleCount, blockedFemaleCount, bookingId } =
      await checkBookingCount(roomId, start, end);
    const total_booked_count = blockedMaleCount + blockedFemaleCount;
    if (total_booked_count >= bookingRoom.roomCapacity) {
      res.status(500).json({ message: "Fully Booked already" });
    } else {
      // res.status(500).json({ error: "Fully Booked already" });
      const total_persons = parseInt(malecount) + parseInt(femalecount);
      const overall_total = total_booked_count + total_persons;
      const bookingNo = await generateRunningNumber(branchId);
      if (total_booked_count == 0) {
        // new booking
        title = overall_total + " person booked";
        const availableSlot = bookingRoom.roomCapacity - overall_total;
        const booking = new Booking({
          branch: bookingBranch._id,
          floor: bookingFloor._id,
          room: bookingRoom._id,
          start,
          end,
          title,
          pax: overall_total,
          availableSlot,
        });
        await booking.save();
        const memberbooking = new MemberBooking({
          booking: booking._id,
          branch: bookingBranch._id,
          floor: bookingFloor._id,
          room: bookingRoom._id,
          start,
          end,
          bookingNo,
          member,
          memberPackage: package,
          pax: total_persons,
          malePax: malecount,
          femalPax: femalecount,
        });
        await memberbooking.save();
        const mpObj = await MemberPackage.findById(package);
        if (mpObj.originalBalance === 99999) {
          booking.members = memberbooking;
          await booking.save();
          await sendBookingConfirmNotification(memberbooking);
          res.send("OK");
        } else {
          await MemberPackage.findByIdAndUpdate(package, {
            $inc: {
              currentBalance: total_persons * -1,
            },
          });
          booking.members = memberbooking;
          await booking.save();
          await sendBookingConfirmNotification(memberbooking);
          res.send("OK");
        }
      } else {
        // existing booking
        const total_persons = parseInt(malecount) + parseInt(femalecount);
        const overall_total = total_booked_count + total_persons;
        title = overall_total + " person booked";
        const availableSlot = bookingRoom.roomCapacity - overall_total;
        const memberbooking = new MemberBooking({
          booking: bookingId,
          branch: bookingBranch._id,
          floor: bookingFloor._id,
          room: bookingRoom._id,
          start,
          end,
          bookingNo,
          member,
          memberPackage: package,
          pax: total_persons,
          malePax: malecount,
          femalPax: femalecount,
        });
        await memberbooking.save();
        const mpObj = await MemberPackage.findById(package);
        if (mpObj.originalBalance === 99999) {
          bookingId.members.push(memberbooking);
          bookingId.availableSlot = availableSlot;
          bookingId.pax = overall_total;
          bookingId.title = title;
          await bookingId.save();
          await sendBookingConfirmNotification(memberbooking);
          res.send("OK");
        } else {
          await MemberPackage.findByIdAndUpdate(package, {
            $inc: {
              currentBalance: total_persons * -1,
            },
          });
          bookingId.members.push(memberbooking);
          bookingId.availableSlot = availableSlot;
          bookingId.pax = overall_total;
          bookingId.title = title;
          await bookingId.save();
          await sendBookingConfirmNotification(memberbooking);
          res.send("OK");
        }
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/edit-booking/:id", auth, async (req, res) => {
  try {
    const { bookingId, roomSize, id, memberPackage, malePax, femalPax } =
      req.body;

    const total_persons = parseInt(malePax) + parseInt(femalPax);

    let memberBooking = await MemberBooking.findOne({ _id: id });
    if (!memberBooking) {
      return res.status(404).json({ message: "Member booking not found" });
    }

    let booking = await Booking.findOne({ _id: bookingId }).populate({
      path: "members",
    });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    let maleCount = 0;
    let femaleCount = 0;
    booking.members.forEach((member) => {
      // console.log("member", member);
      if (member._id.toString() === id) {
        if (member.bookingstatus === "Booked") {
          maleCount += parseInt(malePax);
          femaleCount += parseInt(femalPax);
        }
      } else {
        maleCount += member.malePax;
        femaleCount += member.femalPax;
      }
    });

    const totalBookedPax = maleCount + femaleCount;

    booking.pax = totalBookedPax;
    booking.title = totalBookedPax + " person booked";
    booking.availableSlot = roomSize - totalBookedPax;
    // edit booking for same package
    if (memberBooking.memberPackage == memberPackage) {
      const mpObj = await MemberPackage.findById(memberPackage);
      if (mpObj.originalBalance === 99999) {
        memberBooking.malePax = malePax;
        memberBooking.femalPax = femalPax;
        memberBooking.pax = total_persons;
        await memberBooking.save();
        await booking.save();

        res.json({ message: "Booking updated successfully" });
      } else {
        // Update the member package balance
        var previous_balance = mpObj.currentBalance + memberBooking.pax;
        var new_balance = previous_balance - total_persons;
        await MemberPackage.findByIdAndUpdate(memberPackage, {
          currentBalance: new_balance,
        });
        memberBooking.malePax = malePax;
        memberBooking.femalPax = femalPax;
        memberBooking.pax = total_persons;
        await memberBooking.save();
        await booking.save();

        res.json({ message: "Booking updated successfully" });
      }
    } else {
      // edit booking for new package
      /// step-1 ( reset previous booking package balance)
      const previous_mpObj = await MemberPackage.findById(
        memberBooking.memberPackage
      );
      if (previous_mpObj.originalBalance != 99999) {
        var previous_balance =
          previous_mpObj.currentBalance + memberBooking.pax;
        await MemberPackage.findByIdAndUpdate(memberBooking.memberPackage, {
          currentBalance: previous_balance,
        });
      }
      /// step-2 ( Update the selected member package balance)
      const mpObj = await MemberPackage.findById(memberPackage);
      if (mpObj.originalBalance === 99999) {
        memberBooking.memberPackage = memberPackage;
        memberBooking.malePax = malePax;
        memberBooking.femalPax = femalPax;
        memberBooking.pax = total_persons;
        await memberBooking.save();
        await booking.save();
        res.json({ message: "Booking updated successfully" });
      } else {
        // Update the member package balance
        if (mpObj.currentBalance > 0) {
          await MemberPackage.findByIdAndUpdate(memberPackage, {
            $inc: { currentBalance: total_persons * -1 },
          });
        }
        memberBooking.memberPackage = memberPackage;
        memberBooking.malePax = malePax;
        memberBooking.femalPax = femalPax;
        memberBooking.pax = total_persons;
        await memberBooking.save();
        await booking.save();
        res.json({ message: "Booking updated successfully" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/reschedule/:id", auth, async (req, res) => {
  try {
    const memberBookingId = req.params.id;
    const { branchId, floorId, roomId, start, end } = req.body;

    // Find the specific member booking by ID
    const memberBooking = await MemberBooking.findById(memberBookingId);
    if (!memberBooking) {
      return res.status(404).json({ message: "Member booking not found" });
    }

    const oldStart = memberBooking.start;
    const oldEnd = memberBooking.end;

    memberBooking.start = start;
    memberBooking.end = end;
    await memberBooking.save();

    const bookingRoom = await Rooms.findOne({ _id: roomId });
    const bookingFloor = await Floor.findOne({ _id: floorId });
    const bookingBranch = await Branch.findOne({ _id: branchId });
    const booking = await Booking.findOne({
      branch: bookingBranch._id,
      room: bookingRoom._id,
      floor: bookingFloor._id,
      start: start,
      end: end,
    });
    const { blockedMaleCount, blockedFemaleCount, bookingId } =
      await checkBookingCount(roomId, start, end);
    const total_booked_count = blockedMaleCount + blockedFemaleCount;

    if (booking) {
      const overall_total = total_booked_count + memberBooking.pax;
      title = overall_total + " person booked";
      const availableSlot = bookingRoom.roomCapacity - overall_total;
      bookingId.pax = overall_total;
      bookingId.availableSlot = availableSlot;
      bookingId.title = title;
      bookingId.members.push(memberBookingId);
      await bookingId.save();
    } else {
      // console.log("here");
      const newBooking = new Booking({
        branch: memberBooking.branch,
        floor: memberBooking.floor,
        room: memberBooking.room,
        start,
        end,
        title: `${memberBooking.pax} person booked`,
        pax: memberBooking.pax,
        availableSlot:
          bookingRoom.roomCapacity - (total_booked_count + memberBooking.pax),
        members: [memberBooking._id],
      });
      await newBooking.save();
    }

    const removeBooking = await Booking.findOne({
      branch: bookingBranch._id,
      room: bookingRoom._id,
      floor: bookingFloor._id,
      start: oldStart,
      end: oldEnd,
    });

    if (removeBooking) {
      await Booking.updateMany(
        {
          branch: bookingBranch._id,
          room: bookingRoom._id,
          floor: bookingFloor._id,
          start: oldStart,
          end: oldEnd,
        },
        {
          $pull: { members: memberBookingId },
          $inc: {
            pax: total_booked_count - memberBooking.pax,
            availableSlot: total_booked_count + memberBooking.pax,
          },
          $set: {
            title: `${removeBooking.pax - memberBooking.pax} person booked`,
          },
        }
      );
    }

    res
      .status(200)
      .json({ message: "Member booking and booking updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/webcheckin", auth, async (req, res) => {
  try {
    const { id } = req.body;
    const bookobj = await MemberBooking.findById(id);
    if (bookobj != null) {
      const mpobj = await MemberPackage.findById(bookobj.memberPackage._id);
      if (mpobj && mpobj.package) {
        const pacakgeObj = await Package.findById(mpobj.package._id);
        if (
          pacakgeObj &&
          pacakgeObj.packageValidity === "1 Year" &&
          // pacakgeObj.packageUnlimitedStatus == true && // need check with user on this
          mpobj.used == 0
        ) {
          const valid = await calculateValidDate(mpobj);
          await MemberBooking.findByIdAndUpdate(
            id,
            {
              bookingstatus: "CheckedIn",
              checkin_date: Date.now(),
            },
            { new: false }
          );
          await MemberPackage.findByIdAndUpdate(bookobj.memberPackage._id, {
            $inc: {
              used: bookobj.pax,
            },
            validDate: valid,
            firstUsedDate: Date.now(),
            firstUsedBranch: bookobj.branch,
            lastUsedDate: Date.now(),
            lastUsedBranch: bookobj.branch,
          });
        } else {
          if (mpobj.used == 0) {
            await MemberBooking.findByIdAndUpdate(
              id,
              {
                bookingstatus: "CheckedIn",
                checkin_date: Date.now(),
              },
              { new: false }
            );
            await MemberPackage.findByIdAndUpdate(bookobj.memberPackage._id, {
              $inc: {
                used: bookobj.pax,
              },
              firstUsedDate: Date.now(),
              firstUsedBranch: bookobj.branch,
              lastUsedDate: Date.now(),
              lastUsedBranch: bookobj.branch,
            });
          } else {
            await MemberBooking.findByIdAndUpdate(
              id,
              {
                bookingstatus: "CheckedIn",
                checkin_date: Date.now(),
              },
              { new: false }
            );
            await MemberPackage.findByIdAndUpdate(bookobj.memberPackage._id, {
              $inc: {
                used: bookobj.pax,
              },
              lastUsedDate: Date.now(),
              lastUsedBranch: bookobj.branch,
            });
          }
        }
      }
      // const obj = await MemberBooking.findByIdAndUpdate(
      //   id,
      //   {
      //     bookingstatus: "CheckedIn",
      //     checkin_date: Date.now(),
      //   },
      //   { new: false }
      // );
      // await MemberPackage.findByIdAndUpdate(bookobj.memberPackage._id, {
      //   $inc: {
      //     used: bookobj.pax,
      //   },
      // });
      await Members.findByIdAndUpdate(
        { _id: bookobj.member },
        { lastCheckinDate: Date.now() }
      );
      // await Members.update(
      //   { _id: bookobj.member },
      //   { $set: { lastCheckinDate: Date.now() } }
      // );
      res.status(200).json({
        status: "ok",
        data: [bookobj],
        message: "Check In Accepted",
      });
    } else {
      res.status(200).json({
        status: "Failed",
        data: [],
        message: "Booking Deails Not Avaliable",
      });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/memberbased/detail/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await MemberBooking.findById(id)
      .populate({
        path: "memberPackage",
        select: "package _id",
        populate: {
          path: "package",
          select: "packageName packageCode _id",
        },
      })
      .populate({
        path: "member",
        select: "memberFullName mobileNumber _id",
      })
      .populate({
        path: "room",
        select: "room_no room_gender _id",
      })
      .populate({
        path: "memberPackage",
        select: "package _id",
        populate: {
          path: "package",
          select: "packageName packageCode _id",
        },
      })
      .populate({
        path: "branch",
        select: "branchName branchContactNumber _id",
      })
      .populate({
        path: "floor",
        select: "floorNo _id",
      })
      .populate({
        path: "booking",
        strictPopulate: false,
        select: "availableSlot _id",
      });
    res.send(obj);
  } catch (error) {
    // console.log(error);
    res.status(500).send({ message: error.message });
  }
});

router.post("/mobile/checkin", auth, async (req, res) => {
  try {
    const { id } = req.body;
    const bookobj = await MemberBooking.findById(id);
    if (bookobj != null) {
      const mpobj = await MemberPackage.findById(bookobj.memberPackage._id);
      if (mpobj && mpobj.package) {
        const pacakgeObj = await Package.findById(mpobj.package._id);
        if (
          pacakgeObj &&
          pacakgeObj.packageValidity === "1 Year" &&
          // pacakgeObj.packageUnlimitedStatus == true && // need check with user on this
          mpobj.used == 0
        ) {
          const valid = await calculateValidDate(mpobj);
          await MemberBooking.findByIdAndUpdate(
            id,
            {
              bookingstatus: "CheckedIn",
              checkin_date: Date.now(),
            },
            { new: false }
          );
          await MemberPackage.findByIdAndUpdate(bookobj.memberPackage._id, {
            $inc: {
              used: bookobj.pax,
            },
            validDate: valid,
            firstUsedDate: Date.now(),
            firstUsedBranch: bookobj.branch,
            lastUsedDate: Date.now(),
            lastUsedBranch: bookobj.branch,
          });
        } else {
          if (mpobj.used == 0) {
            await MemberBooking.findByIdAndUpdate(
              id,
              {
                bookingstatus: "CheckedIn",
                checkin_date: Date.now(),
              },
              { new: false }
            );
            await MemberPackage.findByIdAndUpdate(bookobj.memberPackage._id, {
              $inc: {
                used: bookobj.pax,
              },
              firstUsedDate: Date.now(),
              firstUsedBranch: bookobj.branch,
              lastUsedDate: Date.now(),
              lastUsedBranch: bookobj.branch,
            });
          } else {
            await MemberBooking.findByIdAndUpdate(
              id,
              {
                bookingstatus: "CheckedIn",
                checkin_date: Date.now(),
              },
              { new: false }
            );
            await MemberPackage.findByIdAndUpdate(bookobj.memberPackage._id, {
              $inc: {
                used: bookobj.pax,
              },
              lastUsedDate: Date.now(),
              lastUsedBranch: bookobj.branch,
            });
          }
        }
      }
      // const obj = await MemberBooking.findByIdAndUpdate(
      //   id,
      //   {
      //     bookingstatus: "CheckedIn",
      //     checkin_date: Date.now(),
      //   },
      //   { new: false }
      // );
      // await MemberPackage.findByIdAndUpdate(bookobj.memberPackage._id, {
      //   $inc: {
      //     used: bookobj.pax,
      //   },
      // });
      await Members.findByIdAndUpdate(
        { _id: bookobj.member },
        { lastCheckinDate: Date.now() }
      );
      // await Members.update(
      //   { _id: bookobj.member },
      //   { $set: { lastCheckinDate: Date.now() } }
      // );
      res.status(200).json({
        status: "ok",
        data: [bookobj],
        message: "Check In Accepted",
      });
    } else {
      res.status(200).json({
        status: "Failed",
        data: [],
        message: "Booking Details Not Available",
      });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/manual-checkout", auth, async (req, res) => {
  try {
    const { id } = req.body;
    const bookobj = await MemberBooking.findById(id);
    if (bookobj != null) {
      const obj = await MemberBooking.findByIdAndUpdate(
        id,
        {
          bookingstatus: "Complete",
          checkout_date: Date.now(),
        },
        { new: false }
      );
      res.status(200).json({
        status: "ok",
        data: [obj],
        message: "Check Out Accepted",
      });
    } else {
      res.status(200).json({
        status: "Failed",
        data: [],
        message: "Booking Deails Not Avaliable",
      });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/booking-completion", auth, async (req, res) => {
  try {
    const { branchId, floorId } = req.body;

    if (!branchId || !floorId) {
      return res.status(400).json({
        status: "Failed",
        message: "branchId and floorId are required",
      });
    }

    const currentDateTime = new Date();
    const currentHour = currentDateTime.getHours();

    const startTime = new Date(currentDateTime);
    // startTime.setHours(currentHour - 1, 0, 0, 0);
    startTime.setHours(0, 0, 0, 0);

    const endTime = new Date(currentDateTime);
    endTime.setHours(currentHour, 0, 0, 0);

    const bookingsToUpdate = await MemberBooking.find({
      bookingstatus: "CheckedIn",
      start: { $gte: startTime },
      end: { $lte: endTime },
    });

    // console.log("Bookings to Update:", bookingsToUpdate);

    if (bookingsToUpdate.length === 0) {
      return res.status(200).json({
        status: "ok",
        message: "No bookings to update",
        updatedCount: 0,
      });
    }

    const updatedBookings = await MemberBooking.updateMany(
      {
        _id: { $in: bookingsToUpdate.map((booking) => booking._id) },
      },
      {
        $set: { bookingstatus: "Complete" },
      }
    );

    res.status(200).json({
      status: "ok",
      message: "Bookings updated successfully",
      updatedCount: updatedBookings.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "An error occurred during booking completion",
      message: error.message,
    });
  }
});

router.post("/cancel-booking", auth, async (req, res) => {
  try {
    const { id, slotId } = req.body;
    const memberBookobj = await MemberBooking.findById(id);
    const bookobj = await Booking.findById(slotId);
    if (bookobj != null && memberBookobj != null) {
      const obj = await MemberBooking.findByIdAndUpdate(
        id,
        {
          bookingstatus: "Cancel",
        },
        { new: false }
      );
      await MemberPackage.findByIdAndUpdate(memberBookobj.memberPackage._id, {
        $inc: {
          currentBalance: memberBookobj.pax,
        },
      });
      let newbalance = bookobj.availableSlot + memberBookobj.pax;
      let newpax = bookobj.pax - memberBookobj.pax;
      let newTitle = newpax + " person booked";
      await Booking.findByIdAndUpdate(
        slotId,
        {
          availableSlot: newbalance,
          pax: newpax,
          title: newTitle,
        },
        { new: false }
      );
      await sendBookingCancelNotification(memberBookobj);
      res.status(200).json({
        status: "ok",
        data: obj,
        message: "Cancel successfully",
      });
    } else {
      res.status(200).json({
        status: "Failed",
        data: [],
        message: "Booking Deails Not Avaliable",
      });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/slot/add-member", auth, async (req, res) => {
  try {
    const { bookingId, memberId, packageId } = req.body;
    const booking = await Booking.find({
      _id: bookingId,
    });

    const bookingRoom = await Rooms.findOne({ _id: room._id });
    const { maleCount: blockedMaleCount, femaleCount: blockedFemaleCount } =
      await checkBookingCount(room, start, end);
    total_count = maleCount + femaleCount;
    if (total_count >= bookingRoom.roomCapacity) {
      res.status(500).json({ message: "Fully Booked already" });
    } else {
      total_persons = total_count + pax;
      title = total_persons + "person booked";
      const booking = new Booking({
        branch,
        floor,
        room,
        start,
        end,
        member,
        package,
        title,
        package,
        pax,
        malecount,
        femalecount,
        transaction_no,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const {
      member,
      package,
      branch,
      floor,
      room,
      start,
      end,
      title,
      package_name,
      room_no,
      checkin_date,
      pax,
      malecount,
      femalecount,
    } = req.body;
    // console.log("malecount" + malecount);
    // console.log("femalecount" + femalecount);

    const validationErrors = [];
    if (!member) validationErrors.push("Member is required");
    if (!package) validationErrors.push("Package is required");
    if (!branch) validationErrors.push("Branch is required");
    if (!floor) validationErrors.push("Floor is required");
    if (!room) validationErrors.push("Room is required");
    if (!start) validationErrors.push("start date is required");
    if (!end) validationErrors.push("End date is required");

    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: "Failed",
        data: [],
        message: validationErrors.join(", "),
      });
    }
    const checkRoomBasedOnFloor = await Rooms.findOne({
      _id: room._id,
      floor: floor._id,
    });
    if (
      !checkRoomBasedOnFloor ||
      checkRoomBasedOnFloor.floor.toString() !== floor._id.toString()
    ) {
      return res.status(400).json({
        status: "Failed",
        data: [],
        message: "Floor does not match with this Room",
      });
    }
    const checkFloorBasedOnBranch = await Floor.findOne({
      _id: floor._id,
      branch: branch._id,
    });
    if (!checkFloorBasedOnBranch) {
      return res.status(400).json({
        status: "Failed",
        data: [],
        message: "Branch does not match with this Floor",
      });
    }

    const { maleCount: blockedMaleCount, femaleCount: blockedFemaleCount } =
      await checkBookingCount(room._id, start, end);

    let ava_maleCount = 0;
    let ava_femaleCount = 0;
    let ava_bothCount = 0;

    if (checkRoomBasedOnFloor) {
      if (checkRoomBasedOnFloor.room_gender === "Male") {
        ava_maleCount = checkRoomBasedOnFloor.noof_persons;
      } else if (checkRoomBasedOnFloor.room_gender === "Female") {
        ava_femaleCount = checkRoomBasedOnFloor.noof_persons;
      } else if (checkRoomBasedOnFloor.room_gender === "Both") {
        ava_bothCount = checkRoomBasedOnFloor.noof_persons;
      }
    }
    if (ava_bothCount > 0) {
      total = ava_bothCount - blockedMaleCount - blockedFemaleCount;
      // console.log("total");
      // console.log(total);
      // console.log(malecount + femalecount);
      if (total < malecount + femalecount) {
        return res.status(400).json({
          status: "Failed",
          data: [],
          message: `Female count should be less than ${total} (OR) Male count should be less than ${total}`,
        });
      }
    } else if (ava_maleCount > 0) {
      total = ava_maleCount - blockedMaleCount;
      if ((malecount || malecount === 0) && total < malecount) {
        return res.status(400).json({
          status: "Failed",
          data: [],
          message: `Male count should be less than ${total}`,
        });
      }
    } else if (ava_femaleCount > 0) {
      total = ava_femaleCount - blockedFemaleCount;
      if ((femalecount || femalecount === 0) && total < femalecount) {
        return res.status(400).json({
          status: "Failed",
          data: [],
          message: `Female count should be less than ${total}`,
        });
      }
    }
    const branchobj = await Branch.findById(branch._id);
    if (!branchobj) {
      return res.status(400).json({
        status: "Failed",
        data: [],
        message: "Branch not found",
      });
    }
    const transaction_no = await generateRunningNumber(branchobj);

    const booking = new Booking({
      member,
      package,
      branch,
      floor,
      room,
      start,
      end,
      title,
      package_name,
      room_no,
      checkin_date,
      pax,
      malecount,
      femalecount,
      transaction_no,
    });
    const obj = await booking.save();
    res.send(obj);
  } catch (error) {
    // console.log(error);
    res.status(500).send({ message: error.message });
  }
});

const generateRunningNumber = async (branchId) => {
  const branch = await Branch.findById(branchId);
  const branchCode = branch.branchCode;
  const letter = "B";
  const date = new Date();
  const yyyyMMdd = `${date.getFullYear()}${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;
  const latestBooking = await MemberBooking.findOne({
    branch: branchId,
    bookingNo: new RegExp(`^${branchCode}-${letter}-${yyyyMMdd}`),
  }).sort({ bookingNo: -1 });
  let sequence = "0001";
  if (latestBooking) {
    const lastSequence = parseInt(
      latestBooking.bookingNo.split(`${yyyyMMdd}`)[1]
    );
    sequence = (lastSequence + 1).toString().padStart(4, "0");
  }
  const runningno = `${branchCode}-${letter}-${yyyyMMdd}${sequence}`;
  return runningno;
};

router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await Booking.findById(id)
      .populate({
        path: "member",
        select: "member_name mobileNumber gender _id",
      })
      .populate("room")
      .populate("branch")
      .populate("floor")
      .populate({
        path: "package",
        populate: [
          { path: "packageid", model: "items" }, // Populate packageid
          { path: "branch", model: "branch" }, // Populate branch
        ],
      });
    res.send(obj);
  } catch (error) {
    // console.log(error);
    res.status(500).send({ message: error.message });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      member,
      package,
      branch,
      floor,
      room,
      start,
      end,
      title,
      package_name,
      room_no,
      bookingstatus,
      checkin_date,
      pax,
      malecount,
      femalecount,
    } = req.body;
    const obj = await Booking.findByIdAndUpdate(
      id,
      {
        member,
        package,
        branch,
        floor,
        room,
        start,
        end,
        title,
        package_name,
        room_no,
        bookingstatus,
        checkin_date,
        pax,
        malecount,
        femalecount,
      },
      { new: false }
    );
    res.send(obj);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/cancel", auth, async (req, res) => {
  try {
    const { id } = req.body;
    bookingstatus = "Cancel";
    const obj = await Booking.findByIdAndUpdate(
      id,
      { bookingstatus },
      { new: false }
    );
    res.status(200).json({
      status: "ok",
      data: obj,
      message: "Cancel successfully",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/bookingBasedonBranch", auth, async (req, res) => {
  try {
    updateBookingStatus();
    const { id } = req.body;
    const booking = await Booking.find({
      $and: [{ bookingstatus: { $eq: "Booked" } }, { branch: { $eq: id } }],
    })
      .populate({
        path: "member",
      })
      .populate({
        path: "room",
      })
      .populate({
        path: "branch",
      })
      .populate({
        path: "floor",
      });
    res.send(booking);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    updateBookingStatus();
    const booking = await Booking.find({
      $and: [{ bookingstatus: { $eq: "Booked" } }],
    })
      .populate({
        path: "member",
      })
      .populate({
        path: "room",
      })
      .populate({
        path: "branch",
      })
      .populate({
        path: "floor",
      });
    res.send(booking);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/findall", auth, async (req, res) => {
  try {
    updateBookingStatus();
    const { id, first, rows, filters, sortField, sortOrder, users } = req.body;
    let filterQuery = [];
    if (filters) {
      Object.keys(filters).forEach(async (e) => {
        if (filters[e].value && filters[e].value && e === "start") {
          const dateStr = filters[e].value;
          const dt = formatDate(dateStr);
          const isValidDate = moment(dt, "YYYY-MM-DD", true).isValid();
          if (isValidDate) {
            const startDate = moment(dt).startOf("day").toDate();
            const endDate = moment(dt).endOf("day").toDate();
            filterQuery.push({ start: { $gte: startDate, $lte: endDate } });
          }
        } else if (
          filters[e].value &&
          filters[e].value &&
          e === "checkin_date"
        ) {
          const dateStr = filters[e].value;
          const dt = formatDate(dateStr);
          const isValidDate = moment(dt, "YYYY-MM-DD", true).isValid();
          if (isValidDate) {
            const startDate = moment(dt).startOf("day").toDate();
            const endDate = moment(dt).endOf("day").toDate();
            filterQuery.push({
              checkin_date: { $gte: startDate, $lte: endDate },
            });
          }
        } else if (
          filters[e].value &&
          filters[e].value &&
          e === "package_name"
        ) {
          filterQuery.push({
            package_name: { $regex: ".*" + filters[e].value + ".*" },
          });
        } else if (
          filters[e].value &&
          filters[e].value &&
          e === "bookingstatus"
        ) {
          filterQuery.push({
            bookingstatus: { $regex: ".*" + filters[e].value + ".*" },
          });
        } else if (
          filters[e].value &&
          filters[e].value &&
          e === "transaction_no"
        ) {
          filterQuery.push({
            transaction_no: { $regex: ".*" + filters[e].value + ".*" },
          });
        } else if (
          filters[e].value &&
          filters[e].value &&
          e === "purchasetype"
        ) {
          filterQuery.push({
            purchasetype: { $regex: ".*" + filters[e].value + ".*" },
          });
        }
      });
    }

    if (id) {
      filterQuery.push({ member: { $eq: id } });
    }
    if (filters && filters.member_name && filters.member_name.value) {
      const branchList = await Members.find({
        member_name: {
          $regex: ".*" + filters.member_name.value + ".*",
          $options: "i",
        },
      }).select("_id");
      filterQuery.push({ member: { $in: branchList } });
    }
    if (filters && filters.Mobile && filters.Mobile.value) {
      const branchList = await Members.find({
        mobileNumber: {
          $regex: ".*" + filters.Mobile.value + ".*",
          $options: "i",
        },
      }).select("_id");
      filterQuery.push({ member: { $in: branchList } });
    }
    if (filters && filters.branch && filters.branch.value) {
      const branchList = await Branch.find({
        branch_name: {
          $regex: ".*" + filters.branch.value + ".*",
          $options: "i",
        },
      }).select("_id");
      filterQuery.push({ branch: { $in: branchList } });
    }
    if (filters && filters.floor && filters.floor.value) {
      const branchList = await Floor.find({
        floor_no: { $regex: ".*" + filters.floor.value + ".*", $options: "i" },
      }).select("_id");
      filterQuery.push({ floor: { $in: branchList } });
    }

    // if (filters && filters.package_code && filters.package_code.value) {
    //     const branchList = await Package.find({ package_code: { $regex: ".*" + filters.package_code.value + ".*", $options: 'i' } }).select('_id');
    //     if (branchList.length > 0) {
    //         filterQuery.push({ 'package.packageid._id': { $in: branchList.map(pkg => pkg._id) } });
    //     }
    // }

    let query = filterQuery.length > 0 ? { $and: filterQuery } : {};
    let sortQuery = {};
    if (sortField) {
      if (sortField === "member_name") {
        sortQuery["member"] = sortOrder === 1 ? "asc" : "desc";
      } else {
        sortQuery[sortField] = sortOrder === 1 ? "asc" : "desc";
      }
    }

    if (users && users !== "admin") {
      const roles = await getRolesByUser(users);
      if (roles && !roles.all_branch) {
        const branches = roles.branch
          ? roles.branch.map((branch) => branch._id)
          : [];
        query = {
          ...query,
          branch: { $in: branches },
        };
      }
    }
    const data = await Booking.find(query)
      .populate({ path: "member" })
      .populate({ path: "room" })
      .populate({ path: "branch" })
      .populate({ path: "floor" })
      .populate({
        path: "package",
        populate: [{ path: "packageid", model: "items" }],
      })
      .sort(sortQuery)
      .skip(first)
      .limit(rows);

    const totalRecords = await Booking.countDocuments(query);
    res.send({ data, totalRecords });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

router.post("/findbydate/:id", auth, async (req, res) => {
  try {
    updateBookingStatus();
    const { id } = req.params;
    const { date } = req.body;
    const startdt = new Date(new Date(date).setHours(0, 0, 0, 0));
    const enddt = new Date(new Date(date).setHours(23, 59, 59, 999));
    const obj = await Booking.find({
      $and: [
        { member: { $eq: id } },
        { bookingstatus: { $eq: "Booked" } },
        { start: { $gte: startdt, $lt: enddt } },
      ],
    })
      .populate({
        path: "member",
      })
      .populate({
        path: "room",
      })
      .populate({
        path: "branch",
      })
      .populate({
        path: "floor",
      });
    res.status(200).json({
      status: "ok",
      data: [obj],
      message: "Booking Data",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

function formatDate(dateStr) {
  // Convert from 'DD/MM/YYYY' to 'YYYY-MM-DD'
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}

router.post("/memberbased", auth, async (req, res) => {
  try {
    updateBookingStatus();
    const { first, rows, member, bookingstatus } = req.body;
    const obj = {
      data: await Booking.find({
        $and: [
          { member: { $eq: member } },
          { bookingstatus: { $eq: bookingstatus } },
        ],
      })
        .populate({
          path: "member",
        })
        .populate({
          path: "room",
        })
        .populate({
          path: "package",
        })
        .populate({
          path: "branch",
        })
        .populate({
          path: "floor",
        })
        .limit(rows)
        .skip(first),
      totalRecords: await Booking.find({
        $and: [
          { member: { $eq: member } },
          { bookingstatus: { $eq: bookingstatus } },
        ],
      }).countDocuments(),
    };
    // console.log(req.body, obj);
    res.send(obj);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/memberbased/all/:member", auth, async (req, res) => {
  try {
    const { member } = req.params;
    const obj = {
      data: await MemberBooking.find({
        $and: [{ member: { $eq: member } }],
      })
        .sort({
          start: -1,
        })
        .populate({
          path: "member",
          select: "memberFullName mobileNumber _id",
        })
        .populate({
          path: "room",
          select: "room_no room_gender _id",
        })
        .populate({
          path: "memberPackage",
          select: "package _id",
          populate: {
            path: "package",
            select: "packageName packageCode _id",
          },
        })
        .populate({
          path: "branch",
          select: "branchName branchContactNumber _id",
        })
        .populate({
          path: "floor",
          select: "floorNo _id",
        })
        .populate({
          path: "booking",
          strictPopulate: false,
          select: "availableSlot _id",
        }),
      totalRecords: await MemberBooking.find({
        $and: [{ member: { $eq: member } }],
      }).countDocuments(),
    };
    res.send(obj);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/memberbased/upcoming/:member", async (req, res) => {
  try {
    const { member } = req.params;
    const startdt = new Date(new Date().setHours(0, 0, 0, 0));
    let enddt = new Date(new Date().setHours(0, 0, 0, 0));
    enddt = new Date(
      new Date(enddt.setDate(startdt.getDate() + 14)).setHours(23, 59, 59, 999)
    );
    const obj = {
      data: await MemberBooking.find({
        $and: [
          { member: { $eq: member } },
          { start: { $gte: startdt, $lt: enddt } },
          { bookingstatus: { $eq: "Booked" } },
        ],
      })
        .sort({
          start: 1,
        })
        .populate({
          path: "member",
          select: "memberFullName mobileNumber _id",
        })
        .populate({
          path: "room",
          select: "room_no room_gender _id",
        })
        .populate({
          path: "memberPackage",
          select: "package _id",
          populate: {
            path: "package",
            select: "packageName packageCode _id",
          },
        })
        .populate({
          path: "branch",
          select: "branchName branchContactNumber _id",
        })
        .populate({
          path: "floor",
          select: "floorNo _id",
        })
        .populate({
          path: "booking",
          strictPopulate: false,
          select: "availableSlot _id",
        }),
      totalRecords: await MemberBooking.find({
        $and: [
          { member: { $eq: member } },
          { start: { $gte: startdt, $lt: enddt } },
        ],
      }).countDocuments(),
    };
    res.send(obj);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// ***** commented because we can use MemberBooking model to get the same data. ****
// router.post("/memberbased/all", async (req, res) => {
//   try {
//     const { member } = req.body;
//     const obj = {
//       data: await Booking.find({ members: { $in: [member] } })
//         .populate({
//           path: "members",
//         })
//         .populate({
//           path: "room",
//         })
//         .populate({
//           path: "branch",
//         })
//         .populate({
//           path: "floor",
//         }),
//       totalRecords: await Booking.find({
//         members: { $in: [member] },
//       }).countDocuments(),
//     };
//     res.send(obj);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

router.post("/member/checkin/list", auth, async (req, res) => {
  try {
    const { branchId, memberId } = req.body;
    const startdt = new Date(new Date().setHours(0, 0, 0, 0));
    let enddt = new Date(new Date().setHours(23, 59, 59, 999));
    const obj = {
      data: await MemberBooking.find({
        $and: [
          { member: { $eq: memberId } },
          { branch: { $eq: branchId } },
          { start: { $gte: startdt, $lt: enddt } },
        ],
      })
        .populate({
          path: "member",
          select: "memberFullName mobileNumber _id",
        })
        .populate({
          path: "room",
          select: "room_no room_gender _id",
        })
        .populate({
          path: "memberPackage",
          select: "package _id",
          populate: {
            path: "package",
            select: "packageName packageCode _id",
          },
        })
        .populate({
          path: "branch",
          select: "branchName _id",
        })
        .populate({
          path: "floor",
          select: "floorNo _id",
        })
        .populate({
          path: "booking",
          strictPopulate: false,
          select: "availableSlot _id",
        }),
      totalRecords: await MemberBooking.find({
        $and: [
          { member: { $eq: memberId } },
          { branch: { $eq: branchId } },
          { start: { $gte: startdt, $lt: enddt } },
        ],
      }).countDocuments(),
    };
    res.send(obj);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/checkinApp", auth, async (req, res) => {
  try {
    const { id } = req.body;
    const bookobj = await Booking.findById(id);
    if (bookobj != null) {
      const mpobj = await MemberPackage.findById(bookobj.package._id);
      if (mpobj && mpobj.packageid) {
        const pacakgeObj = await Package.findById(mpobj.packageid);
        if (
          pacakgeObj &&
          (pacakgeObj.unlimitedyear == true || mpobj.balance != 0)
        ) {
          const obj = await Booking.findByIdAndUpdate(
            id,
            {
              bookingstatus: "Completed",
              checkin_date: Date.now(),
            },
            { new: false }
          );
          const valid = await calculateValidDate(mpobj);
          if (pacakgeObj.unlimitedyear == true) {
            let update = {
              validdate: valid,
            };
            await MemberPackage.findByIdAndUpdate(obj.package._id, update, {
              new: false,
            });
          } else {
            let update = {
              balance: mpobj.balance - bookobj.pax,
              used: mpobj.used + bookobj.pax,
              validdate: valid,
            };
            await MemberPackage.findByIdAndUpdate(obj.package._id, update, {
              new: false,
            });
          }
          res.status(200).json({
            status: "ok",
            data: [obj],
            message: "Check In Accepted",
          });
        } else {
          res.status(200).json({
            status: "Failed",
            data: [],
            message: "Package is Not matched",
          });
        }
      } else {
        res.status(200).json({
          status: "Failed",
          data: [],
          message: "Package is NOt matched",
        });
      }
    } else {
      res.status(200).json({
        status: "Failed",
        data: [],
        message: "Booking Deails Not Avaliable",
      });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

async function calculateValidDate(memberPackages) {
  if (memberPackages.package && memberPackages.validDate == null) {
    if (memberPackages.firstUsedDate != null) {
      const oneYearFromNow = moment(memberPackages.firstUsedDate).add(
        1,
        "years"
      );
      // console.log(oneYearFromNow);
      return oneYearFromNow;
    } else {
      const oneYearFromNow = moment(Date.now()).add(1, "years");
      // console.log(oneYearFromNow);
      return oneYearFromNow;
    }
  } else {
    return memberPackages.validDate;
  }
}

router.post("/check-booking-count", auth, async (req, res) => {
  try {
    const { roomId, start, end } = req.body;
    if (!roomId || !start || !end) {
      return res
        .status(400)
        .json({ message: "Please provide room ID, start time, and end time" });
    }
    const bookingCount = await Booking.find({
      $and: [{ room: { $eq: roomId } }],
      $or: [
        { start: { $lt: new Date(end), $gte: new Date(start) } },
        { end: { $gt: new Date(start), $lte: new Date(end) } },
        { start: { $lte: new Date(start) }, end: { $gte: new Date(end) } },
      ],
    }).populate({
      path: "member",
      select: "gender",
    });
    let maleCount = 0;
    let femaleCount = 0;

    bookingCount.forEach((booking) => {
      bookingCount.forEach((booking) => {
        if (booking.malecount > 0) {
          maleCount = +booking.malecount;
        } else if (booking.femalecount > 0) {
          femaleCount = +booking.femalecount;
        }
      });
    });
    res.json({ maleCount, femaleCount });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/memberbasedAllData", auth, async (req, res) => {
  try {
    const { member, bookingstatus } = req.body;
    const obj = await Booking.find({
      $and: [
        { member: { $eq: member } },
        { bookingstatus: { $eq: bookingstatus } },
      ],
    })
      .populate({
        path: "member",
      })
      .populate({
        path: "room",
      })
      .populate({
        path: "branch",
      })
      .populate({
        path: "floor",
      });
    res.send(obj);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

async function updateBookingStatus() {
  try {
    let newDate = new Date(new Date().getTime() + 10 * 60000);
    const data = await Booking.updateMany(
      {
        $and: [{ start: { $lt: newDate } }, { bookingstatus: "Booked" }],
      },
      { $set: { bookingstatus: "Not Show Up" } }
    );
    return {
      matchedCount: data.matchedCount,
      modifiedCount: data.modifiedCount,
    };
  } catch (error) {
    return { message: error.message };
  }
}

router.post("/checkBookingExists", auth, async (req, res) => {
  try {
    const { member, date } = req.body;
    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(inputDate);
    nextDay.setDate(inputDate.getDate() + 1);
    const bookingCount = await Booking.countDocuments({
      $and: [{ member: { $eq: member } }, { bookingstatus: { $eq: "Booked" } }],
      $or: [{ start: { $gte: inputDate, $lt: nextDay } }],
    });
    if (bookingCount > 0) {
      res.status(200).json({
        status: false,
        message: "Booking Already Exist in given Date",
      });
    } else {
      res.status(200).json({
        status: true,
        message: "Booking Not Exist in given Date",
      });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/old/getBookingBasedonPackage", async (req, res) => {
  try {
    const { memberid, packageid } = req.body;
    const bookings = await Booking.find({
      $and: [{ member: memberid }, { package: packageid }],
    })
      .populate({
        path: "branch",
        select: "branch_name",
      })
      .populate({ path: "package", populate: { path: "packageid" } })
      .sort({ booking_date: -1 });
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/getBookingBasedonPackage", auth, async (req, res) => {
  try {
    const { memberid, packageid } = req.body;
    const bookings = await MemberBooking.find({
      $and: [{ member: memberid }, { memberPackage: packageid }],
    })
      .populate({
        path: "branch",
        select: "branchName",
      })
      .populate({
        path: "memberPackage",
        select: "_id package",
        populate: { path: "package", select: "packageName" },
      })
      .sort({ bookingDate: -1 });
    const result = {
      list: bookings,
      total: bookings.length,
    };
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

async function getRolesByUser(users) {
  try {
    const staff = await Staff.findOne({
      username: { $regex: new RegExp("^" + users + "$", "i") },
    })
      .select("roles")
      .populate({
        path: "roles",
        select: "branch all_branch",
        populate: {
          path: "branch",
        },
      });
    if (!staff || !staff.roles) {
      // console.log("No roles found");
      return [];
    }
    return {
      branch: staff.roles.branch || [],
      all_branch: staff.roles.all_branch || false,
    };
  } catch (error) {
    console.error("Error fetching roles by user:", error);
    throw error;
  }
}

const checkBookingCount = async (roomId, start, end) => {
  if (!roomId || !start || !end) {
    throw new Error("Please provide room ID, start time, and end time");
  }
  let startUTC = new Date(start).toISOString();
  let endUTC = new Date(end).toISOString();
  // console.log("dd", startUTC, endUTC);
  // db["bookings"].find({
  //   $and: [
  //     { room: { $eq: ObjectId("66fadcdefccafc111cf0bb70") } },
  //     { start: { $eq: new Date("2024-10-29T00:00:00.000Z") } },
  //     { end: { $eq: new Date("2024-10-29T00:00:00.000Z") } },
  //   ],
  // });
  const existingBooking = await Booking.findOne({
    $and: [
      { room: { $eq: roomId } },
      { start: { $eq: new Date(startUTC) } },
      { end: { $eq: new Date(endUTC) } },
    ],
    // room: { $eq: roomId },
    // start: { $eq: new Date(startUTC) },
    // end: { $eq: new Date(endUTC) },

    // bookingstatus: { $in: ["Booked", "Completed"] },
    // $or: [
    //   { start: { $lt: new Date(end), $gte: new Date(start) } },
    //   { end: { $gt: new Date(start), $lte: new Date(end) } },
    //   { start: { $lte: new Date(start) }, end: { $gte: new Date(end) } },
    // ],
  }).populate({
    path: "members",
  });
  // console.log("existingBooking", existingBooking?._id);
  let blockedMaleCount = 0;
  let blockedFemaleCount = 0;
  existingBooking?.members.forEach((member) => {
    // console.log("member", member);
    if (member.bookingstatus === "Booked") {
      // console.log("memberBookingStatus", member.bookingstatus);
      blockedMaleCount += member.malePax || 0;
      blockedFemaleCount += member.femalPax || 0;
    } else {
      blockedMaleCount += 0;
      blockedFemaleCount += 0;
    }
  });

  // bookingCount.forEach((booking) => {
  //   blockedMaleCount += booking.malecount || 0;
  //   blockedFemaleCount += booking.femalecount || 0;
  // });
  return { blockedMaleCount, blockedFemaleCount, bookingId: existingBooking };
};

// var GoogleCalenderAppointments = null;
// var today = new Date();
// var lastDay = new Date(today);
// lastDay.setDate(today.getDate() + 4);

function checkGoogleCalendarConflict(date) {
  var hasConflict = false;
  if (!GoogleCalenderAppointments) {
    //logic to get scheduled appointments
  }

  //iterate through relevant scheduled appointments
  //if argument `date` has conflict, return true
  //else, return false

  return hasConflict;
}

function getTimeSlotsForDay(date) {
  // https://stackoverflow.com/questions/31884340/create-array-of-available-time-slots-between-two-dates
  var timeSlots = [];
  var dayStart = new Date(date);
  var dayEnd = new Date(date);

  switch (date.getDay()) {
    case 0: //Sunday
      return timeSlots;
    case 6: //Saturday
      dayStart.setHours(10, 0, 0, 0);
      dayEnd.setHours(20, 0, 0, 0);
      break;
    default:
      dayStart.setHours(13, 0, 0, 0);
      dayEnd.setHours(20, 0, 0, 0);
  }
  do {
    if (!checkGoogleCalendarConflict(dayStart)) {
      timeSlots.push(new Date(dayStart));
    }
    dayStart.setHours(dayStart.getHours(), dayStart.getMinutes() + 60);
  } while (dayStart < dayEnd);

  return timeSlots;
}

function getDaysBetween(start, end) {
  const range = [];
  let current = start;
  while (!current.isAfter(end)) {
    range.push(current);
    current = current.add(1, "days");
  }
  return range;
}

router.post("/data-correction-booking-completion", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { date, branchCode } = req.body;
    if (!date || !branchCode) {
      return res
        .status(400)
        .json({ status: false, message: "Date is required" });
    }

    const branch = await Branch.findOne({ branchCode }).session(session);
    if (!branch) {
      return res
        .status(404)
        .json({ status: false, message: "Branch not found" });
    }

    const selectedDate = new Date(date);
    const startdt = new Date(selectedDate.setHours(0, 0, 0, 0));
    const enddt = new Date(selectedDate.setHours(23, 59, 59, 999));
    // console.log(startdt, enddt);

    const bookingList = await Booking.find({
      $and: [{ start: { $gte: startdt, $lt: enddt } }, { branch: branch._id }],
    }).session(session);

    // console.log("bookingList", bookingList);

    if (bookingList.length === 0) {
      await session.commitTransaction();
      session.endSession();
      return res.json({
        status: true,
        statusCode: 200,
        message: "No bookings found for the given date.",
      });
    }
    for (const booking of bookingList) {
      if (booking.members.length > 0) {
        if (booking.members.length > 0) {
          for (const memberBookingId of booking.members) {
            try {
              const memberBookobj = await MemberBooking.find({
                _id: memberBookingId,
                bookingstatus: "Cancel",
              }).session(session);

              if (memberBookobj.length === 0) continue;

              for (const item of memberBookobj) {
                const memberPackage = await MemberPackage.findOne({
                  _id: item.memberPackage,
                }).session(session);

                if (!memberPackage) {
                  console.error(
                    `Skipping MemberBooking ID: ${item._id} - No MemberPackage found.`
                  );
                  continue;
                }

                const beforeBalance = memberPackage.currentBalance;
                const beforeUsed = memberPackage.used;
                const updatedBalance = Math.max(
                  0,
                  memberPackage.currentBalance - item.pax
                );
                const updatedUsed = memberPackage.used + item.pax;

                await MemberPackage.findByIdAndUpdate(
                  memberPackage._id,
                  {
                    currentBalance: updatedBalance,
                    used: updatedUsed,
                  },
                  { session, new: false }
                );
                // console.log(
                //   `Updated MemberPackage ID: ${memberPackage._id}, Used: ${updatedUsed}, Current Balance: ${updatedBalance}`
                // );

                await MemberBooking.findByIdAndUpdate(
                  item._id,
                  {
                    bookingstatus: "Complete",
                    checkout_date: Date.now(),
                    remarks: `Data Correction: before: ${beforeBalance},${beforeUsed} and after:${updatedBalance}, ${updatedUsed}`,
                  },
                  { session, new: false }
                );
                // console.log(
                //   `Updated MemberBooking ID: ${item._id} to Complete`
                // );
              }
            } catch (error) {
              console.error(
                `Skipping member booking ${memberBookingId} due to error:`,
                error
              );
              continue;
            }
          }
        }
      }
    }
    await session.commitTransaction();
    session.endSession();

    return res.json({
      status: true,
      statusCode: 200,
      message: "Data correction completed successfully.",
    });
  } catch (error) {
    // console.error("Error in data correction:", error);
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
});

router.post("/data-correction-complete-booking", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { date, branchCode } = req.body;
    if (!date || !branchCode) {
      return res
        .status(400)
        .json({ status: false, message: "Date is required" });
    }

    const branch = await Branch.findOne({ branchCode }).session(session);
    if (!branch) {
      return res
        .status(404)
        .json({ status: false, message: "Branch not found" });
    }

    const selectedDate = new Date(date);
    const startdt = new Date(selectedDate.setHours(0, 0, 0, 0));
    const enddt = new Date(selectedDate.setHours(23, 59, 59, 999));
    // console.log(startdt, enddt);

    const bookingList = await Booking.find({
      $and: [{ start: { $gte: startdt, $lt: enddt } }, { branch: branch._id }],
    }).session(session);

    // console.log("bookingList", bookingList);

    if (bookingList.length === 0) {
      await session.commitTransaction();
      session.endSession();
      return res.json({
        status: true,
        statusCode: 200,
        message: "No bookings found for the given date.",
      });
    }
    for (const booking of bookingList) {
      if (booking.members.length > 0) {
        if (booking.members.length > 0) {
          for (const memberBookingId of booking.members) {
            try {
              const memberBookobj = await MemberBooking.find({
                _id: memberBookingId,
                bookingstatus: "Complete",
              }).session(session);

              if (memberBookobj.length === 0) continue;

              for (const item of memberBookobj) {
                const memberPackage = await MemberPackage.findOne({
                  _id: item.memberPackage,
                }).session(session);

                if (!memberPackage) {
                  // console.error(
                  //   `Skipping MemberBooking ID: ${item._id} - No MemberPackage found.`
                  // );
                  continue;
                }

                const orderItem = await OrderItems.findOne({
                  _id: memberPackage.orderItem,
                }).session(session);

                if (!orderItem) {
                  // console.error(
                  //   `Skipping MemberPackage ID: ${memberPackage._id} - No OrderItem found.`
                  // );
                  continue;
                }

                const packageData = await Package.findOne({
                  _id: orderItem.package,
                }).session(session);

                if (!packageData) {
                  // console.error(
                  //   `Skipping OrderItem ID: ${orderItem._id} - No Package found.`
                  // );
                  continue;
                }

                // Calculate original balance
                let originalBalance = packageData.packageUnlimitedStatus
                  ? 9999
                  : orderItem.quantity * packageData.packageUsageLimit;

                const totalPaxForPackage = await MemberBooking.aggregate([
                  {
                    $match: {
                      memberPackage: memberPackage._id,
                      bookingstatus: "Complete",
                    },
                  },
                  {
                    $group: {
                      _id: null,
                      totalPax: { $sum: "$pax" },
                    },
                  },
                ]).session(session);

                const totalPax = totalPaxForPackage.length
                  ? totalPaxForPackage[0].totalPax
                  : 0;

                const beforeBalance = memberPackage.currentBalance;
                const beforeUsed = memberPackage.used;
                const updatedBalance = Math.max(0, originalBalance - totalPax);
                const updatedUsed = totalPax;
                if (
                  memberPackage.currentBalance !== updatedBalance ||
                  memberPackage.used !== updatedUsed
                ) {
                  await MemberPackage.findByIdAndUpdate(
                    memberPackage._id,
                    {
                      currentBalance: updatedBalance,
                      used: updatedUsed,
                    },
                    { session, new: false }
                  );
                  // console.log(
                  //   `Updated MemberPackage ID: ${memberPackage._id}, Used: ${updatedUsed}, Current Balance: ${updatedBalance}`
                  // );

                  await MemberBooking.findByIdAndUpdate(
                    item._id,
                    {
                      bookingstatus: "Complete",
                      checkout_date: Date.now(),
                      remarks: `Data Correction: before: ${beforeBalance}, ${beforeUsed} and after:${updatedBalance}, ${updatedUsed}`,
                    },
                    { session, new: false }
                  );
                  // console.log(
                  //   `Updated MemberBooking ID: ${item._id} to Complete`
                  // );
                } else {
                  console.log(
                    `Skipping MemberPackage ID: ${memberPackage._id} - No Changes found.`
                  );
                }
              }
            } catch (error) {
              console.error(
                `Skipping member booking ${memberBookingId} due to error:`,
                error
              );
              continue;
            }
          }
        }
      }
    }
    await session.commitTransaction();
    session.endSession();

    return res.json({
      status: true,
      statusCode: 200,
      message: "Data correction completed successfully.",
    });
  } catch (error) {
    // console.error("Error in data correction:", error);
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
});

router.post("/data-correction-complete-booking-v2", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { date, branchCode, packageId } = req.body;
    if (!date || !branchCode) {
      return res
        .status(400)
        .json({ status: false, message: "Date is required" });
    }

    const branch = await Branch.findOne({ branchCode }).session(session);
    if (!branch) {
      return res
        .status(404)
        .json({ status: false, message: "Branch not found" });
    }

    const package = await Package.findById(packageId).session(session);
    if (!package) {
      return res
        .status(404)
        .json({ status: false, message: "Package not found" });
    }
    // console.log("Package Found:", package);

    const selectedDate = new Date(date);
    const startdt = new Date(selectedDate.setHours(0, 0, 0, 0));
    const enddt = new Date(selectedDate.setHours(23, 59, 59, 999));

    // console.log(startdt, enddt);

    const orders = await Orders.find({
      orderBranch: branch._id,
      orderDate: { $gte: startdt, $lt: enddt },
      status: { $eq: "Paid" },
    }).session(session);

    // console.log("Orders Found:", orders.length);

    if (orders.length === 0) {
      await session.commitTransaction();
      session.endSession();
      return res.json({
        status: true,
        statusCode: 200,
        message: "No orders found for the given date.",
      });
    }

    for (const order of orders) {
      const orderItems = await OrderItems.find({
        order: order._id,
        package: package._id,
      }).session(session);

      if (orderItems.length === 0) {
        // console.log(`No order items found for Order ID: ${order._id}`);
        continue;
      }

      for (const orderItem of orderItems) {
        const memberPackages = await MemberPackage.find({
          orderItem: orderItem._id,
        }).session(session);

        if (memberPackages.length === 0) {
          // console.log(
          //   `No MemberPackage found for OrderItem ID: ${orderItem._id}`
          // );
          continue;
        }

        for (const memberPackage of memberPackages) {
          const memberBookings = await MemberBooking.find({
            memberPackage: memberPackage._id,
            bookingstatus: "Complete",
          }).session(session);

          if (memberBookings.length === 0) {
            // console.log(
            //   `No completed MemberBooking found for MemberPackage ID: ${memberPackage._id}`
            // );
            continue;
          }

          const packageData = await Package.findOne({
            _id: orderItem.package,
          }).session(session);

          if (!packageData) {
            // console.log(
            //   `Skipping OrderItem ID: ${orderItem._id} - No Package found.`
            // );
            continue;
          }

          let originalBalance = packageData.packageUnlimitedStatus
            ? 99999
            : orderItem.quantity * packageData.packageUsageLimit;

          const totalPaxForPackage = await MemberBooking.aggregate([
            {
              $match: {
                memberPackage: memberPackage._id,
                bookingstatus: "Complete",
              },
            },
            {
              $group: {
                _id: null,
                totalPax: { $sum: "$pax" },
              },
            },
          ]).session(session);

          const totalPax = totalPaxForPackage.length
            ? totalPaxForPackage[0].totalPax
            : 0;

          const beforeBalance = memberPackage.currentBalance;
          const beforeUsed = memberPackage.used;
          const updatedBalance = Math.max(0, originalBalance - totalPax);
          // const updatedUsed = totalPax;
          const updatedUsed =
            totalPax > originalBalance ? originalBalance : totalPax;

          if (
            memberPackage.currentBalance !== updatedBalance ||
            memberPackage.used !== updatedUsed
          ) {
            await MemberPackage.findByIdAndUpdate(
              memberPackage._id,
              { currentBalance: updatedBalance, used: updatedUsed },
              { session, new: false }
            );
            // console.log(
            //   `Updated MemberPackage ID: ${memberPackage._id}, Used: ${updatedUsed}, Current Balance: ${updatedBalance}`
            // );

            for (const booking of memberBookings) {
              await MemberBooking.findByIdAndUpdate(
                booking._id,
                {
                  remarks: `Data Correction: before: ${beforeBalance}, ${beforeUsed} and after: ${updatedBalance}, ${updatedUsed}`,
                },
                { session, new: false }
              );
              // console.log(
              //   `Updated MemberBooking ID: ${booking._id} to Complete`
              // );
            }
          } else {
            console.log(
              `Skipping MemberPackage ID: ${memberPackage._id} - No Changes found.`
            );
          }
        }
      }
    }

    await session.commitTransaction();
    session.endSession();

    return res.json({
      status: true,
      statusCode: 200,
      message: "Data correction completed successfully.",
    });
  } catch (error) {
    // console.error("Error in data correction:", error);
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
});

router.post("/data-correction-valid-date-checking", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const memberPackages = await MemberPackage.find({
      used: { $gt: 0 },
      validDate: { $exists: false },
      packageValidity: "1 Year"
    }).session(session);

    if (memberPackages.length === 0) {
      await session.commitTransaction();
      session.endSession();
      return res.json({
        status: true,
        statusCode: 200,
        message: "No member packages require validDate correction."
      });
    }

    for (const memberPackage of memberPackages) {
      const oldestBooking = await MemberBooking.findOne({
        memberPackage: memberPackage._id,
        bookingstatus: "Complete"
      })
        .sort({ bookingDate: 1 })
        .session(session);

      if (!oldestBooking) {
        console.log(
          `No completed bookings found for MemberPackage ${memberPackage._id}`
        );
        continue;
      }

      const validDate = moment(oldestBooking.bookingDate)
        .add(1, "years")
        .toDate();

      await MemberPackage.findByIdAndUpdate(
        memberPackage._id,
        { validDate },
        { session, new: false }
      );

      // console.log(
      //   `Updated MemberPackage ${memberPackage._id} validDate -> ${validDate}`
      // );
    }

    await session.commitTransaction();
    session.endSession();

    return res.json({
      status: true,
      statusCode: 200,
      message: "ValidDate correction completed successfully."
    });
  } catch (error) {
    // console.error("Error in validDate correction:", error);
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
});

router.post("/delete-completed-member-booking", auth, async (req, res) => {
  try {
    const { _id, booking, cancellationReason } = req.body;
    // console.log(req.body);
    const memberBookobj = await MemberBooking.findById(_id);
    const bookobj = await Booking.findById(booking);
    if (bookobj != null && memberBookobj != null) {
      const obj = await MemberBooking.findByIdAndUpdate(
        _id,
        {
          bookingstatus: "Deleted",
          cancellationReason: cancellationReason,
          remarks: "Booking Deleted by Admin",
        },
        { new: false }
      );
      const memberPackage = await MemberPackage.findById(
        memberBookobj.memberPackage._id
      );
      const before = {
        memberPackageId: memberPackage._id,
        currentBalance: memberPackage.currentBalance,
        used: memberPackage.used,
      };
      const after = {
        memberPackageId: memberPackage._id,
        currentBalance: memberPackage.currentBalance + memberBookobj.pax,
        used: memberPackage.used - memberBookobj.pax,
      };
      await MemberPackage.findByIdAndUpdate(memberBookobj.memberPackage._id, {
        $inc: {
          currentBalance: memberBookobj.pax,
          used: -memberBookobj.pax,
        },
      });
      const memberPackageBalanceLog = new MemberPackageBalanceLog({
        user: req.user.uid,
        action: "delete",
        member: memberBookobj.member,
        memberPackage: memberBookobj.memberPackage,
        memberBooking: _id,
        before,
        after,
        approvedBy: req.user.uid,
        status: "Approved",
        cancellationReason: cancellationReason,
        approvedAt: new Date(),
      });
      await memberPackageBalanceLog.save();
      let newbalance = bookobj.availableSlot + memberBookobj.pax;
      let newpax = bookobj.pax - memberBookobj.pax;
      let newTitle = newpax + " person booked";
      await Booking.findByIdAndUpdate(
        booking,
        {
          availableSlot: newbalance,
          pax: newpax,
          title: newTitle,
        },
        { new: false }
      );
      res.status(200).json({
        status: "ok",
        data: obj,
        message: "Deleted successfully",
      });
    } else {
      // console.log("Booking Details Not Avaliable");
      res.status(200).json({
        status: "Failed",
        data: [],
        message: "Booking Deails Not Avaliable",
      });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/edit-completed-member-booking", auth, async (req, res) => {
  try {
    const { _id, booking, pax } = req.body;
    const memberBookobj = await MemberBooking.findById(_id);
    const bookobj = await Booking.findById(booking);

    if (bookobj != null && memberBookobj != null) {
      const oldPax = memberBookobj.pax;
      const newPax = Number(pax);
      const diff = newPax - oldPax;

      await MemberBooking.findByIdAndUpdate(_id, {
        pax: newPax,
        remarks: "Booking pax edited by Admin",
      });
      const memberPackage = await MemberPackage.findById(
        memberBookobj.memberPackage._id
      );
      const before = {
        currentBalance: memberPackage.currentBalance,
        used: memberPackage.used,
      };
      const after = {
        currentBalance: memberPackage.currentBalance - diff,
        used: memberPackage.used + diff,
      };

      await MemberPackage.findByIdAndUpdate(memberBookobj.memberPackage._id, {
        $inc: {
          currentBalance: -diff,
          used: diff,
        },
      });

      const memberPackageBalanceLog = new MemberPackageBalanceLog({
        user: req.user.uid,
        action: "update",
        member: memberBookobj.member,
        memberPackage: memberBookobj.memberPackage,
        memberBooking: _id,
        before,
        after,
        approvedBy: req.user.uid,
        status: "Approved",
        approvedAt: new Date(),
      });
      await memberPackageBalanceLog.save();

      let newAvailableSlot = bookobj.availableSlot - diff;
      let newBookingPax = bookobj.pax + diff;
      let newTitle = newBookingPax + " person booked";
      await Booking.findByIdAndUpdate(
        booking,
        {
          availableSlot: newAvailableSlot,
          pax: newBookingPax,
          title: newTitle,
        },
        { new: false }
      );

      res.status(200).json({
        status: "ok",
        message: "Booking pax updated successfully",
      });
    } else {
      res.status(200).json({
        status: "Failed",
        data: [],
        message: "Booking Details Not Available",
      });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post(
  "/request-delete-completed-member-booking",
  auth,
  async (req, res) => {
    try {
      const { _id, booking, cancellationReason } = req.body;
      const memberBookobj = await MemberBooking.findById(_id);
      const bookobj = await Booking.findById(booking);
      if (bookobj && memberBookobj) {
        const memberPackage = await MemberPackage.findById(
          memberBookobj.memberPackage._id
        );
        const before = {
          memberPackageId: memberPackage._id,
          currentBalance: memberPackage.currentBalance,
          used: memberPackage.used,
        };
        const after = {
          memberPackageId: memberPackage._id,
          currentBalance: memberPackage.currentBalance + memberBookobj.pax,
          used: memberPackage.used - memberBookobj.pax,
        };
        // For request, approvedBy and approvedAt are required by schema, but not available yet. Use empty string and null.
        const memberPackageBalanceLog = new MemberPackageBalanceLog({
          user: req.user.uid,
          action: "Request Delete",
          member: memberBookobj.member,
          memberPackage: memberBookobj.memberPackage,
          memberBooking: _id,
          before,
          after,
          approvedBy: "-",
          status: "Pending",
          createdAt: new Date(),
          cancellationReason: cancellationReason,
          approvedAt: null,
        });
        await memberPackageBalanceLog.save();
        res.status(200).json({
          status: "ok",
          message: "Delete request submitted for approval.",
        });
      } else {
        res.status(200).json({
          status: "Failed",
          message: "Booking Details Not Available",
        });
      }
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }
);

router.post(
  "/request-edit-completed-member-booking",
  auth,
  async (req, res) => {
    try {
      const { _id, booking, pax } = req.body;
      const memberBookobj = await MemberBooking.findById(_id);
      const bookobj = await Booking.findById(booking);
      if (bookobj && memberBookobj) {
        const oldPax = memberBookobj.pax;
        const newPax = Number(pax);
        const diff = newPax - oldPax;
        const memberPackage = await MemberPackage.findById(
          memberBookobj.memberPackage._id
        );
        const before = {
          currentBalance: memberPackage.currentBalance,
          used: memberPackage.used,
          pax: oldPax,
        };
        const after = {
          currentBalance: memberPackage.currentBalance - diff,
          used: memberPackage.used + diff,
          pax: newPax,
        };
        // For request, approvedBy and approvedAt are required by schema, but not available yet. Use dash and null.
        const memberPackageBalanceLog = new MemberPackageBalanceLog({
          user: req.user.uid,
          action: "Request Edit",
          member: memberBookobj.member,
          memberPackage: memberBookobj.memberPackage,
          memberBooking: _id,
          before,
          after,
          approvedBy: "-",
          status: "Pending",
          createdAt: new Date(),
          approvedAt: null,
        });
        await memberPackageBalanceLog.save();
        res.status(200).json({
          status: "ok",
          message: "Edit request submitted for approval.",
        });
      } else {
        res.status(200).json({
          status: "Failed",
          message: "Booking Details Not Available",
        });
      }
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }
);

async function approveRequestDelete(log, userId) {
  const memberBookobj = await MemberBooking.findById(log.memberBooking);
  const bookobj = await Booking.findById(memberBookobj.booking);
  if (!memberBookobj || !bookobj) {
    throw new Error("Booking Details Not Available");
  }
  await MemberBooking.findByIdAndUpdate(log.memberBooking, {
    bookingstatus: "Deleted",
    cancellationReason: log.cancellationReason,
    remarks: "Booking Deleted by Admin (Approved)",
  });
  await MemberPackage.findByIdAndUpdate(memberBookobj.memberPackage._id, {
    $inc: {
      currentBalance: memberBookobj.pax,
      used: -memberBookobj.pax,
    },
  });
  let newbalance = bookobj.availableSlot + memberBookobj.pax;
  let newpax = bookobj.pax - memberBookobj.pax;
  let newTitle = newpax + " person booked";
  await Booking.findByIdAndUpdate(
    bookobj._id,
    {
      availableSlot: newbalance,
      pax: newpax,
      title: newTitle,
    },
    { new: false }
  );
  log.status = "Approved";
  log.approvedBy = userId;
  log.approvedAt = new Date();
  await log.save();
}

async function approveRequestEdit(log, userId) {
  const memberBookobj = await MemberBooking.findById(log.memberBooking);
  const bookobj = await Booking.findById(memberBookobj.booking);
  if (!memberBookobj || !bookobj) {
    throw new Error("Booking Details Not Available");
  }
  const oldPax = memberBookobj.pax;
  const newPax = log.after.pax;
  const diff = newPax - oldPax;
  await MemberBooking.findByIdAndUpdate(log.memberBooking, {
    pax: newPax,
    remarks: "Booking pax edited by Admin (Approved)",
  });
  await MemberPackage.findByIdAndUpdate(memberBookobj.memberPackage._id, {
    $inc: {
      currentBalance: -diff,
      used: diff,
    },
  });
  let newAvailableSlot = bookobj.availableSlot - diff;
  let newBookingPax = bookobj.pax + diff;
  let newTitle = newBookingPax + " person booked";
  await Booking.findByIdAndUpdate(
    bookobj._id,
    {
      availableSlot: newAvailableSlot,
      pax: newBookingPax,
      title: newTitle,
    },
    { new: false }
  );
  log.status = "Approved";
  log.approvedBy = userId;
  log.approvedAt = new Date();
  await log.save();
}

router.post("/approve-request-amendment", auth, async (req, res) => {
  try {
    const { _id } = req.body;
    const log = await MemberPackageBalanceLog.findById(_id);
    if (
      !log ||
      log.status !== "Pending" ||
      (log.action !== "Request Delete" && log.action !== "Request Edit")
    ) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid or already processed request.",
      });
    }
    if (log.action === "Request Delete") {
      await approveRequestDelete(log, req.user.uid);
      res.status(200).json({
        status: "ok",
        message: "Delete request approved and applied.",
      });
    } else if (log.action === "Request Edit") {
      await approveRequestEdit(log, req.user.uid);
      res
        .status(200)
        .json({ status: "ok", message: "Edit request approved and applied." });
    } else {
      res
        .status(400)
        .json({ status: "Failed", message: "Unknown amendment type." });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/memberbased/audit-log/:member", auth, async (req, res) => {
  try {
    const { member } = req.params;
    const obj = {
      data: await MemberPackageBalanceLog.find({ member: { $eq: member } })
        .sort({
          createdAt: -1,
        })
        .populate({
          path: "memberPackage",
          select: "package",
          populate: {
            path: "package",
            select: "packageName packageCode",
          },
        }),
    };
    // console.log(obj);
    res.send(obj);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
