const express = require("express");
const mongoose = require("mongoose");
const Branch = require("../../models/branch");
const MemberDeposits = require("../../models/memberDeposits");
const Staff = require("../../models/staff");
const router = express.Router();
const auth = require("./jwtfilter");
const {
  registerDeposits,
  registerUseDeposits,
} = require("../../helper/functions");

router.post("/deposits", auth, async (req, res) => {
  try {
    const branch = await Branch.findById(req.body.branch);
    // req.body["member"] = "66ffa1566fb0199a595cfd76";
    // const member = await Members.findById(req.body.member);
    if (req.body && branch) {
      try {
        await registerDeposits(branch, req.body);
        res.status(200).send("OK");
      } catch (e) {
        // console.log(e);
        res.status(401).send({ message: e.message });
      }
    } else {
      res.status(500).send("Branch not availables");
    }
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.post("/useDeposits", auth, async (req, res) => {
  try {
    // console.log(req.body);
    const branch = await Branch.findById(req.body.branch);
    if (req.body && branch) {
      try {
        await registerUseDeposits(branch, req.body);
        res.status(200).send("OK");
      } catch (e) {
        // console.log(e);
        res.status(401).send({ message: e.message });
      }
    } else {
      res.status(500).send("Branch not availables");
    }
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(id);
    const deposits = await MemberDeposits.find({ payer: id });

    // Calculate the total amount by summing up the 'payAmount' field
    const totalAmount = deposits.reduce(
      (sum, deposit) => sum + deposit.payAmount,
      0
    );

    // If no deposits found, return totalAmount as 0
    if (deposits.length === 0) {
      return res.json({ totalAmount: 0 });
    }

    res.json({ totalAmount });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/findAll/today", auth, async (req, res) => {
  try {
    const {
      depositNumber,
      branch,
      memberName,
      mobileNumber,
    } = req.body;

    const filters = {};
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Filter to only include today's records
    filters.payDate = { $gte: todayStart, $lte: todayEnd };
    // Add filters
    if (depositNumber) filters.depositNumber = new RegExp(depositNumber, "i");
    const branchFilters = {};
    if (branch) branchFilters.branch = branch;

    // For memberName and mobileNumber, filter based on the member's details
    const memberFilters = {};
    if (memberName) memberFilters.memberFullName = new RegExp(memberName, "i");
    if (mobileNumber)
      memberFilters.mobileNumber = new RegExp(mobileNumber, "i");

    // If not admin, restrict access to specific branches
    if (req.user.uid !== "admin") {
      const staff = await Staff.findOne({ _id: req.user.uid }).populate(
        "branch"
      );
      if (!staff || !staff.branch || !staff.branch.length) {
        return res
          .status(404)
          .send({ message: "No branches found for the user" });
      }
      const branchIds = staff.branch.map((branch) => branch._id);
      filters.branch = { $in: branchIds };
    }

    const deposits = await MemberDeposits.aggregate([
      { $match: filters },
      { $sort: { payDate: -1 } },
      {
        $addFields: {
          convertedBranchId: { $toString: "$branch" },
        },
      },
      {
        $match: {
          ...(branchFilters.branch
            ? { convertedBranchId: branchFilters.branch }
            : {}),
        },
      },
      {
        $lookup: {
          from: "members", // Lookup for member details
          localField: "payer",
          foreignField: "_id",
          as: "member",
          pipeline: [
            {
              $project: {
                memberFullName: 1,
                mobileNumber: 1,
                email: 1,
                address: 1,
                city: 1,
                postcode: 1,
                states: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          member: { $arrayElemAt: ["$member", 0] }, // Get the first matched member
        },
      },
      {
        $match: {
          ...(memberFilters.memberFullName
            ? { "member.memberFullName": memberFilters.memberFullName }
            : {}),
          ...(memberFilters.mobileNumber
            ? { "member.mobileNumber": memberFilters.mobileNumber }
            : {}),
        },
      },
      {
        $lookup: {
          from: "branches", // Lookup for branch details
          localField: "branch",
          foreignField: "_id",
          as: "branch",
          pipeline: [
            {
              $project: {
                branchName: 1,
                branchAddress: 1,
                branchCity: 1,
                branchPostcode: 1,
                branchState: 1,
                branchContactNumber: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          branch: { $arrayElemAt: ["$branch", 0] }, // Get the first matched branch
        },
      },
    ]);

    res.send(deposits); // Return the filtered and aggregated results
  } catch (error) {
    // console.error("Error finding deposits:", error);
    res.status(500).send(error);
  }
});

router.post("/findAll", auth, async (req, res) => {
  try {
    const {
      depositNumber,
      startDate,
      endDate,
      branch,
      memberName,
      mobileNumber,
    } = req.body;

    const filters = {};

    // Add filters
    if (depositNumber) filters.depositNumber = new RegExp(depositNumber, "i");
    if (startDate || endDate) {
      filters.payDate = {};
      if (startDate) filters.payDate.$gte = new Date(startDate);
      if (endDate) filters.payDate.$lte = new Date(endDate);
    }
    const branchFilters = {};
    if (branch) branchFilters.branch = branch;

    // For memberName and mobileNumber, filter based on the member's details
    const memberFilters = {};
    if (memberName) memberFilters.memberFullName = new RegExp(memberName, "i");
    if (mobileNumber)
      memberFilters.mobileNumber = new RegExp(mobileNumber, "i");

    // If not admin, restrict access to specific branches
    if (req.user.uid !== "admin") {
      const staff = await Staff.findOne({ _id: req.user.uid }).populate(
        "branch"
      );
      if (!staff || !staff.branch || !staff.branch.length) {
        return res
          .status(404)
          .send({ message: "No branches found for the user" });
      }
      const branchIds = staff.branch.map((branch) => branch._id);
      filters.branch = { $in: branchIds };
    }

    const deposits = await MemberDeposits.aggregate([
      { $match: filters },
      { $sort: { payDate: -1 } },
      {
        $addFields: {
          convertedBranchId: { $toString: "$branch" },
        },
      },
      {
        $match: {
          ...(branchFilters.branch
            ? { convertedBranchId: branchFilters.branch }
            : {}),
        },
      },
      {
        $lookup: {
          from: "members", // Lookup for member details
          localField: "payer",
          foreignField: "_id",
          as: "member",
          pipeline: [
            {
              $project: {
                memberFullName: 1,
                mobileNumber: 1,
                email: 1,
                address: 1,
                city: 1,
                postcode: 1,
                states: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          member: { $arrayElemAt: ["$member", 0] }, // Get the first matched member
        },
      },
      {
        $match: {
          ...(memberFilters.memberFullName
            ? { "member.memberFullName": memberFilters.memberFullName }
            : {}),
          ...(memberFilters.mobileNumber
            ? { "member.mobileNumber": memberFilters.mobileNumber }
            : {}),
        },
      },
      {
        $lookup: {
          from: "branches", // Lookup for branch details
          localField: "branch",
          foreignField: "_id",
          as: "branch",
          pipeline: [
            {
              $project: {
                branchName: 1,
                branchAddress: 1,
                branchCity: 1,
                branchPostcode: 1,
                branchState: 1,
                branchContactNumber: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          branch: { $arrayElemAt: ["$branch", 0] }, // Get the first matched branch
        },
      },
    ]);

    res.send(deposits); // Return the filtered and aggregated results
  } catch (error) {
    // console.error("Error finding deposits:", error);
    res.status(500).send(error);
  }
});

router.get("/depositRecord/:memberId", auth, async (req, res) => {
  try {
    const ObjectId = mongoose.Types.ObjectId;
    const { memberId } = req.params;
    const deposits = await MemberDeposits.find({
      payer: { $eq: new ObjectId(memberId) },
    })
      .populate("branch")
      .populate("payer")
      .sort({ createdAt: -1 });

    res.send({ deposits });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
