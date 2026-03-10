const express = require("express");
const Branch = require("../../models/branch");
const Floor = require("../../models/floor");
const Member = require("../../models/members");
const Rooms = require("../../models/rooms");
const BranchFinance = require("../../models/branchFinance");
const BlockBooking = require("../../models/blockBooking");
const Tax = require("../../models/tax");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const storage = multer.memoryStorage();
const uploads = multer({ storage });
const asyncHandler = require("express-async-handler");
const router = express.Router();
const { checkBookingCount } = require("../../helper/functions");
const auth = require("./jwtfilter");
const { getBranchesByUser } = require("./utils");
const dayjs = require("dayjs");
const { convertUTCtoMalaysiaTZ } = require("../../helper/utils");

//Updated Upload Function
const images_upload = asyncHandler(async (req, res, next) => {
  try {
    // Configuration
    cloudinary.config({
      cloud_name: "dbvko8htd",
      api_key: "885224681677386",
      api_secret: "GsSiBCqOrCSYDA97WVZaaVuyFnc",
    });
    const file = req.file;
    if (!file) {
      return next();
    }
    const name = `${Date.now()}-${file.originalname}`.replace(/\.[^/.]+$/, "");

    // Upload the file buffer directly to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          asset_folder: "anran", // Optional: specify a folder for the image
          resource_type: "image",
          public_id: `${name}`, // Set the public_id for the image
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Write the buffer to the stream
      uploadStream.end(file.buffer);
    });

    const profile_image = {
      public_id: uploadResult.public_id,
      url: uploadResult.secure_url,
    };

    req.profile_image = profile_image;
    return next();
  } catch (error) {
    // console.error(error);
    req.profile_image = null;
    return next();
  }
});

