const express = require("express");
const mongoose = require("mongoose");
const MemberPackage = require("../../models/memberPackage");
const router = express.Router();
const auth = require("./jwtfilter");
const MemberPackageTransfer = require("../../models/memberPackageTransfer");
const {
  sendPackageTransferConfirmNotification,
} = require("../../helper/notification");

router.post("/web", auth, async (req, res) => {
  try {
    let transaction_no = "";
    const memberpackage = await MemberPackage.findById(
      req.body.memberPackageId
    ).populate({ path: "purchaseBranch" });
    if (memberpackage) {
      transaction_no = await generateRunningNumber(
        memberpackage.purchaseBranch._id,
        memberpackage.purchaseBranch.branchCode
      );
      // console.log(transaction_no);
      let transfer_obj = {
        transactionNo: transaction_no,
        memberFrom: req.body.fromMemberId,
        memberTo: req.body.toMemberId,
        fromMemberPackage: req.body.memberPackageId,
        transferSessionCount: req.body.transferCount,
        originalPurchaseInvoice: req.body.originalPurchaseInvoice,
        actionBy: "Admin",
        actionUserId: "Admin",
      };
      let transfer = await MemberPackageTransfer.create(transfer_obj);
      let dt = {
        member: req.body.toMemberId,
        package: memberpackage.package,
        purchaseBranch: memberpackage.purchaseBranch,
        // packageid: req.body.memberpackage,
        originalBalance: parseInt(req.body.transferCount),
        currentBalance: parseInt(req.body.transferCount),
        purchaseType: "Transfer",
        transferNo: transaction_no,
        transferId: transfer._id,
        transferFrom: memberpackage,
        validDate: memberpackage.validDate,
      };
      let new_memberPackage = await MemberPackage.create(dt);
      let update = {
        currentBalance:
          memberpackage.currentBalance - parseInt(req.body.transferCount),
        transferredTimes:
          memberpackage.transferredTimes + parseInt(req.body.transferCount),
      };
      await MemberPackage.findByIdAndUpdate(memberpackage._id, update, {
        new: false,
      });
      await MemberPackageTransfer.findByIdAndUpdate(
        transfer._id,
        { toMemberPackage: new_memberPackage._id },
        {
          new: false,
        }
      );
      await sendPackageTransferConfirmNotification(transfer);
      res.status(200).json({
        status: "ok",
        message: "Package Transfered",
      });
    } else {
      res.status(200).json({
        status: "Failed",
        data: [],
        message: "Member Package Not Found",
      });
    }
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.post("/mobile", auth, async (req, res) => {
  try {
    let transaction_no = "";
    const memberpackage = await MemberPackage.findById(
      req.body.memberPackageId
    ).populate({ path: "purchaseBranch" });
    if (memberpackage) {
      transaction_no = await generateRunningNumber(
        memberpackage.purchaseBranch._id,
        memberpackage.purchaseBranch.branchCode
      );
      // console.log(transaction_no);
      const { mobileNumber } = req.user;
      let transfer_obj = {
        transactionNo: transaction_no,
        memberFrom: req.body.fromMemberId,
        memberTo: req.body.toMemberId,
        fromMemberPackage: req.body.memberPackageId,
        transferSessionCount: req.body.transferCount,
        originalPurchaseInvoice: req.body.originalPurchaseInvoice,
        actionBy: mobileNumber,
        actionUserId: mobileNumber,
        notes: req.body.notes,
      };
      let transfer = await MemberPackageTransfer.create(transfer_obj);
      let dt = {
        member: req.body.toMemberId,
        package: memberpackage.package,
        purchaseBranch: memberpackage.purchaseBranch,
        // packageid: req.body.memberpackage,
        originalBalance: parseInt(req.body.transferCount),
        currentBalance: parseInt(req.body.transferCount),
        purchaseType: "Transfer",
        transferNo: transaction_no,
        transferId: transfer._id,
        transferFrom: memberpackage,
        validDate: memberpackage.validDate,
      };
      let new_memberPackage = await MemberPackage.create(dt);
      let update = {
        currentBalance:
          memberpackage.currentBalance - parseInt(req.body.transferCount),
        transferredTimes:
          memberpackage.transferredTimes + parseInt(req.body.transferCount),
      };
      await MemberPackage.findByIdAndUpdate(memberpackage._id, update, {
        new: false,
      });
      await MemberPackageTransfer.findByIdAndUpdate(
        transfer._id,
        { toMemberPackage: new_memberPackage._id },
        {
          new: false,
        }
      );
      await sendPackageTransferConfirmNotification(transfer);
      res.status(200).json({
        status: "ok",
        message: "Package Transfered",
      });
    } else {
      res.status(200).json({
        status: "Failed",
        data: [],
        message: "Member Package Not Found",
      });
    }
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

const generateRunningNumber = async (id, branchCode) => {
  try {
    const letter = "T";
    const date = new Date();
    const yyyyMMdd = `${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;

    // Find the latest booking with the matching pattern
    // console.log(branchCode);
    // console.log(letter);
    // console.log(yyyyMMdd);
    // console.log(id);
    const latestBooking = await MemberPackageTransfer.findOne({
      //'memberpackage.branch._id': id,
      transactionNo: new RegExp(`^${branchCode}-${letter}-${yyyyMMdd}`),
    }).sort({ transactionNo: -1 });

    let sequence = "0001"; // Default starting sequence if no previous booking found
    // console.log(latestBooking);
    if (latestBooking) {
      const lastTransactionNo = latestBooking.transactionNo;
      const sequencePart = lastTransactionNo.split(`${yyyyMMdd}`)[1]; // Extract the sequence part after the date
      if (sequencePart) {
        const lastSequence = parseInt(sequencePart, 10); // Parse the sequence part as an integer
        sequence = (lastSequence + 1).toString().padStart(4, "0"); // Increment and pad the sequence to 4 digits
      }
    }

    const runningNo = `${branchCode}-${letter}-${yyyyMMdd}${sequence}`;
    return runningNo;
  } catch (error) {
    // console.error("Error generating running number:", error);
    return ""; // Return an empty string in case of an error
  }
};

router.get("/list/all", auth, async (req, res) => {
  try {
    const obj = await MemberPackageTransfer.find({})
      .populate({
        path: "memberFrom",
        populate: { path: "preferredBranch" },
      })
      .populate({
        path: "memberTo",
        populate: { path: "preferredBranch" },
      })
      .populate({
        path: "fromMemberPackage",
        populate: { path: "package" },
      });
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/findAll", auth, async (req, res) => {
  try {
    const { transferFrom, transferTo, startDate, endDate } = req.body;
    const filters = {};
    if (transferFrom)
      filters["memberFrom.memberFullName"] = new RegExp(transferFrom, "i");
    if (transferTo)
      filters["memberTo.memberFullName"] = new RegExp(transferTo, "i");
    if (startDate || endDate) {
      filters.transferDate = {};
      if (startDate)
        filters.transferDate.$gte = new Date(
          new Date(startDate).setHours(0, 0, 0, 0)
        );
      if (endDate)
        filters.transferDate.$lte = new Date(
          new Date(endDate).setHours(23, 59, 59, 999)
        );
    }
    // const obj = await MemberPackageTransfer.find(filters)
    //   .populate({
    //     path: "memberFrom",
    //     populate: { path: "preferredBranch" },
    //   })
    //   .populate({
    //     path: "memberTo",
    //     populate: { path: "preferredBranch" },
    //   })
    //   .populate({
    //     path: "fromMemberPackage",
    //     populate: { path: "package" },
    //   });
    const obj = await MemberPackageTransfer.aggregate([
      {
        $lookup: {
          from: "members", // Assuming collection name is members
          localField: "memberFrom", // Field that references the memberFrom
          foreignField: "_id",
          as: "memberFrom",
        },
      },
      {
        $addFields: {
          memberFrom: { $arrayElemAt: ["$memberFrom", 0] }, // Flatten the array
        },
      },
      {
        $lookup: {
          from: "branches", // Assuming collection name is branches
          localField: "memberFrom.preferredBranch", // Reference to preferredBranch field in memberFrom
          foreignField: "_id",
          as: "memberFrom.preferredBranch",
        },
      },
      {
        $addFields: {
          "memberFrom.preferredBranch": {
            $arrayElemAt: ["$memberFrom.preferredBranch", 0],
          }, // Flatten the array
        },
      },

      {
        $lookup: {
          from: "members", // Assuming collection name is members
          localField: "memberTo", // Field that references the memberTo
          foreignField: "_id",
          as: "memberTo",
        },
      },
      {
        $addFields: {
          memberTo: { $arrayElemAt: ["$memberTo", 0] }, // Flatten the array
        },
      },
      {
        $lookup: {
          from: "branches", // Assuming collection name is branches
          localField: "memberTo.preferredBranch", // Reference to preferredBranch field in memberTo
          foreignField: "_id",
          as: "memberTo.preferredBranch",
        },
      },
      {
        $addFields: {
          "memberTo.preferredBranch": {
            $arrayElemAt: ["$memberTo.preferredBranch", 0],
          }, // Flatten the array
        },
      },

      {
        $lookup: {
          from: "memberpackages", // Assuming collection name is memberpackages
          localField: "fromMemberPackage", // Field that references the fromMemberPackage
          foreignField: "_id",
          as: "fromMemberPackage",
        },
      },
      {
        $addFields: {
          fromMemberPackage: { $arrayElemAt: ["$fromMemberPackage", 0] }, // Flatten the array
        },
      },

      {
        $lookup: {
          from: "packages", // Assuming collection name is packages
          localField: "fromMemberPackage.package", // Field that references the package
          foreignField: "_id",
          as: "fromMemberPackage.package",
        },
      },
      {
        $addFields: {
          "fromMemberPackage.package": {
            $arrayElemAt: ["$fromMemberPackage.package", 0],
          }, // Flatten the array
        },
      },

      // Apply filters here
      { $match: filters },

      // Optional: Sort the results by transferDate (ascending or descending)
      { $sort: { transferDate: -1 } },

      // Optional: Projection to include only the desired fields
      {
        $project: {
          memberFrom: 1,
          memberTo: 1,
          fromMemberPackage: 1,
          transferDate: 1,
          transactionNo: 1,
          status: 1,
          transferSessionCount: 1,
        },
      },
    ]);
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await MemberPackageTransfer.findById(id)
      .populate({
        path: "memberFrom",
      })
      .populate({
        path: "memberTo",
      })
      .populate({
        path: "fromMemberPackage",
      });
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await MemberPackageTransfer.findByIdAndUpdate(id, req.body, {
      new: false,
    });
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/web/cancel", auth, async (req, res) => {
  try {
    const obj = await MemberPackageTransfer.findById(req.body.id);
    if (obj) {
      const memberpackageFrom = await MemberPackage.findById(
        obj.fromMemberPackage
      );
      let update1 = {
        currentBalance:
          memberpackageFrom.currentBalance + obj.transferSessionCount,
        transferredTimes:
          memberpackageFrom.transferredTimes - obj.transferSessionCount,
      };
      await MemberPackage.findByIdAndUpdate(memberpackageFrom._id, update1, {
        new: false,
      });
      const memberpackageTo = await MemberPackage.findById(obj.toMemberPackage);
      let update2 = {
        currentBalance: 0,
        transferredTimes: 0,
        isDeleted: true,
      };
      await MemberPackage.findByIdAndUpdate(memberpackageTo._id, update2, {
        new: false,
      });
      let update3 = {
        cancelBy: req.user.username,
        status: "Cancel",
      };
      await MemberPackageTransfer.findByIdAndUpdate(req.body.id, update3, {
        new: false,
      });
      res.status(200).json({
        status: "ok",
        message: "Package Transfered Cancelled Successfully",
      });
    } else {
      res.status(200).json({
        status: "Failed",
        data: [],
        message: "Member Package Transfer Not Found",
      });
    }
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.get("/transferSessions/:memberId", auth, async (req, res) => {
  try {
    // console.log("hi");
    const ObjectId = mongoose.Types.ObjectId;
    const { memberId } = req.params;

    const transferIn = await MemberPackageTransfer.find({
      $and: [
        { memberTo: { $eq: new ObjectId(memberId) } },
        { status: { $eq: "Success" } },
      ],
    })
      .populate("memberFrom")
      .populate({
        path: "toMemberPackage",
        populate: { path: "package" },
      });

    const transferOut = await MemberPackageTransfer.find({
      $and: [
        { memberFrom: { $eq: new ObjectId(memberId) } },
        { status: { $eq: "Success" } },
      ],
    })
      .populate("memberTo")
      .populate({
        path: "fromMemberPackage",
        populate: { path: "package" },
      });

    res.send({ transferIn, transferOut });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/list/package/:memberPackId", auth, async (req, res) => {
  try {
    // console.log("hi");
    const ObjectId = mongoose.Types.ObjectId;
    const { memberPackId } = req.params;

    const transferOut = await MemberPackageTransfer.find({
      $and: [
        { fromMemberPackage: { $eq: new ObjectId(memberPackId) } },
        { status: { $eq: "Success" } },
      ],
    }).populate("memberTo");
    res.send(transferOut);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
