const MemberNotification = require("../models/memberNotifications.js");
const memberDevice = require("../models/memberDevice.js");
const dayjs = require("dayjs");
const { fcmSender } = require("../controller/fcm/sender.js");
const {
  convertMalaysiaTZ,
  convertDateMalaysiaTZ,
  convertTimeMalaysiaTZ,
  convertDateTimeMalaysiaTZ,
} = require("../helper/utils");

async function sendBookingReminderNotification(memberBooking, info) {
  try {
    // const sDate = dayjs(memberBooking.start).format("DD/MM/YYYY");
    // const sTime = dayjs(memberBooking.start).format("hh:mm a");
    // const eTime = dayjs(memberBooking.end).format("hh:mm a");
    const sDate = convertDateMalaysiaTZ(memberBooking.start);
    const sTime = convertTimeMalaysiaTZ(memberBooking.start);
    const eTime = convertTimeMalaysiaTZ(memberBooking.end);
    let msg = `${info} : Reminder for your upcoming Booking which is scheduled at: ${sDate}, Time: ${sTime} - ${eTime}. `;
    let notificationDoc = {
      notificationCategory: "Booking",
      notificationType: "reminder",
      notificationTitle: "Booking Reminder",
      notificationMsg: msg,
      msgContentType: "text",
      status: "send",
      member: memberBooking.member,
      entityName: "memberBooking",
      entityId: memberBooking._id,
    };
    const notification = new MemberNotification(notificationDoc);
    const rr = await notification.save();
    const devices = await memberDevice.find({ user: memberBooking.member });
    let payload = {
      title: rr.notificationTitle,
      message: rr.notificationMsg,
      data: {
        path: "notification",
        parm: "0",
        key: rr._id.toString(),
        pathId: rr.entityId.toString(),
      },
    };
    for (const device of devices) {
      // need to add checking for validity of member device status
      if (device.os == "android") {
        await fcmSender.sendAndroidDeviceNotification(payload, device, rr._id);
      } else {
        await fcmSender.sendIosDeviceNotification(payload, device, rr._id);
      }
    }
    return rr;
  } catch (error) {
    return null;
  }
}

async function sendPackageExpiryReminderNotification(memberPackage, info) {
  try {
    // const sDate = dayjs(memberPackage.validDate).format("DD/MM/YYYY hh:mm a");
    const sDate = convertDateTimeMalaysiaTZ(memberPackage.validDate);
    let msg = `${info} : Hi ${memberPackage.member.memberFullName}, your package [${memberPackage.package.packageCode}] will be expire at ${sDate} with remaining ${memberPackage.currentBalance} session(s). Please arrange your time to redeem all available sessions before the ${sDate}.`;
    let notificationDoc = {
      notificationCategory: "Package",
      notificationType: "reminder",
      notificationTitle: "Package Expiry Reminder",
      notificationMsg: msg,
      msgContentType: "text",
      status: "send",
      member: memberPackage.member,
      entityName: "memberPackage",
      entityId: memberPackage._id,
    };
    const notification = new MemberNotification(notificationDoc);
    const rr = await notification.save();
    const devices = await memberDevice.find({ user: memberBooking.member });
    let payload = {
      title: rr.notificationTitle,
      message: rr.notificationMsg,
      data: {
        path: "notification",
        parm: "0",
        key: rr._id.toString(),
        pathId: rr.entityId.toString(),
      },
    };
    for (const device of devices) {
      // need to add checking for validity of member device status
      if (device.os == "android") {
        await fcmSender.sendAndroidDeviceNotification(payload, device, rr._id);
      } else {
        await fcmSender.sendIosDeviceNotification(payload, device, rr._id);
      }
    }
    return rr;
  } catch (error) {
    return null;
  }
}

module.exports = {
  sendBookingReminderNotification,
  sendPackageExpiryReminderNotification,
};