// Create a new branch
router.post("/", uploads.single("image"), images_upload, async (req, res) => {
  try {
    const existingBranchMobilePrefix = await Branch.findOne({
      branchMobilePrefix: req.body.branchMobilePrefix,
    });
    if (existingBranchMobilePrefix) {
      return res
        .status(400)
        .json({ message: "This mobile prefix is already in use" });
    }
    if (req.profile_image) {
      req.body.imageUrl = req.profile_image.url;
      req.body.imageData = req.profile_image.public_id;
    }
    const max = await Branch.find({ $and: [{ isDeleted: { $eq: false } }] })
      .sort({ branchOrder: -1 })
      .limit(1);
    if (max.length > 0) {
      req.body.branchOrder = max[0].branchOrder + 1;
    }
    const branch = new Branch(req.body);
    await branch.save();
    res.status(201).json(branch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new branch
router.post("/reorder", async (req, res) => {
  const { branches } = req.body;
  try {
    for (var i = 0; i < branches.length; i++) {
      const branch = await Branch.findById(branches[i]);
      branch.branchOrder = i + 1;
      await branch.save();
    }
    res.status(201).json({ code: "ok" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/branchTax/", async (req, res) => {
  try {
    const branchId = req.query.id;
    let taxCode = "SST";
    let taxRate = 0.0;
    let taxValue = "0";

    if (branchId != null) {
      const taxData = await Tax.find({
        branch: branchId,
        isDeleted: false,
      }).sort({ effectiveDate: -1 });

      for (const tax of taxData) {
        const effectiveDate = new Date(tax.effectiveDate);
        const today = new Date();

        if (today >= effectiveDate) {
          taxCode = tax.taxType;
          taxValue = tax.taxValue;
          const taxRateTemp = parseFloat(tax.taxValue).toFixed(2);
          taxRate = (taxRateTemp / 100).toFixed(3);
          break;
        }
      }
    }
    res.json({ taxCode, taxRate, taxValue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new branch
router.post("/finance", async (req, res) => {
  try {
    const branchFinance = new BranchFinance(req.body);
    await branchFinance.save();
    res.status(201).json(branchFinance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all branches with out HQ
router.get("/", async (req, res) => {
  try {
    const sort = { branchOrder: 1 };
    const branches = await Branch.find({
      isDeleted: false,
      branchStatus: true,
      hqStatus: false,
    })
      .sort(sort)
      .populate({
        path: "area",
        select: "areaName _id",
      });
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/web", async (req, res) => {
  try {
    const sort = { branchName: 1 };
    const branches = await Branch.find({
      isDeleted: false,
      branchStatus: true,
      hqStatus: false,
    })
      .sort(sort)
      .populate({
        path: "area",
        select: "areaName _id",
      });
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all branches
router.get("/role-based", auth, async (req, res) => {
  try {
    if (req.user.uid === "admin") {
      const sort = { branchName: 1 };
      const branches = await Branch.find({
        isDeleted: false,
        branchStatus: true,
        hqStatus: false,
      })
        .sort(sort)
        .populate({
          path: "area",
          select: "areaName _id",
        });
      res.json(branches);
    } else {
      const { user } = req;
      let filterQuery = [];
      if (user) {
        const branchList = await getBranchesByUser(user.username);
        if (branchList?.length > 0)
          filterQuery.push({
            _id: { $in: branchList.map((branch) => branch._id) },
            hqStatus: false,
            branchStatus: true,
          });
      }
      let query = filterQuery.length > 0 ? { $and: filterQuery } : {};
      const sort = { branchOrder: 1 };
      const branches = await Branch.find(query).sort(sort).populate({
        path: "area",
        select: "areaName _id",
      });
      res.json(branches);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/findAll", async (req, res) => {
  try {
    const { area, branchName, branchStatus, hqStatus } = req.body;
    const filters = {};

    if (area) filters["area"] = area;
    if (branchName) filters["branchName"] = new RegExp(branchName, "i");
    if (branchStatus)
      filters["branchStatus"] = branchStatus === "active" ? true : false;
    if (hqStatus) {
      if (hqStatus === "hq") {
        filters["hqStatus"] = true;
      } else if (hqStatus === "franchise") {
        filters["isFranchise"] = true;
      }
    }

    // Find branches based on the filters
    const sort = { branchOrder: 1 };
    const branches = await Branch.find(filters).sort(sort).populate({
      path: "area",
      select: "areaName _id",
    });

    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a branch by ID
router.get("/:id", async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id).populate({
      path: "area",
    });
    // console.log("branch");
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }
    res.json(branch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a branch
router.put("/:id", uploads.single("image"), images_upload, async (req, res) => {
  try {
    const existingBranchMobilePrefix = await Branch.findOne({
      branchMobilePrefix: req.body.branchMobilePrefix,
    });
    if (existingBranchMobilePrefix) {
      if (existingBranchMobilePrefix._id != req.body.id) {
        return res.status(400).json({
          message: "This mobile prefix is already in use for another branch",
        });
      }
    }
    if (req.profile_image) {
      req.body.imageUrl = req.profile_image.url;
      req.body.imageData = req.profile_image.public_id;
    }
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }
    res.json(branch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a branch
router.delete("/:id", async (req, res) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) {
      return res.status(404).json({ error: "Branch not found" });
    }
    res.json({ message: "Branch deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a branch by ID
router.post("/timeslots", async (req, res) => {
  try {
    const { id, bookingDate } = req.body;
    const branch = await Branch.findById(id).select(
      "_id branchName operatingStart operatingEnd"
    );
    if (!branch) {
      return res.status(404).json({ error: "Branch not found" });
    }
    if (true) {
      var obj = {
        branch: branch,
        times: null,
      };
      return res.json(obj);
    }
    const rooms = await Rooms.find({
      branch: branch._id,
      status_active: true,
    }).populate({
      path: "floor",
      select: "floorNo _id",
    });
    var timeSlots = await getTimeSlotsForDay(branch, bookingDate, rooms);
    var obj = {
      branch: branch,
      times: timeSlots,
    };
    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/timeslots/:id", async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id).select(
      "_id branchName operatingStart operatingEnd"
    );
    if (!branch) {
      return res.status(404).json({ error: "Branch not found" });
    }
    var timeSlots = await getInstantBookingTimeSlotsForDay(branch);
    var obj = {
      times: timeSlots,
    };
    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

var GoogleCalenderAppointments = null;
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

async function getInstantBookingTimeSlotsForDay(branch) {
  let result = [];

  let now = dayjs(); // Current time
  let today = now.startOf("day");

  let operatingStart = dayjs.utc(branch.operatingStart, "HH:mm").local();
  let operatingEnd = dayjs.utc(branch.operatingEnd, "HH:mm").local();
  let operatingStartHrs = operatingStart.hour();
  let operatingEndHrs = operatingEnd.hour();

  // Set starting time to next available hour
  let nextHour = now.startOf("hour").add(1, "hour"); // Next full hour
  let currentHour = now.startOf("hour"); // Current full hour

  let dayStart = now.minute() >= 50 ? nextHour : currentHour;

  if (dayStart.hour() >= operatingEndHrs) {
    return result; // No available slots left
  }

  // Ensure it does not start before operating hours
  if (dayStart.hour() < operatingStartHrs) {
    dayStart = dayStart.set("hour", operatingStartHrs);
  }

  let dayEnd = today.set("hour", operatingEndHrs);

  let currentSlot = dayStart;

  while (currentSlot.isBefore(dayEnd)) {
    result.push(currentSlot.toISOString());
    currentSlot = currentSlot.add(1, "hour");
  }

  return result;
}

async function getTimeSlotsForDay(branch, date, rooms) {
  var result = {};
  // Get today's date
  var todaysDate = new Date();
  var dayStart = new Date(date);
  var dayEnd = new Date(date);
  var operatingStart = new Date(branch.operatingStart + " UTC");
  var operatingStartHrs = operatingStart.getHours();
  var operatingEnd = new Date(branch.operatingEnd + " UTC");
  var operatingEndHrs = operatingEnd.getHours();
  // call setHours to take the time out of the comparison
  if (dayStart.setHours(0, 0, 0, 0) == todaysDate.setHours(0, 0, 0, 0)) {
    // Date equals today's date
    var now = new Date();
    const hoursToAdd = 1 * 60 * 60 * 1000;
    now.setTime(now.getTime() + hoursToAdd);
    var hr = now.getHours();
    if (hr >= operatingEndHrs) {
      dayStart.setHours(operatingEndHrs, 0, 0, 0);
      return result;
    } else {
      if (hr > operatingStartHrs) {
        dayStart.setHours(hr, 0, 0, 0);
      } else {
        dayStart.setHours(operatingStartHrs);
      }
    }

    dayEnd.setHours(operatingEndHrs);
  } else {
    dayStart.setHours(operatingStartHrs);
    dayEnd.setHours(operatingEndHrs);
  }
  do {
    if (!checkGoogleCalendarConflict(dayStart)) {
      var dateStr = new Date(dayStart).toString();
      var dateUTC = new Date(dateStr + " UTC");
      result[dateUTC.toISOString()] = [];
      // result[new Date(dayStart)] = [];
      for (const room of rooms) {
        let robj = {};
        robj.roomNo = room.room_no;
        robj.roomId = room._id;
        robj.roomImage = room.room_floor_url;
        robj.gender = room.room_gender;
        robj.floorNo = room.floor.floorNo;
        robj.floorId = room.floor._id;
        robj.floorImage = room.floor.floorImage ? room.floor.floorImage : "";
        robj.availableCount = 0;
        robj.roomCapacity = room.roomCapacity;
        const { blockedMaleCount, blockedFemaleCount, bookingId } =
          await checkBookingCount(room._id, new Date(dateStr));
        total_count = blockedMaleCount + blockedFemaleCount;
        if (total_count >= room.roomCapacity) {
          robj.availableCount = 0;
        } else {
          robj.availableCount = room.roomCapacity - total_count;
        }
        result[dateUTC.toISOString()].push(robj);
      }
    }
    dayStart.setHours(dayStart.getHours(), dayStart.getMinutes() + 60);
  } while (dayStart < dayEnd);
  return result;
}

async function getTimeSlotsForDayV2(branch, parmDate, rooms) {
  // console.log("getTimeSlotsForDayV2", branch, parmDate, rooms);
  var result = {};
  // Get today's date
  var todaysDate = new Date();
  var dayStart = new Date(parmDate);
  var dayEnd = new Date(parmDate);
  var blockdate1 = new Date(parmDate);
  var operatingStart = new Date(branch.operatingStart + " UTC");
  var operatingStartHrs = operatingStart.getHours();
  var operatingEnd = new Date(branch.operatingEnd + " UTC");
  var operatingEndHrs = operatingEnd.getHours();

  // call setHours to take the time out of the comparison
  if (dayStart.setHours(0, 0, 0, 0) == todaysDate.setHours(0, 0, 0, 0)) {
    // Date equals today's date
    var now = new Date();
    const hoursToAdd = 1 * 60 * 60 * 1000;
    now.setTime(now.getTime() + hoursToAdd);
    var hr = now.getHours();
    if (hr >= operatingEndHrs) {
      dayStart.setHours(operatingEndHrs, 0, 0, 0);
      return result;
    } else {
      if (hr > operatingStartHrs) {
        dayStart.setHours(hr, 0, 0, 0);
      } else {
        dayStart.setHours(operatingStartHrs);
      }
    }

    dayEnd.setHours(operatingEndHrs);
  } else {
    dayStart.setHours(operatingStartHrs);
    dayEnd.setHours(operatingEndHrs);
  }
  const blockDayStart = new Date(new Date(blockdate1).setHours(0, 0, 0, 0));
  const blockDayEnd = new Date(new Date(blockdate1).setHours(23, 59, 59, 999));
  do {
    if (!checkGoogleCalendarConflict(dayStart)) {
      var dateStr = new Date(dayStart).toString();
      var dateStr1 = new Date(dayStart).toUTCString();
      var dateUTC = new Date(dateStr + " UTC");
      result[dateUTC.toISOString()] = [];
      // result[new Date(dayStart)] = [];
      var blocktimeslot = await getTimeSlotsFormat(dayStart);
      for (const room of rooms) {
        // Find all block bookings for the branch and floor that overlap with the date
        const blocks = await BlockBooking.countDocuments({
          branch,
          room: { $in: [room._id] },
          blockingStatus: "Scheduled",
          // blockingStart: { $gte: blockdate1, $lte: blockdate1 },
          // blockingEnd: { $gte: blockdate1, $lte: blockdate1 },
          blockTimeSlot: { $in: [blocktimeslot] },
          $or: [
            {
              blockingStart: { $lte: blockDayEnd },
              blockingEnd: { $gte: blockDayStart },
            },
            { blockingStart: { $gte: blockDayStart, $lte: blockDayEnd } },
            { blockingEnd: { $gte: blockDayStart, $lte: blockDayEnd } },
          ],
        });
        if (blocks == 0) {
          let robj = {};
          robj.roomNo = room.room_no;
          robj.roomId = room._id;
          robj.roomImage = room.room_floor_url;
          robj.gender = room.room_gender;
          robj.floorNo = room.floor.floorNo;
          robj.floorId = room.floor._id;
          robj.floorImage = room.floor.floorImage ? room.floor.floorImage : "";
          robj.availableCount = 0;
          robj.roomCapacity = room.roomCapacity;
          robj.blocktimeslot = blocktimeslot;
          robj.blocked = false;
          const { blockedMaleCount, blockedFemaleCount, bookingId } =
            await checkBookingCount(room._id, new Date(dateStr));
          total_count = blockedMaleCount + blockedFemaleCount;
          if (total_count >= room.roomCapacity) {
            robj.availableCount = 0;
          } else {
            robj.availableCount = room.roomCapacity - total_count;
          }
          result[dateUTC.toISOString()].push(robj);
        } else {
          let robj = {};
          robj.roomNo = room.room_no;
          robj.roomId = room._id;
          robj.roomImage = room.room_floor_url;
          robj.gender = room.room_gender;
          robj.floorNo = room.floor.floorNo;
          robj.floorId = room.floor._id;
          robj.floorImage = room.floor.floorImage ? room.floor.floorImage : "";
          robj.availableCount = 0;
          robj.blocked = true;
          robj.blocktimeslot = blocktimeslot;
          result[dateUTC.toISOString()].push(robj);
        }
      }
    }
    dayStart.setHours(dayStart.getHours(), dayStart.getMinutes() + 60);
  } while (dayStart < dayEnd);
  return result;
}

// async function getTimeSlotsFormat(timeslot) {
//   var localStartDate = convertUTCtoMalaysiaTZ(timeslot);
//   var localEndDate = convertUTCtoMalaysiaTZ(timeslot);
//   var hh = localStartDate.hour().toString();
//   // var mm = timeslot.getMinutes().toString();
//   // var endStart = new Date(timeslot);
//   // localEndDate.setHours(
//   //   localStartDate.hour(),
//   //   localStartDate.getMinutes() + 60
//   // );
//   localEndDate = localEndDate.add(1, "hours");
//   var hh1 = localEndDate.hour().toString();
//   // var mm1 = endStart.getMinutes().toString();
//   var blocktime = hh + ":00-" + hh1 + ":00";
//   return blocktime;
// }

async function getTimeSlotsFormat(timeslot) {
  var localStartDate = convertUTCtoMalaysiaTZ(timeslot);
  var localEndDate = convertUTCtoMalaysiaTZ(timeslot);
  var hh = localStartDate.hour().toString().padStart(2, "0");
  localEndDate = localEndDate.add(1, "hours");
  var hh1 = localEndDate.hour().toString().padStart(2, "0");
  var blocktime = hh + ":00-" + hh1 + ":00";
  return blocktime;
}

// function getTimeSlotsForDay(branch, date, rooms) {
//   // https://stackoverflow.com/questions/31884340/create-array-of-available-time-slots-between-two-dates
//   var timeSlots = [];
//   var dayStart = new Date(date);
//   var dayEnd = new Date(date);
//   var operatingStart = new Date(branch.operatingStart + " UTC");
//   var operatingStartHrs = operatingStart.getHours();
//   var operatingEnd = new Date(branch.operatingEnd + " UTC");
//   var operatingEndHrs = operatingEnd.getHours();

//   dayStart.setHours(operatingStartHrs);
//   dayEnd.setHours(operatingEndHrs);
//   do {
//     if (!checkGoogleCalendarConflict(dayStart)) {
//       var dateStr = new Date(dayStart).toString();
//       timeSlots.push(new Date(dateStr + " UTC"));
//       // timeSlots.push(new Date(dateStr));
//     }
//     dayStart.setHours(dayStart.getHours(), dayStart.getMinutes() + 60);
//   } while (dayStart < dayEnd);

//   return timeSlots;
// }

router.post("/generate-dummy-local-number", async (req, res) => {
  try {
    // Step 1: Find the branch using the provided id
    const branch = await Branch.findById(req.body.branch);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    // Step 2: Get the branchMobilePrefix
    let branchMobilePrefix = branch.branchMobilePrefix; // e.g., '02'

    if (!branchMobilePrefix) {
      return res
        .status(400)
        .json({ message: "Branch mobile prefix not found" });
    }

    // Step 3: Generate the base mobile number using the branchMobilePrefix
    if (branchMobilePrefix.length == 1) {
      branchMobilePrefix = "0" + branchMobilePrefix;
    }

    const baseMobileNumber = `6019${branchMobilePrefix}0000`; // Format: '6019' + branchMobilePrefix + '0000'

    // Step 4: Find the latest member number with the same mobile prefix
    const latestMember = await Member.findOne({
      mobileNumber: new RegExp(`6019${branchMobilePrefix}`),
    }).sort({ mobileNumber: -1 }); // Sort by mobileNumber in descending order

    let newMobileNumber = baseMobileNumber + "01"; // Default to the first number if no members are found

    if (latestMember) {
      const latestNumber = latestMember.mobileNumber;
      const sequence = latestNumber.slice(-6); // Extract last 2 digits of the mobile number
      const newSequence = (parseInt(sequence, 10) + 1)
        .toString()
        .padStart(6, "0"); // Increment and pad to 2 digits
      newMobileNumber = `6019${branchMobilePrefix}${newSequence}`; // Generate new mobile number
    }

    // Step 5: Return the generated mobile number
    return res.status(200).json({ mobileNumber: newMobileNumber });
  } catch (error) {
    // console.error("Error generating dummy local number:", error);
    return res.status(500).json({ message: error.message });
  }
});

// Get a branch by ID
router.post("/mobile/timeslots", async (req, res) => {
  try {
    const { id, bookingDate } = req.body;
    // console.log("req", req.body);
    const branch = await Branch.findById(id).select(
      "_id branchName operatingStart operatingEnd"
    );
    if (!branch) {
      return res.status(404).json({ error: "Branch not found" });
    }
    const rooms = await Rooms.find({
      branch: branch._id,
      status_active: true,
    }).populate({
      path: "floor",
      select: "floorNo _id",
    });
    var timeSlots = await getTimeSlotsForDayV2(branch, bookingDate, rooms);
    var obj = {
      branch: branch,
      times: timeSlots,
    };
    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
