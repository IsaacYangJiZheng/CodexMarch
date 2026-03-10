const express = require("express");
const MemberNotification = require("../../models/memberNotifications");
const MemberBooking = require("../../models/memberBooking");
const Members = require("../../models/members");
const MemberDevices = require("../../models/memberDevice");
const AppVersion = require("../../models/appVersion");
const router = express.Router();
const auth = require("./jwtfilter");
const { convertMalaysiaTZ } = require("../../helper/utils");
const dayjs = require("dayjs");

// Get all member notifications
router.get("/member/list", async (req, res) => {
  try {
    const sort = { sendAt: -1 };
    const notifications = await MemberNotification.find({
      isDeleted: false,
    }).sort(sort);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all notifications by type by member
router.get("/member/announcement/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const obj = await MemberNotification.find({
      member: { $eq: id },
      notificationType: { $eq: "announcement" },
    }).sort({ sendAt: -1 });
    const unReadCount = await MemberNotification.find({
      member: { $eq: id },
      notificationType: { $eq: "announcement" },
      isRead: { $eq: false },
    }).countDocuments();
    const result = {
      notification: obj,
      unReadCount: unReadCount,
    };
    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get all reminder by member
router.get("/member/reminder/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date();
    const endUTC = new Date(now.getTime() - 8 * 60 * 60 * 1000);
    const startUTC = new Date(endUTC.getTime() - 31 * 24 * 60 * 60 * 1000);
    const obj = await MemberNotification.find({
      member: { $eq: id },
      notificationType: { $eq: "reminder" },
      sendAt: { $gte: startUTC, $lte: endUTC },
    }).sort({ sendAt: -1 });
    const unReadCount = await MemberNotification.find({
      member: { $eq: id },
      notificationType: { $eq: "reminder" },
      isRead: { $eq: false },
      sendAt: { $gte: startUTC, $lte: endUTC },
    }).countDocuments();
    const result = {
      notification: obj,
      unReadCount: unReadCount,
    };
    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Delete a notification
router.delete("/member/:id", async (req, res) => {
  try {
    const notification = await MemberNotification.updateOne(
      { _id: req.params.id },
      {
        $set: { isDeleted: true },
      }
    );
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const isRead = true;
    const readAt = Date.now();
    const obj = await MemberNotification.findByIdAndUpdate(
      id,
      {
        readAt,
        isRead,
      },
      { new: false }
    );
    res.send(obj);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/member/count/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const unReadCount1 = await MemberNotification.find({
      member: { $eq: id },
      notificationType: { $eq: "reminder" },
      isRead: { $eq: false },
    }).countDocuments();
    const unReadCount2 = await MemberNotification.find({
      member: { $eq: id },
      notificationType: { $eq: "announcement" },
      isRead: { $eq: false },
    }).countDocuments();
    const totalCount = unReadCount1 + unReadCount2;
    const result = {
      total: totalCount,
      reminderCount: unReadCount1,
      announcementCount: unReadCount2,
    };
    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

// register member device information
router.post("/device/info/set", auth, async (req, res) => {
  try {
    const { mobileNumber } = req.user;
    if (mobileNumber) {
      const member = await Members.findOne({
        mobileNumber: req.user.mobileNumber,
      });
      const memberDevice = await MemberDevices.findOne({
        user: member._id,
        token: req.body.token,
      });
      if (memberDevice) {
        // if (memberDevice.arn) {
        //   device.register();
        // } else {
        //   device.refresh();
        // }
        res.status(200).send({ status: true, message: "Ok" });
      } else {
        let device_obj = {
          token: req.body.token,
          user: member._id,
          os: req.body.platform,
          appName: req.body.appName,
          packageName: req.body.packageName,
          version: req.body.version,
          buildNumber: req.body.buildNumber,
          buildSignature: req.body.buildSignature,
          installerStore: req.body.installerStore,
        };
        const device = new MemberDevices(device_obj);
        await device.save();
        res.status(200).send({ status: true, message: "Ok" });
      }
    } else {
      res
        .status(500)
        .send({ status: false, message: "Auth Token User Not Found" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// un-register member device information
router.post("/device/info/remove", auth, async (req, res) => {
  try {
    const { mobileNumber } = req.user;
    if (mobileNumber) {
      const member = await Members.findOne({
        mobileNumber: req.user.mobileNumber,
      });
      await MemberDevices.deleteMany({ user: member._id });
      res.status(200).send({ status: true, message: "Ok" });
    } else {
      res.status(500).send({ status: false, message: "User Not Found" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/temp/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const memberBooking = await MemberBooking.findById(id);
    const sDate = dayjs(convertMalaysiaTZ(memberBooking.start)).format(
      "DD/MM/YYYY"
    );
    const sTime = dayjs(convertMalaysiaTZ(memberBooking.start)).format(
      "hh:mm a"
    );
    const eTime = dayjs(convertMalaysiaTZ(memberBooking.end)).format("hh:mm a");
    let msg = `Booking confirmed. Date: ${sDate}, Time: ${sTime} - ${eTime}. Please come 15 mins before the session. `;
    res.send({ message: msg });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// router.get("/version/latest/:os/:packageName", async (req, res) => {
//   try {
//     const { packageName, os } = req.params;
//     const appVersion = await AppVersion.findOne({
//       status: true,
//       packageName: packageName,
//       os: os,
//     });
//     if (appVersion) {
//       res.send({
//         version: appVersion.version,
//         forceUpdate: appVersion.forceUpdate,
//       });
//     } else {
//       res.send({ version: "1.0.0", forceUpdate: false });
//     }
//   } catch (error) {
//     res.send({ version: "1.0.0", forceUpdate: false });
//   }
// });

router.get(
  "/version/latest/android/com.visualogic.anranwellness",
  async (req, res) => {
    try {
      const { packageName, os } = req.query;
      if (os == null) {
        const appVersion = await AppVersion.findOne({
          status: true,
          packageName: 'com.visualogic.anranwellness',
          os: 'android',
        });
        if (appVersion) {
          res.send({
            version: appVersion.version,
            forceUpdate: appVersion.forceUpdate,
          });
        } else {
          res.send({ version: "1.0.0", forceUpdate: false });
        }
      } else {
        const appVersion = await AppVersion.findOne({
          status: true,
          packageName: packageName,
          os: os,
        });
        if (appVersion) {
          res.send({
            version: appVersion.version,
            forceUpdate: appVersion.forceUpdate,
          });
        } else {
          res.send({ version: "1.0.0", forceUpdate: false });
        }
      }
    } catch (error) {
      res.send({ version: "1.0.0", forceUpdate: false });
    }
  }
);

router.get(
  "/version/latest/ios/com.visualogic.anranwellness.member",
  async (req, res) => {
    try {
      const { packageName, os } = req.query;
      if (os == null) {
        const appVersion = await AppVersion.findOne({
          status: true,
          packageName: 'com.visualogic.anranwellness.member',
          os: 'ios',
        });
        if (appVersion) {
          res.send({
            version: appVersion.version,
            forceUpdate: appVersion.forceUpdate,
          });
        } else {
          res.send({ version: "1.0.0", forceUpdate: false });
        }

      } else {
        const appVersion = await AppVersion.findOne({
          status: true,
          packageName: packageName,
          os: os,
        });
        if (appVersion) {
          res.send({
            version: appVersion.version,
            forceUpdate: appVersion.forceUpdate,
          });
        } else {
          res.send({ version: "1.0.0", forceUpdate: false });
        }
      }
    } catch (error) {
      res.send({ version: "1.0.0", forceUpdate: false });
    }
  }
);

module.exports = router;
