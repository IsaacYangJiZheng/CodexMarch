const express = require("express");
const MemberFeedback = require("../../models/memberFeedback");
const Staff = require("../../models/staff");
const router = express.Router();
const auth = require("./jwtfilter");

router.post("/", auth, async (req, res) => {
  try {
    let obj = await MemberFeedback.create(req.body);
    res.send(obj);
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

// Get all feedbacks
router.get("/all", auth, async (req, res) => {
  try {
    const feedback = await MemberFeedback.find({})
      .populate({
        path: "member",
      })
      .populate({
        path: "branch",
      })
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.post("/all", auth, async (req, res) => {
  try {
    const { memberName, mobileNumber, branch, startDate, endDate } =
      req.body;

    const filters = {};
    const memberFilters = {};
    const branchFilters = {};
    if (memberName) memberFilters.memberFullName = new RegExp(memberName, "i");
    if (mobileNumber) memberFilters.mobileNumber = new RegExp(mobileNumber, "i");
    if (branch) branchFilters.branch = branch;
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

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
      filters.branch = { $in: branchIds.concat([null]) };
    }

    const members = await MemberFeedback.aggregate([
      { $match: filters },
      { $sort: { createdAt: -1 } },
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
          from: "members", // Collection name for members
          localField: "member",
          foreignField: "_id",
          as: "member",
          pipeline: [
            {
              $project: {
                memberFullName: 1,
                mobileNumber: 1,
                dob: 1,
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
          from: "branches", // Collection name for branches
          localField: "branch",
          foreignField: "_id",
          as: "branch",
          pipeline: [
            {
              $project: {
                branchName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          branch: { $arrayElemAt: ["$branch", 0] }, // Get the first matched member
        },
      },
    ]);
    res.send(members);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a feedback by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await MemberFeedback.findOne({
      $and: [{ _id: { $eq: id } }],
    })
      .populate({
        path: "branch",
      })
      .populate({
        path: "member",
      });
    res.send(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a feedback by Member ID
router.get("/member/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await MemberFeedback.find({
      $and: [{ member: { $eq: id } }],
    })
      .populate({
        path: "branch",
      })
      .populate({
        path: "member",
      });
    res.send(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a feedback by ID
router.put("/internal/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks, summary, followUpStatus } = req.body;
    const updatedFeedback = await MemberFeedback.findByIdAndUpdate(
      id,
      {
        internal_remarks: remarks,
        internal_summary: summary,
        internal_status: followUpStatus,
      },
      { new: true } // Return the updated document
    );

    if (!updatedFeedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    res.json(updatedFeedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
