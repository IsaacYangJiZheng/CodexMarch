const express = require("express");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const storage = multer.memoryStorage();
const uploads = multer({ storage });
const asyncHandler = require("express-async-handler");
const Messages = require("../../models/messages");
const router = express.Router();
const Members = require("../../models/members");
const Booking = require("../../models/booking");
const moment = require("moment");
const auth = require("./jwtfilter");
const mongoose = require("mongoose");

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
          asset_folder: "anran/banner", // Optional: specify a folder for the image
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

router.post(
  "/",
  uploads.single("image"),
  images_upload,
  auth,
  async (req, res) => {
    try {
      const max = await Messages.find({ $and: [{ isDeleted: { $eq: false } }] })
        .sort({ displayOrder: -1 })
        .limit(1);
      if (max.length > 0) {
        req.body.displayOrder = max[0].displayOrder + 1;
      }
      if (req.profile_image) {
        req.body.imageUrl = req.profile_image.url;
        req.body.imageDataUrl = req.profile_image.public_id;
      }
      const {
        msg,
        imageUrl,
        imageDataUrl,
        startDate,
        endDate,
        messageType,
        msgName,
        msgCode,
        msgBgColor,
        statusActive,
        always,
        displayOrder,
        publish,
      } = req.body;
      const obj = new Messages({
        msg,
        imageUrl,
        imageDataUrl,
        startDate,
        endDate,
        messageType,
        msgContentType: messageType,
        msgName,
        msgCode,
        msgBgColor,
        statusActive,
        always,
        displayOrder,
        publish,
      });
      await obj.save();
      res.status(200).send({ status: true, message: "Ok" });
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

// change sorting order banner
router.post("/reorder", async (req, res) => {
  const { messages } = req.body;
  try {
    for (var i = 0; i < messages.length; i++) {
      const message = await Messages.findById(messages[i]);
      message.displayOrder = i + 1;
      await message.save();
    }
    res.status(201).json({ code: "ok" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all messages
router.get("/", async (req, res) => {
  try {
    const sort = { displayOrder: 1 };
    const messages = await Messages.find({
      isDeleted: false,
      publish: true,
    }).sort(sort);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/web", async (req, res) => {
  try {
    const sort = { displayOrder: 1 };
    const messages = await Messages.find({
      isDeleted: false,
    }).sort(sort);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put(
  "/:id",
  uploads.single("image"),
  images_upload,
  auth,
  async (req, res) => {
    try {
      const { id } = req.params;
      if (req.profile_image) {
        req.body.imageUrl = req.profile_image.url;
        req.body.imageDataUrl = req.profile_image.public_id;
      }
      const {
        msg,
        imageUrl,
        imageDataUrl,
        startDate,
        endDate,
        messageType,
        msgName,
        msgCode,
        msgBgColor,
        statusActive,
        always,
        displayOrder,
        publish,
      } = req.body;
      const obj = await Messages.findByIdAndUpdate(
        id,
        {
          msg,
          imageUrl,
          imageDataUrl,
          startDate,
          endDate,
          messageType,
          msgName,
          msgCode,
          msgBgColor,
          statusActive,
          always,
          displayOrder,
          publish,
        },
        { new: true }
      );
      res.status(200).send({ status: true, message: "Ok" });
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await Messages.findById(id);
    res.send(obj);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/findall", async (req, res) => {
  try {
    const { first, rows, filters, sortField, sortOrder } = req.body;
    let filterQuery = [];
    if (filters) {
      Object.keys(filters).forEach((e) => {
        if (filters[e].value && filters[e].value && e === "msg") {
          let newObject = {};
          newObject[e] = {
            $regex: ".*" + filters[e].value + ".*",
            $options: "i",
          };
          filterQuery.push(newObject);
        } else if (
          filters[e].value &&
          filters[e].value &&
          e === "status_active"
        ) {
          let newObject = {};
          newObject[e] = { $eq: filters[e].value === "Active" };
          filterQuery.push(newObject);
        } else if (filters[e].value && filters[e].value && e === "msg_type") {
          let newObject = {};
          newObject[e] = {
            $regex: ".*" + filters[e].value + ".*",
            $options: "i",
          };
          filterQuery.push(newObject);
        } else if (filters[e].value && filters[e].value && e === "sortorder") {
          let newObject = {};
          newObject[e] = { $eq: filters[e].value };
          filterQuery.push(newObject);
        }
      });
    }
    let sortQuery = {};
    if (sortField) {
      if (sortField === "msg") {
        sortQuery["msg"] = sortOrder === 1 ? "asc" : "desc";
      } else if (sortField === "status_active") {
        sortQuery["status_active"] = sortOrder === 1 ? "asc" : "desc";
      } else if (sortField === "sortorder") {
        sortQuery["sortorder"] = sortOrder === 1 ? "asc" : "desc";
      } else if (sortField === "msg_type") {
        sortQuery["msg_type"] = sortOrder === 1 ? "asc" : "desc";
      }
    }
    if (filters && filterQuery.length > 0) {
      const obj = {
        data: await Messages.find({
          $and: filterQuery,
        })
          .sort(sortQuery)
          .limit(rows)
          .skip(first),
        totalRecords: await Messages.find({
          $and: filterQuery,
        }).countDocuments(),
      };
      res.send(obj);
    } else {
      const obj = {
        data: await Messages.find({}).sort(sortQuery).limit(rows).skip(first),
        totalRecords: await Messages.find({}).countDocuments(),
      };
      res.send(obj);
    }
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

router.post("/findallmembermsgMobile", async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    let obj = [];
    const member = await Members.findOne({ mobileNumber });
    let sortQuery = { sortorder: "asc" };
    if (member) {
      const messages = await Messages.find({
        $and: [{ status_active: { $eq: true } }],
      }).sort(sortQuery);
      const bookings = await Booking.find({
        member: member._id,
        start: {
          $gte: moment().startOf("day").toDate(),
          $lt: moment().endOf("day").toDate(),
        },
      });
      let bookingmessage;
      if (messages && messages.length > 0) {
        messages.forEach((msg) => {
          if (msg.msg_type === "WELCOME") {
            msg.msg = msg.msg.replace("&lt;MemberName&gt;", member.member_name);
            obj.push(msg);
          } else if (msg.msg_type === "BOOKING") {
            bookingmessage = msg;
          } else if (msg.msg_type === "GREETING") {
            obj.push(msg);
          } else if (msg.msg_type === "WISHES" && member.dob) {
            const formattedDob = moment(member.dob).format("MM/DD");
            const today = moment().format("MM/DD");
            if (formattedDob === today) {
              msg.msg = msg.msg.replace(
                "&lt;MemberName&gt;",
                member.member_name
              );
              obj.push(msg);
            }
            obj.push(msg);
          }
        });
      }
      if (bookingmessage && bookings.length > 0) {
        bookings.forEach((booking) => {
          const formattedMessage = bookingmessage.msg
            .replace("&lt;MemberName&gt;", member.member_name)
            .replace(
              "&lt;BookingDate&gt;",
              moment(booking.booking_date).format("MM/DD/YYYY")
            )
            .replace(
              "&lt;BookingTime&gt;",
              moment(booking.start).format("h:mm")
            );
          obj.push({ ...bookingmessage, msg: formattedMessage });
        });
      }
    } else {
      const defaultmessage = {
        msg: "Welcome to Anran Wellness",
        image_url: null,
      };
      obj.push(defaultmessage);
    }
    res.send(obj);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Delete a message
router.delete("/:id", async (req, res) => {
  try {
    const message = await Messages.updateOne(
      { _id: req.params.id },
      {
        $set: { isDeleted: true },
      }
    );
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/deletev2/:id", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Find the message to delete
    const message = await Messages.findOne({ _id: req.params.id }).session(session);
    if (!message) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Message not found" });
    }

    // Mark the message as deleted
    await Messages.updateOne(
      { _id: req.params.id },
      { $set: { isDeleted: true } }
    ).session(session);

    // Shift subsequent messages' sort orders
    await Messages.updateMany(
      { displayOrder: { $gt: message.displayOrder }, isDeleted: false },
      { $inc: { displayOrder: -1 } }
    ).session(session);

    await session.commitTransaction();
    res.json({ message: "Message deleted and display orders updated" });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;
