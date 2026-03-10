const fcm = require("./index.js");
const Fcmlog = require("../../models/fcmlog.js");
// https://medium.com/@kayoneklein/push-notification-using-firebase-node-js-flutter-dart-f87e6a0567d
const fcmSender = {
  sendAndroidDeviceNotification: async (payload, device, notificationId) => {
    try {
      const message = {
        notification: {
          title: payload.title,
          body: payload.message,
        },
        android: {
          notification: {
            icon: "message_icon",
            color: "#7e55c3",
            // imageUrl: "https://foo.bar.pizza-monster.png",
          },
        },
        data: payload.data,
        token: device.token,
      };
      // const message = {
      //   data: {
      //     score: "850",
      //     time: "2:45",
      //   },
      //   token: fcmToken,
      // };
      // Send a message to the device corresponding to the provided
      // fcmToken.
      fcm
        .send(message)
        .then(async (response) => {
          let result = {
            device: device._id,
            notification: notificationId,
            response: response,
            status: "success",
          };
          const log = new Fcmlog(result);
          await log.save();
          // Response is a message ID string.
          // console.log("Successfully sent message:", response);
        })
        .catch(async (error) => {
          let result = {
            device: device._id,
            notification: notificationId,
            response: JSON.stringify(error.errorInfo),
            status: "failed",
          };
          const log = new Fcmlog(result);
          await log.save();
          if (
            error.code === "messaging/invalid-argument" ||
            error.code === "messaging/registration-token-not-registered"
          ) {
            device.active = false;
            device.save();
          }
          // console.log("Error sending message:", error);
        });
    } catch (error) {
      let result = {
        device: device._id,
        notification: notificationId,
        response: JSON.stringify(error),
        status: "failed",
      };
      const log = new Fcmlog(result);
      await log.save();
      return null;
    }
  },
  sendIosDeviceNotification: async (payload, device, notificationId) => {
    try {
      const message = {
        notification: {
          title: payload.title,
          body: payload.message,
        },
        apns: {
          payload: {
            aps: {
              "mutable-content": 1,
            },
          },
          // fcm_options: {
          //   image: "https://foo.bar.pizza-monster.png",
          // },
        },
        data: payload.data,
        token: device.token,
      };
      // Send a message to the device corresponding to the provided
      // fcmToken.
      fcm
        .send(message)
        .then(async (response) => {
          let result = {
            device: device._id,
            notification: notificationId,
            response: response,
            status: "success",
          };
          const log = new Fcmlog(result);
          await log.save();
          // Response is a message ID string.
          // console.log("Successfully sent message:", response);
        })
        .catch(async (error) => {
          let result = {
            device: device._id,
            notification: notificationId,
            response: JSON.stringify(error.errorInfo),
            status: "failed",
          };
          const log = new Fcmlog(result);
          await log.save();
          if (
            error.code === "messaging/invalid-argument" ||
            error.code === "messaging/registration-token-not-registered"
          ) {
            device.active = false;
            device.save();
          }
          // console.log("Error sending message:", error);
        });
    } catch (error) {
      let result = {
        device: device._id,
        notification: notificationId,
        response: JSON.stringify(error),
        status: "failed",
      };
      const log = new Fcmlog(result);
      await log.save();
      return null;
    }
  },
};

module.exports = { fcmSender };
