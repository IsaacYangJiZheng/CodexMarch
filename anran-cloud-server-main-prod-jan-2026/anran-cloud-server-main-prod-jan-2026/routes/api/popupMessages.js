const express = require("express");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const storage = multer.memoryStorage();
const uploads = multer({ storage });
const asyncHandler = require("express-async-handler");
const Messages = require("../../models/messages");
const PopupMessages = require("../../models/popupMessage");
const PopupMessageDetails = require("../../models/popupMessageDetail");
const MemberDeposit = require("../../models/memberDeposits");
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
      const max = await PopupMessages.find({
        $and: [{ isDeleted: { $eq: false } }],
      })
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
        messageContentType,
        imageUrl,
        imageDataUrl,
        startDate,
        endDate,
        statusActive,
        displayOrder,
        publish,
        messageDetails,
      } = req.body;
      let ss = new Date(new Date(startDate).setHours(16, 0, 0, 0));
      ss.setDate(ss.getDate() - 1);
      let ee = new Date(new Date(endDate).setHours(15, 59, 59, 999));
      const popup = new PopupMessages({
        messageContentType,
        imageUrl,
        imageDataUrl,
        startDate: ss,
        endDate: ee,
        statusActive,
        displayOrder,
        publish,
      });
      await popup.save();
      let parsedDetails = [];
      if (typeof messageDetails === "string") {
        parsedDetails = JSON.parse(messageDetails);
      } else {
        parsedDetails = messageDetails;
      }
      const detailIds = [];
      for (const detail of parsedDetails) {
        const newDetail = new PopupMessageDetails({
          popupMessageId: popup._id,
          messageTitle: detail.messageTitle,
          messageShortDescription: detail.messageShortDescription,
          messageContent: detail.messageContent,
          country: detail.country,
        });
        await newDetail.save();
        detailIds.push(newDetail._id);
      }
      popup.messageDetails = detailIds;
      await popup.save();
      res.status(200).send({ status: true, message: "Popup Message Created" });
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

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
        messageContentType,
        imageUrl,
        imageDataUrl,
        startDate,
        endDate,
        statusActive,
        displayOrder,
        publish,
        messageDetails,
      } = req.body;
      let ss = new Date(new Date(startDate).setHours(16, 0, 0, 0));
      ss.setDate(ss.getDate() - 1);
      let ee = new Date(new Date(endDate).setHours(15, 59, 59, 999));
      const popup = await PopupMessages.findByIdAndUpdate(
        id,
        {
          messageContentType,
          imageUrl,
          imageDataUrl,
          startDate: ss,
          endDate: ee,
          statusActive,
          displayOrder,
          publish,
        },
        { new: true }
      );
      if (!popup) {
        return res
          .status(404)
          .send({ status: false, message: "Popup not found" });
      }
      let parsedDetails = [];
      if (typeof messageDetails === "string") {
        parsedDetails = JSON.parse(messageDetails);
      } else {
        parsedDetails = messageDetails || [];
      }
      const detailIds = [];
      for (const detail of parsedDetails) {
        if (detail._id) {
          const updatedDetail = await PopupMessageDetails.findByIdAndUpdate(
            detail._id,
            {
              messageTitle: detail.messageTitle,
              messageShortDescription: detail.messageShortDescription,
              messageContent: detail.messageContent,
              country: detail.country,
            },
            { new: true }
          );
          if (updatedDetail) detailIds.push(updatedDetail._id);
        } else {
          const newDetail = new PopupMessageDetails({
            popupMessageId: id,
            messageTitle: detail.messageTitle,
            messageShortDescription: detail.messageShortDescription,
            messageContent: detail.messageContent,
            country: detail.country,
          });
          await newDetail.save();
          detailIds.push(newDetail._id);
        }
      }
      await PopupMessageDetails.deleteMany({
        popupMessageId: id,
        _id: { $nin: detailIds },
      });
      popup.messageDetails = detailIds;
      await popup.save();
      res
        .status(200)
        .send({ status: true, message: "Popup updated successfully" });
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

router.post("/reorder", async (req, res) => {
  const { popupMessages } = req.body;
  try {
    for (var i = 0; i < popupMessages.length; i++) {
      const popupMessage = await PopupMessages.findById(popupMessages[i]);
      popupMessage.displayOrder = i + 1;
      await popupMessage.save();
    }
    res.status(201).json({ code: "ok" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const sort = { displayOrder: 1 };
    const popupMessages = await PopupMessages.find({
      isDeleted: false,
      publish: true,
    }).sort(sort);
    res.json(popupMessages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/web", async (req, res) => {
  try {
    const popupMessages = await PopupMessages.aggregate([
      {
        $match: { isDeleted: false },
      },
      {
        $sort: { displayOrder: 1 },
      },
      {
        $lookup: {
          from: "popupmessagedetails",
          localField: "_id",
          foreignField: "popupMessageId",
          as: "messageDetails",
        },
      },
    ]);
    res.json(popupMessages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await PopupMessages.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: "popupmessagedetails",
          localField: "_id",
          foreignField: "popupMessageId",
          as: "messageDetails",
        },
      },
    ]);
    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/mobile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const hasDeposit = await MemberDeposit.exists({ payer: id });
    if (!hasDeposit) {
      return res.json([]);
    }
    const now = new Date();
    const malaysiaToday = new Date(
      now.getTime() + (8 * 60 - now.getTimezoneOffset()) * 60000
    );
    const validMessages = await PopupMessages.aggregate([
      {
        $match: {
          startDate: { $lte: malaysiaToday },
          endDate: { $gte: malaysiaToday },
          publish: true,
          isDeleted: false,
        },
      },
      {
        $sort: { displayOrder: 1 },
      },
      {
        $lookup: {
          from: "popupmessagedetails",
          localField: "_id",
          foreignField: "popupMessageId",
          as: "messageDetails",
        },
      },
    ]);
    res.json(validMessages);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/mobile/:id/:language", async (req, res) => {
  try {
    const { id, language } = req.params;
    const hasDeposit = await MemberDeposit.exists({ payer: id });
    if (!hasDeposit) {
      return res.json([]);
    }
    const today = new Date();
    const validMessages = await PopupMessages.aggregate([
      {
        $match: {
          startDate: { $lte: today },
          endDate: { $gte: today },
          publish: true,
          isDeleted: false,
        },
      },
      { $sort: { displayOrder: 1 } },
      {
        $lookup: {
          from: "popupmessagedetails",
          let: { popupId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$popupMessageId", "$$popupId"] },
                    { $eq: ["$country", language] },
                  ],
                },
              },
            },
          ],
          as: "messageDetails",
        },
      },
      {
        $match: { "messageDetails.0": { $exists: true } },
      },
    ]);

    res.json(validMessages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await PopupMessages.findById(id);
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

router.delete("/delete/:id", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the message to delete
    const popupMessage = await PopupMessages.findOne({
      _id: req.params.id,
    }).session(session);
    if (!popupMessage) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Message not found" });
    }

    // Mark the message as deleted
    await PopupMessages.updateOne(
      { _id: req.params.id },
      { $set: { isDeleted: true } }
    ).session(session);

    // Shift subsequent messages' sort orders
    await PopupMessages.updateMany(
      { displayOrder: { $gt: popupMessage.displayOrder }, isDeleted: false },
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
