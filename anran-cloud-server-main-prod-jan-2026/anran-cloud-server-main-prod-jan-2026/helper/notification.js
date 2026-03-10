const mongoose = require("mongoose");
const MemberNotification = require("../models/memberNotifications");
const memberDevice = require("../models/memberDevice");
const MemberPackageTransfer = require("../models/memberPackageTransfer");
const dayjs = require("dayjs");
const { fcmSender } = require("../controller/fcm/sender.js");
const {
  convertMalaysiaTZ,
  convertDateMalaysiaTZ,
  convertTimeMalaysiaTZ,
  convertDateTimeMalaysiaTZ,
} = require("../helper/utils");

async function sendBookingCancelNotification(memberBooking) {
  try {
    // const sDate = dayjs(convertMalaysiaTZ(memberBooking.start)).format(
    //   "DD/MM/YYYY"
    // );
    // const sTime = dayjs(convertMalaysiaTZ(memberBooking.start)).format(
    //   "hh:mm a"
    // );
    // const eTime = dayjs(convertMalaysiaTZ(memberBooking.end)).format("hh:mm a");
    const sDate = convertDateMalaysiaTZ(memberBooking.start);
    const sTime = convertTimeMalaysiaTZ(memberBooking.start);
    const eTime = convertTimeMalaysiaTZ(memberBooking.end);
    let msg = `Booking is canceled. Date: ${sDate}, Time: ${sTime} - ${eTime}. `;
    let notificationDoc = {
      notificationCategory: "Booking",
      notificationType: "announcement",
      notificationTitle: "Booking Cancelled",
      notificationMsg: msg,
      msgContentType: "text",
      status: "send",
      member: memberBooking.member,
      entityName: "memberBooking",
      entityId: memberBooking._id,
      // createdBy: "System",
      // updatedBy: "System",
      // staff: "",
      // imageUrl: "",
      // imageDataUrl: "",
      // notificationColor: "",
      // startDate: "",
      // endDate: "",
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

async function sendBookingConfirmNotification(memberBooking) {
  try {
    // const sDate = dayjs(convertMalaysiaTZ(memberBooking.start)).format(
    //   "DD/MM/YYYY"
    // );
    // const sTime = moment(convertMalaysiaTZ(memberBooking.start)).format(
    //   "hh:mm a"
    // );
    // const eTime = dayjs(convertMalaysiaTZ(memberBooking.end)).format("hh:mm a");
    const sDate = convertDateMalaysiaTZ(memberBooking.start);
    const sTime = convertTimeMalaysiaTZ(memberBooking.start);
    const eTime = convertTimeMalaysiaTZ(memberBooking.end);
    let msg = `Booking confirmed. Date: ${sDate}, Time: ${sTime} - ${eTime}. Please come 15 mins before the session. `;
    let notificationDoc = {
      notificationCategory: "Booking",
      notificationType: "announcement",
      notificationTitle: "Booking confirmed",
      notificationMsg: msg,
      msgContentType: "text",
      status: "send",
      member: memberBooking.member,
      entityName: "memberBooking",
      entityId: memberBooking._id,
      // createdBy: "System",
      // updatedBy: "System",
      // staff: "",
      // imageUrl: "",
      // imageDataUrl: "",
      // notificationColor: "",
      // startDate: "",
      // endDate: "",
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

async function sendPackageTransferConfirmNotification(transfer) {
  try {
    const mPkgTransfer = await MemberPackageTransfer.findById(transfer._id)
      .populate({
        path: "memberFrom",
      })
      .populate({
        path: "memberTo",
      });
    // const transferDate = dayjs(mPkgTransfer.transferDate).format(
    //   "DD/MM/YYYY hh:mm a"
    // );
    const transferDate = convertDateTimeMalaysiaTZ(mPkgTransfer.transferDate);
    let senderMsg = `Transfer Session (${mPkgTransfer.transferSessionCount}) is confirmed, from: ${mPkgTransfer.memberFrom.memberFullName}(${mPkgTransfer.memberFrom.mobileNumber}) to ${mPkgTransfer.memberTo.memberFullName}(${mPkgTransfer.memberTo.mobileNumber}) on ${transferDate}.`;
    let receiverMsg = `Package Session (${mPkgTransfer.transferSessionCount}) is received, from: ${mPkgTransfer.memberFrom.memberFullName}(${mPkgTransfer.memberFrom.mobileNumber}).`;
    let senderNotificationDoc = {
      notificationCategory: "Transfer",
      notificationType: "announcement",
      notificationTitle: "Package Transfer Successful",
      notificationMsg: senderMsg,
      msgContentType: "text",
      status: "send",
      member: mPkgTransfer.memberFrom._id,
      entityName: "memberPackageTransfer",
      entityId: mPkgTransfer.fromMemberPackage,
    };
    const senderNotification = new MemberNotification(senderNotificationDoc);
    const ss = await senderNotification.save();
    const senderDevices = await memberDevice.find({
      user: mPkgTransfer.memberFrom._id,
    });
    let senderPayload = {
      title: ss.notificationTitle,
      message: ss.notificationMsg,
      data: {
        path: "notification",
        parm: "0",
        key: ss._id.toString(),
      },
    };
    for (const device of senderDevices) {
      // need to add checking for validity of member device status
      if (device.os == "android") {
        await fcmSender.sendAndroidDeviceNotification(
          senderPayload,
          device,
          ss._id
        );
      } else {
        await fcmSender.sendIosDeviceNotification(
          senderPayload,
          device,
          ss._id
        );
      }
    }

    let receiverNotificationDoc = {
      notificationCategory: "Transfer",
      notificationType: "announcement",
      notificationTitle: "Package Received",
      notificationMsg: receiverMsg,
      msgContentType: "text",
      status: "send",
      member: mPkgTransfer.memberTo._id,
      entityName: "memberPackageTransfer",
      entityId: mPkgTransfer.toMemberPackage,
    };
    const receiverNotification = new MemberNotification(
      receiverNotificationDoc
    );
    const rr = await receiverNotification.save();
    const receiverDevices = await memberDevice.find({
      user: mPkgTransfer.memberTo._id,
    });
    let receiverPayload = {
      title: rr.notificationTitle,
      message: rr.notificationMsg,
      data: {
        path: "notification",
        parm: "0",
        key: rr._id.toString(),
      },
    };
    for (const device of receiverDevices) {
      // need to add checking for validity of member device status
      if (device.os == "android") {
        await fcmSender.sendAndroidDeviceNotification(
          receiverPayload,
          device,
          rr._id
        );
      } else {
        await fcmSender.sendIosDeviceNotification(
          receiverPayload,
          device,
          rr._id
        );
      }
    }

    return rr;
  } catch (error) {
    return null;
  }
}

async function sendCheckOutConfirmNotification(memberBooking) {
  try {
    // const sDate = dayjs(memberBooking.start).format("DD/MM/YYYY");
    // const sTime = dayjs(memberBooking.start).format("hh:mm a");
    // const eTime = dayjs(memberBooking.end).format("hh:mm a");
    const sDate = convertDateMalaysiaTZ(memberBooking.start);
    const sTime = convertTimeMalaysiaTZ(memberBooking.start);
    const eTime = convertTimeMalaysiaTZ(memberBooking.end);
    let msg = `Thank you. You have successfully completed your session : ${sDate}, Time: ${sTime} - ${eTime}. `;
    let notificationDoc = {
      notificationCategory: "Booking",
      notificationType: "announcement",
      notificationTitle: "Session Completed",
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

async function sendAutoCancelBookingNotification(memberBooking) {
  try {
    // const sDate = dayjs(memberBooking.start).format("DD/MM/YYYY");
    // const sTime = dayjs(memberBooking.start).format("hh:mm a");
    // const eTime = dayjs(memberBooking.end).format("hh:mm a");
    const sDate = convertDateMalaysiaTZ(memberBooking.start);
    const sTime = convertTimeMalaysiaTZ(memberBooking.start);
    const eTime = convertTimeMalaysiaTZ(memberBooking.end);
    let msg = `Booking is canceled. Date: ${sDate}, Time: ${sTime} - ${eTime}. `;
    let notificationDoc = {
      notificationCategory: "Booking",
      notificationType: "announcement",
      notificationTitle: "Booking Cancelled",
      notificationMsg: msg,
      msgContentType: "text",
      status: "send",
      member: memberBooking.member,
      entityName: "memberBooking",
      entityId: memberBooking._id,
      // createdBy: "System",
      // updatedBy: "System",
      // staff: "",
      // imageUrl: "",
      // imageDataUrl: "",
      // notificationColor: "",
      // startDate: "",
      // endDate: "",
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

async function sendPurchaseConfirmNotification(payments, memberPackageId) {
  try {
    // const pDate = dayjs(convertMalaysiaTZ(payments.payDate)).format(
    //   "DD/MM/YYYY"
    // );
    // const pTime = dayjs(convertMalaysiaTZ(payments.payDate)).format("hh:mm a");
    const pDate = convertDateMalaysiaTZ(payments.payDate);
    const pTime = convertTimeMalaysiaTZ(payments.payDate);
    let msg = `Thank you for your purchase. Payment RM ${payments.payAmount} was successfully made. Date: ${pDate}, Time: ${pTime}. `;
    let notificationDoc = {
      notificationCategory: "Purchase",
      notificationType: "announcement",
      notificationTitle: "Package Purchase Successful",
      notificationMsg: msg,
      msgContentType: "text",
      status: "send",
      member: payments.payer,
      entityName: "memberPackagePurchase",
      entityId: memberPackageId,
      // createdBy: "System",
      // updatedBy: "System",
      // staff: "",
      // imageUrl: "",
      // imageDataUrl: "",
      // notificationColor: "",
      // startDate: "",
      // endDate: "",
    };
    const notification = new MemberNotification(notificationDoc);
    const rr = await notification.save();
    const devices = await memberDevice.find({ user: payments.payer });
    let payload = {
      title: rr.notificationTitle,
      message: rr.notificationMsg,
      data: {
        path: "notification",
        parm: "0",
        key: rr._id.toString(),
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

async function sendMobileNumberChangedConfirmNotification(member, now) {
  try {
    const date = convertDateMalaysiaTZ(now);
    const time = convertTimeMalaysiaTZ(now);
    let msg = `Mobile Number changed. Date: ${date}, Time: ${time}. Please relogin to access to the mobile app. `;
    let notificationDoc = {
      notificationCategory: "Member",
      notificationType: "announcement",
      notificationTitle: "Mobile Number Changed",
      notificationMsg: msg,
      msgContentType: "text",
      status: "send",
      member: member._id,
      entityName: "member",
      entityId: member._id,
    };
    const notification = new MemberNotification(notificationDoc);
    const rr = await notification.save();
    const devices = await memberDevice.find({ user: member._id });
    let payload = {
      title: rr.notificationTitle,
      message: rr.notificationMsg,
      data: {
        path: "logout",
        parm: "0",
        key: rr._id.toString(),
      },
    };
    for (const device of devices) {
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
  sendBookingCancelNotification,
  sendBookingConfirmNotification,
  sendPackageTransferConfirmNotification,
  sendCheckOutConfirmNotification,
  sendAutoCancelBookingNotification,
  sendPurchaseConfirmNotification,
  sendMobileNumberChangedConfirmNotification,
};
