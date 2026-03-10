const express = require("express");
const mongoose = require("mongoose");
const Attendance = require("../../models/attendance");
const Staff = require("../../models/staff");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const dayjs = require("dayjs");
var duration = require("dayjs/plugin/duration");
const auth = require("./jwtfilter");
dayjs.extend(duration);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./Images");
    // cb(null, "./root/Anran-Dev-Media/Images");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upDateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./Images");
    // cb(null, "./root/Anran-Dev-Media/Images");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploads = multer({ storage });
const upDateUploads = multer({ storage: upDateStorage });

router.post("/", async (req, res) => {
  try {
    const { staff, branch, checkIn, checkOut, duration } = req.body;
    const staffObj = await Staff.findById(staff);
    const obj = new Attendance({
      staff,
      branch,
      checkIn,
      checkOut,
      duration,
      allowOT: staffObj.allowOT,
    });
    await obj.save();
    res.status(200).send({ status: true, message: "Ok", obj });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { staff, branch, checkIn, checkOut, duration } = req.body;
    const obj = await Attendance.findByIdAndUpdate(
      id,
      {
        staff,
        branch,
        checkIn,
        checkOut,
        duration,
      },
      { new: false }
    );
    res.status(200).send({ status: true, message: "Ok", obj });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/today/:id", async (req, res) => {
  try {
    let ss = new Date(new Date().setUTCHours(0, 0, 0));
    let ee = new Date(new Date().setUTCHours(23, 59, 59, 999));
    const attendance = await Attendance.findOne({
      staff: req.query.id,
      checkIn: {
        $gte: ss, // ex: 2020-11-25T00:00:00.00Z
        $lte: ee, // ex: 2020-11-25T23:59:59.00Z
      },
    });
    if (!attendance) {
      return res.status(404).json({ error: "Attendance not found" });
    }
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/findallv2", auth, async (req, res) => {
  try {
    const { name, staffCode, branch, startDate, endDate } = req.body;

    const filters = { isDeleted: { $ne: true } };
    if (name) filters.name = new RegExp(name, "i");
    if (staffCode) filters.staffCode = new RegExp(staffCode, "i");
    if (branch) filters.branch = branch;
    if (startDate || endDate) {
      filters.checkIn = {};
      if (startDate) filters.checkIn.$gte = new Date(startDate);
      if (endDate) filters.checkIn.$lte = new Date(endDate);
    }

    if (
      req.user.uid !== "admin" &&
      !name &&
      !staffCode &&
      !branch &&
      !startDate &&
      !endDate
    ) {
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

    const attendance = await Attendance.find(filters)
      .populate({
        path: "branch",
        select: "branchName _id",
      })
      .populate({
        path: "staff",
        select: "name _id staffCode profileImageUrl",
      });

    res.send(attendance);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get all attendances
router.get("/", async (req, res) => {
  try {
    const attendances = await Attendance.find({ isDeleted: false })
      .populate({
        path: "branch",
        select: "branchName _id",
      })
      .populate({
        path: "staff",
        select: "name _id staffCode profileImageUrl allowOT allowOTDate",
      });
    res.json(attendances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a attendance by ID
router.get("/:id", async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ error: "Voucher not found" });
    }
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a attendance
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await Attendance.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!obj) {
      return res
        .status(404)
        .send({ status: false, message: "Attendance not found" });
    }
    res.status(200).send({ status: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post(
  "/mobile/checkin",
  uploads.single("checkInImage"),
  async (req, res) => {
    try {
      if (req.file === undefined) return res.send("you must select a file.");
      const checkInImageUrl = `${process.env.ATTENDANCE_IMAGES_URL}${req.file.filename}`;
      const { staff, action, branch, checkIn, checkOut, duration } = req.body;
      const staffObj = await Staff.findById(staff);
      const obj = new Attendance({
        staff,
        branch,
        checkIn: Date.now(),
        checkInImageUrl,
        allowOT: staffObj.allowOT,
      });
      await obj.save();
      await Staff.updateOne({ _id: staff }, { $set: { isInToday: true } });
      res.status(200).send({ status: true, message: "Ok", data: obj });
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

router.post(
  "/mobile/checkout",
  uploads.single("checkOutImage"),
  async (req, res) => {
    try {
      if (req.file === undefined) return res.send("you must select a file.");
      const checkOutImageUrl = `${process.env.ATTENDANCE_IMAGES_URL}${req.file.filename}`;
      const { staff, branch } = req.body;
      const checkOut = Date.now();
      let ss = new Date(new Date().setUTCHours(0, 0, 0));
      let ee = new Date(new Date().setUTCHours(23, 59, 59, 999));

      const attendance = await Attendance.findOne({
        staff: staff,
        branch: branch,
        checkIn: {
          $gte: ss, // ex: 2020-11-25T00:00:00.00Z
          $lte: ee, // ex: 2020-11-25T23:59:59.00Z
        },
      });

      if (!attendance) {
        return res.status(404).json({ error: "Attendance not found" });
      }

      const checkInDate = dayjs(attendance.checkIn);
      const checkOutDate = dayjs(checkOut);
      const diffInMs = checkOutDate.diff(checkInDate);
      const diffInHours = dayjs
        .duration(diffInMs)
        .format("H [hours] : m [minutes]");

      await Attendance.updateOne(
        {
          staff: staff,
          branch: branch,
          checkIn: {
            $gte: ss, // ex: 2020-11-25T00:00:00.00Z
            $lte: ee, // ex: 2020-11-25T23:59:59.00Z
          },
        },
        {
          $set: {
            checkOut: checkOut,
            checkOutImageUrl: checkOutImageUrl,
            duration: diffInHours,
          },
        }
      );
      await Staff.updateOne({ _id: staff }, { $set: { isOutToday: true } });
      res.status(200).send({ status: true, message: "Ok", data: attendance });
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

router.post("/mobile/update", upDateUploads.any(), async (req, res) => {
  try {
    const { action } = req.body;
    if (action == "CheckIn") {
      var files = req.files;
      var newCheckInImageUrl = "";
      if (files) {
        await files.forEach(function (file) {
          if (file.fieldname === "checkInImage" && file.filename) {
            newCheckInImageUrl = `${process.env.ATTENDANCE_IMAGES_URL}${file.filename}`;
          }
        });
        if (newCheckInImageUrl === "")
          return res.status(404).json({ message: "you must select a file." });
        const checkInImageUrl = newCheckInImageUrl;
        const { id } = req.body;
        const attendance = await Attendance.findByIdAndUpdate(
          id,
          {
            checkInImageUrl,
          },
          { new: false }
        );
        if (!attendance) {
          return res.status(404).json({ error: "Attendance not found" });
        }
        return res.status(200).send({ status: true, message: "Ok" });
      } else {
        return res.send("you must select a file.");
      }
    }
    if (action == "CheckOut") {
      var files = req.files;
      var newCheckOutImageUrl = "";
      if (files) {
        await files.forEach(function (file) {
          if (file.fieldname === "checkOutImage" && file.filename) {
            newCheckOutImageUrl = `${process.env.ATTENDANCE_IMAGES_URL}${file.filename}`;
          }
        });
        if (newCheckOutImageUrl === "")
          return res.status(404).json({ message: "you must select a file." });
        const checkOutImageUrl = newCheckOutImageUrl;
        const { id } = req.body;
        const attendance = await Attendance.findByIdAndUpdate(
          id,
          {
            checkOutImageUrl,
          },
          { new: false }
        );
        if (!attendance) {
          return res.status(404).json({ error: "Attendance not found" });
        }
        return res.status(200).send({ status: true, message: "Ok" });
      } else {
        return res.send("you must select a file.");
      }
    }
    return res.status(404).json({ error: "Attendance not found" });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/mobile/delete", async (req, res) => {
  try {
    const { action } = req.body;
    if (action === "CheckIn") {
      const { id, staff } = req.body;
      const result = await Attendance.deleteOne({ _id: id });
      await Staff.updateOne(
        { _id: staff },
        { $set: { isInToday: false, isOutToday: false } }
      );
      return res.status(200).send({ status: true, message: "Ok" });
    }
    if (action === "CheckOut") {
      const { id, staff } = req.body;
      const attendance = await Attendance.findByIdAndUpdate(
        id,
        {
          checkOutImageUrl: null,
          checkOut: "",
          duration: "",
        },
        { new: false }
      );
      if (!attendance) {
        return res.status(404).json({ error: "Attendance not found" });
      }
      await Staff.updateOne({ _id: staff }, { $set: { isOutToday: false } });
      return res.status(200).send({ status: true, message: "Ok" });
    }
    return res.status(404).json({ error: "Attendance not found" });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
