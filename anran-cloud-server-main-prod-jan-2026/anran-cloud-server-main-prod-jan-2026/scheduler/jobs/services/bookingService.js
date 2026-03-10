const Booking = require("../../../models/booking");
const MemberBooking = require("../../../models/memberBooking");
const MemberPackage = require("../../../models/memberPackage");
const Room = require("../../../models/rooms");
const {
  sendBookingCancelNotification,
  sendCheckOutConfirmNotification,
} = require("../../../helper/notification");
const { sendBookingReminderNotification } = require("../../../helper/reminder");
const dayjs = require("dayjs");
const moment = require("moment");

module.exports = {
  autoCancelBooking,
  dailyAutoCancelBooking,
  autoCancelBookingRunOnce,
  dailyAutoCheckOutSession,
  dailyAutoCompleteSession,
  bookingReminder24HrsBeforeSession,
  bookingReminder12HrsBeforeSession,
  bookingReminder4HrsBeforeSession,
  bookingReminder30MisBeforeSession,
  // handleBookingUsage,
  checkFor24hFirstUsage,
};

async function autoCancelBooking() {
  try {
    var now = new Date();
    var hr = now.getMinutes();
    // console.log("Minutes", hr);
    // console.log("autoCancelBooking");
    return {
      status: true,
      statusCode: 200,
      message: "ok",
    };
  } catch (err) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}

async function dailyAutoCompleteSession() {
  try {
    var now = new Date();
    var hr = now.getMinutes();
    // console.log("dailyAutoCompleteSession: Minutes", hr);
    const startdt = new Date(new Date().setHours(0, 0, 0, 0));
    const enddt = new Date();
    const bookingList = await Booking.find({
      $and: [
        { start: { $gte: startdt } },
        { end: { $lte: enddt } },
      ],
    });
    const scheduledUpdatesMap = new Map();

    if (bookingList.length > 0) {
      for (const booking of bookingList) {
        if (booking.members.length > 0) {
          for (const memberBooking of booking.members) {
            const memberBookobj = await MemberBooking.find({
              $and: [
                { _id: { $eq: memberBooking } },
                { bookingstatus: { $eq: "Booked" } },
              ],
            });

            if (memberBookobj.length > 0) {
              for (const item of memberBookobj) {
                await MemberBooking.findByIdAndUpdate(
                  item._id,
                  {
                    bookingstatus: "Complete",
                    checkout_date: Date.now(),
                  },
                  { new: false }
                );

                const memberPackage = await MemberPackage.findOne({
                  member: item.member,
                  _id: item.memberPackage,
                });
                if (memberPackage) {
                  const updatedUsed = (memberPackage.used || 0) + item.pax;

                  let updateData = {
                    used: updatedUsed,
                    lastUsedDate: new Date(),
                    lastUsedBranch: booking.branch,
                  };

                  await MemberPackage.findByIdAndUpdate(memberPackage._id, updateData);
                  // if (memberPackage.used === 0) {
                  //   await MemberPackage.findByIdAndUpdate(
                  //     memberPackage._id,
                  //     {
                  //       used: updatedUsed,
                  //       lastUsedDate: new Date(),
                  //       lastUsedBranch: booking.branch,
                  //     }
                  //   );
                  // } else {
                  //   let updateData = {
                  //     used: updatedUsed,
                  //     lastUsedDate: new Date(),
                  //     lastUsedBranch: booking.branch,
                  //   };
                  //   if (memberPackage.packageValidity === "1 Year") {
                  //     if (!memberPackage.validDate) {
                  //       const oldestBooking = await MemberBooking.findOne({
                  //         memberPackage: memberPackage._id,
                  //         bookingstatus: "Complete",
                  //       })
                  //         .sort({ bookingDate: 1 })
                  //         .limit(1);

                  //       if (oldestBooking) {
                  //         updateData.validDate = moment(
                  //           oldestBooking.bookingDate
                  //         ).add(1, "years");
                  //       } else {
                  //         updateData.validDate = await calculateValidDate(
                  //           memberPackage
                  //         );
                  //       }
                  //     }
                  //   }
                  //   await MemberPackage.findByIdAndUpdate(
                  //     memberPackage._id,
                  //     updateData
                  //   );
                  // }
                }
                await sendCheckOutConfirmNotification(item);
              }
            }
          }
        }
      }
      const scheduledUpdates = Array.from(scheduledUpdatesMap.values());

      return {
        status: true,
        statusCode: 200,
        message: "ok",
        scheduledUpdates,
      };
    } else {
      return {
        status: true,
        statusCode: 200,
        message: "ok",
        scheduledUpdates: [],
      };
    }
  } catch (error) {
    throw new Error(error);
  }
}

async function checkFor24hFirstUsage() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // find memberBookings completed more than 24h ago
  const pendingMemberBookings = await MemberBooking.find({
    bookingstatus: "Complete",
    bookingDate: { $lte: cutoff }
  }).populate("memberPackage");

  for (const mb of pendingMemberBookings) {
    const pkg = mb.memberPackage;
    if (pkg && !pkg.isFirstUsed && !pkg.validDate) {
      let updateData = {
        firstUsedDate: mb.bookingDate,
        firstUsedBranch: pkg.lastUsedBranch,
        isFirstUsed: true,
      };

      if (pkg.packageValidity === "1 Year") {
        const valid = await calculateValidDate(pkg, mb.bookingDate);
        updateData.validDate = valid;
      }

      await MemberPackage.findByIdAndUpdate(pkg._id, updateData);
      // console.log(`✅ Activated package ${pkg._id} after 24h`);
    }
  }
}

// async function dailyAutoCompleteSession() {
//   try {
//     var now = new Date();
//     var hr = now.getMinutes();
//     console.log("dailyAutoCompleteSession: Minutes", hr);
//     const startdt = new Date(new Date().setHours(0, 0, 0, 0));
//     const enddt = new Date();
//     const bookingList = await Booking.find({
//       $and: [{ start: { $gte: startdt, $lt: enddt } }],
//     });
//     if (bookingList.length > 0) {
//       for (const booking of bookingList) {
//         if (booking.members.length > 0) {
//           for (const memberBooking of booking.members) {
//             const memberBookobj = await MemberBooking.find({
//               $and: [
//                 { _id: { $eq: memberBooking } },
//                 { bookingstatus: { $eq: "Booked" } },
//               ],
//             });
//             // if (memberBookobj.length > 0) {
//             //   for (const item of memberBookobj) {
//             //     await MemberBooking.findByIdAndUpdate(
//             //       item._id,
//             //       {
//             //         bookingstatus: "Complete",
//             //         checkout_date: Date.now(),
//             //       },
//             //       { new: false }
//             //     );
//             //     const memberPackage = await MemberPackage.findOne({
//             //       member: item.member,
//             //       _id: item.memberPackage,
//             //     });
//             //     if (memberPackage) {
//             //       // Calculate new values
//             //       const updatedUsed = (memberPackage.used || 0) + item.pax;
//             //       await MemberPackage.findByIdAndUpdate(
//             //         memberPackage._id,
//             //         {
//             //           used: updatedUsed,
//             //           lastUsedDate: new Date(),
//             //           lastUsedBranch: booking.branch,
//             //         },
//             //         { new: false }
//             //       );
//             //     }
//             //     //Send push notification for completion
//             //     const notification = await sendCheckOutConfirmNotification(
//             //       item
//             //     );
//             //   }
//             // }
//             if (memberBookobj.length > 0) {
//               for (const item of memberBookobj) {
//                 await MemberBooking.findByIdAndUpdate(
//                   item._id,
//                   {
//                     bookingstatus: "Complete",
//                     checkout_date: Date.now(),
//                   },
//                   { new: false }
//                 );

//                 const memberPackage = await MemberPackage.findOne({
//                   member: item.member,
//                   _id: item.memberPackage,
//                 });

//                 if (memberPackage) {
//                   const updatedUsed = (memberPackage.used || 0) + item.pax;

//                   if (memberPackage.used === 0) {
//                     if (memberPackage.packageValidity === "1 Year") {
//                       const valid = await calculateValidDate(memberPackage);
//                       await MemberPackage.findByIdAndUpdate(memberPackage._id, {
//                         used: updatedUsed,
//                         firstUsedDate: new Date(),
//                         firstUsedBranch: booking.branch,
//                         lastUsedDate: new Date(),
//                         lastUsedBranch: booking.branch,
//                         validDate: valid,
//                       });
//                     } else {
//                       await MemberPackage.findByIdAndUpdate(memberPackage._id, {
//                         used: updatedUsed,
//                         firstUsedDate: new Date(),
//                         firstUsedBranch: booking.branch,
//                         lastUsedDate: new Date(),
//                         lastUsedBranch: booking.branch,
//                       });
//                     }
//                   } else {
//                     // await MemberPackage.findByIdAndUpdate(memberPackage._id, {
//                     //   used: updatedUsed,
//                     //   lastUsedDate: new Date(),
//                     //   lastUsedBranch: booking.branch,
//                     // });
//                     let updateData = {
//                       used: updatedUsed,
//                       lastUsedDate: new Date(),
//                       lastUsedBranch: booking.branch,
//                     };
//                     if (memberPackage.packageValidity === "1 Year") {
//                       if (!memberPackage.validDate) {
//                         const oldestBooking = await MemberBooking.findOne({
//                           memberPackage: memberPackage._id,
//                           bookingstatus: "Complete",
//                         })
//                           .sort({ bookingDate: 1 })
//                           .limit(1);

//                         if (oldestBooking) {
//                           updateData.validDate = moment(
//                             oldestBooking.bookingDate
//                           ).add(1, "years");
//                         } else {
//                           updateData.validDate = await calculateValidDate(
//                             memberPackage
//                           );
//                         }
//                       }
//                     }
//                     await MemberPackage.findByIdAndUpdate(
//                       memberPackage._id,
//                       updateData
//                     );
//                   }
//                 }
//                 await sendCheckOutConfirmNotification(item);
//               }
//             }
//           }
//         }
//       }
//       return {
//         status: true,
//         statusCode: 200,
//         message: "ok",
//       };
//     } else {
//       return {
//         status: true,
//         statusCode: 200,
//         message: "ok",
//       };
//     }
//   } catch (error) {
//     throw new Error(error);
//   }
// }

// async function dailyAutoCompleteSessionv2() {
//   try {
//     var now = new Date();
//     var hr = now.getMinutes();
//     console.log("dailyAutoCompleteSession: Minutes", hr);
//     const startdt = new Date(new Date().setHours(0, 0, 0, 0));
//     const enddt = new Date();
//     const bookingList = await Booking.find({
//       $and: [{ start: { $gte: startdt, $lt: enddt } }],
//     });
//     const scheduledUpdatesMap = new Map();

//     if (bookingList.length > 0) {
//       for (const booking of bookingList) {
//         if (booking.members.length > 0) {
//           for (const memberBooking of booking.members) {
//             const memberBookobj = await MemberBooking.find({
//               $and: [
//                 { _id: { $eq: memberBooking } },
//                 { bookingstatus: { $eq: "Booked" } },
//               ],
//             });

//             if (memberBookobj.length > 0) {
//               for (const item of memberBookobj) {
//                 await MemberBooking.findByIdAndUpdate(
//                   item._id,
//                   {
//                     bookingstatus: "Complete",
//                     checkout_date: Date.now(),
//                   },
//                   { new: false }
//                 );

//                 const memberPackage = await MemberPackage.findOne({
//                   member: item.member,
//                   _id: item.memberPackage,
//                 });
//                 if (memberPackage) {
//                   const updatedUsed = (memberPackage.used || 0) + item.pax;

//                   if (memberPackage.used === 0) {
//                     await MemberPackage.findByIdAndUpdate(
//                       memberPackage._id,
//                       {
//                         used: updatedUsed,
//                         lastUsedDate: new Date(),
//                         lastUsedBranch: booking.branch,
//                       }
//                     );
//                     const key = memberPackage._id.toString();
//                     if (scheduledUpdatesMap.has(key)) {
//                       scheduledUpdatesMap.get(key).pax += item.pax;
//                     } else {
//                       scheduledUpdatesMap.set(key, {
//                         memberPackageId: memberPackage._id,
//                         bookingId: booking._id,
//                         branch: booking.branch,
//                         pax: item.pax,
//                       });
//                     }
//                   } else {
//                     let updateData = {
//                       used: updatedUsed,
//                       lastUsedDate: new Date(),
//                       lastUsedBranch: booking.branch,
//                     };
//                     if (memberPackage.packageValidity === "1 Year") {
//                       if (!memberPackage.validDate) {
//                         const oldestBooking = await MemberBooking.findOne({
//                           memberPackage: memberPackage._id,
//                           bookingstatus: "Complete",
//                         })
//                           .sort({ bookingDate: 1 })
//                           .limit(1);

//                         if (oldestBooking) {
//                           updateData.validDate = moment(
//                             oldestBooking.bookingDate
//                           ).add(1, "years");
//                         } else {
//                           updateData.validDate = await calculateValidDate(
//                             memberPackage
//                           );
//                         }
//                       }
//                     }
//                     await MemberPackage.findByIdAndUpdate(
//                       memberPackage._id,
//                       updateData
//                     );
//                   }
//                 }
//                 await sendCheckOutConfirmNotification(item);
//               }
//             }
//           }
//         }
//       }
//       const scheduledUpdates = Array.from(scheduledUpdatesMap.values());

//       return {
//         status: true,
//         statusCode: 200,
//         message: "ok",
//         scheduledUpdates,
//       };
//     } else {
//       return {
//         status: true,
//         statusCode: 200,
//         message: "ok",
//         scheduledUpdates: [],
//       };
//     }
//   } catch (error) {
//     throw new Error(error);
//   }
// }

// async function handleBookingUsage({ memberPackageId, bookingId, branch }) {
//   const memberPackage = await MemberPackage.findById(memberPackageId);
//   if (!memberPackage) return;
//   const booking = await Booking.findById(bookingId).populate("members");
//   if (!booking) return;

//   const stillComplete = await MemberBooking.exists({
//     memberPackage: memberPackageId,
//     booking: bookingId,
//     bookingstatus: "Complete",
//   });

//   if (!stillComplete) {
//     console.log("Skipping update — booking cancelled before delay finished");
//     return;
//   }

//   let updateData = {};

//   if (!memberPackage.isFirstUsed) {
//       updateData.firstUsedDate = new Date();
//       updateData.firstUsedBranch = branch;
//       updateData.isFirstUsed = true;

//     if (memberPackage.packageValidity === "1 Year") {
//       const valid = await calculateValidDate(memberPackage);
//       updateData.validDate = valid;
//     }
//   }

//   await MemberPackage.findByIdAndUpdate(memberPackage._id, updateData);
// }

async function calculateValidDate(memberPackages, bookingDate) {
  if (memberPackages.package && memberPackages.validDate == null) {
    if (memberPackages.firstUsedDate != null) {
      const oneYearFromNow = moment(memberPackages.firstUsedDate).add(
        1,
        "years"
      );
      // console.log(oneYearFromNow);
      return oneYearFromNow;
    } else {
      const oneYearFromNow = moment(bookingDate).add(1, "years");
      // console.log(oneYearFromNow);
      return oneYearFromNow;
    }
  } else {
    return memberPackages.validDate;
  }
}

async function dailyAutoCancelBooking() {
  try {
    var now = new Date();
    var hr = now.getMinutes();
    // console.log("dailyAutoCancelBooking: Minutes", hr);
    const startdt = new Date(new Date().setHours(0, 0, 0, 0));
    const enddt = new Date();
    const bookingList = await Booking.find({
      $and: [{ start: { $gte: startdt, $lt: enddt } }],
    });
    if (bookingList.length > 0) {
      for (const booking of bookingList) {
        if (booking.members.length > 0) {
          let cancelPax = 0;
          for (const memberBooking of booking.members) {
            const memberBookobj = await MemberBooking.find({
              $and: [
                { _id: { $eq: memberBooking } },
                { bookingstatus: { $eq: "Booked" } },
              ],
            });
            if (memberBookobj.length > 0) {
              for (const item of memberBookobj) {
                await MemberBooking.findByIdAndUpdate(
                  item._id,
                  {
                    bookingstatus: "Cancel",
                  },
                  { new: false }
                );
                await MemberPackage.findByIdAndUpdate(item.memberPackage._id, {
                  $inc: {
                    currentBalance: item.pax,
                  },
                });
                const notification = await sendBookingCancelNotification(item);
                cancelPax = cancelPax + item.pax;
              }
            }
          }
          const bookingRoom = await Room.findById(booking.room);
          let newbalance = booking.availableSlot + cancelPax;
          if (newbalance > bookingRoom.roomCapacity) {
            newbalance = bookingRoom.roomCapacity;
            let newpax = 0;
            let newTitle = newpax + " person booked";
            await Booking.findByIdAndUpdate(
              booking._id,
              {
                availableSlot: newbalance,
                pax: newpax,
                title: newTitle,
              },
              { new: false }
            );
          } else {
            let newpax = booking.pax - cancelPax;
            let newTitle = newpax + " person booked";
            await Booking.findByIdAndUpdate(
              booking._id,
              {
                availableSlot: newbalance,
                pax: newpax,
                title: newTitle,
              },
              { new: false }
            );
          }
        }
      }
      return {
        status: true,
        statusCode: 200,
        message: "ok",
      };
    } else {
      return {
        status: true,
        statusCode: 200,
        message: "ok",
      };
    }
  } catch (error) {
    throw new Error(error);
  }
}

async function autoCancelBookingRunOnce() {
  try {
    var now = new Date();
    var hr = now.getMinutes();
    // console.log("autoCancelBookingRunOnce: Minutes", hr);
    const startdt = new Date(new Date("2024-11-01").setHours(0, 0, 0, 0));
    const enddt = new Date(new Date("2024-11-30").setHours(23, 59, 59, 0));
    const bookingList = await Booking.find({
      $and: [{ start: { $gte: startdt, $lt: enddt } }],
    });
    if (bookingList.length > 0) {
      for (const booking of bookingList) {
        if (booking.members.length > 0) {
          let cancelPax = 0;
          for (const memberBooking of booking.members) {
            const memberBookobj = await MemberBooking.find({
              $and: [
                { _id: { $eq: memberBooking } },
                { bookingstatus: { $eq: "Booked" } },
              ],
            });
            if (memberBookobj.length > 0) {
              for (const item of memberBookobj) {
                await MemberBooking.findByIdAndUpdate(
                  item._id,
                  {
                    bookingstatus: "Cancel",
                  },
                  { new: false }
                );
                await MemberPackage.findByIdAndUpdate(item.memberPackage._id, {
                  $inc: {
                    currentBalance: item.pax,
                  },
                });
                cancelPax = cancelPax + item.pax;
              }
            }
          }
          const bookingRoom = await Room.findById(booking.room);
          let newbalance = booking.availableSlot + cancelPax;
          if (newbalance > bookingRoom.roomCapacity) {
            newbalance = bookingRoom.roomCapacity;
            let newpax = 0;
            let newTitle = newpax + " person booked";
            await Booking.findByIdAndUpdate(
              booking._id,
              {
                availableSlot: newbalance,
                pax: newpax,
                title: newTitle,
              },
              { new: false }
            );
          } else {
            let newpax = booking.pax - cancelPax;
            let newTitle = newpax + " person booked";
            await Booking.findByIdAndUpdate(
              booking._id,
              {
                availableSlot: newbalance,
                pax: newpax,
                title: newTitle,
              },
              { new: false }
            );
          }
        }
      }
      return {
        status: true,
        statusCode: 200,
        message: "ok",
      };
    } else {
      return {
        status: true,
        statusCode: 200,
        message: "ok",
      };
    }
  } catch (error) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}

async function sendDailyBookingReminder() {
  try {
    var now = new Date();
    var hr = now.getMinutes();
    // console.log("dailyAutoCancelBooking: Minutes", hr);
    const startdt = new Date(new Date().setHours(0, 0, 0, 0));
    const enddt = new Date();
    const bookingList = await Booking.find({
      $and: [{ start: { $gte: startdt, $lt: enddt } }],
    });
    if (bookingList.length > 0) {
      for (const booking of bookingList) {
        if (booking.members.length > 0) {
          for (const memberBooking of booking.members) {
            const memberBookobj = await MemberBooking.find({
              $and: [
                { _id: { $eq: memberBooking } },
                { bookingstatus: { $eq: "Booked" } },
              ],
            });
            if (memberBookobj.length > 0) {
              for (const item of memberBookobj) {
                var diffMs = item.start - new Date();
                var diffDays = Math.floor(diffMs / 86400000); // days
                var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
                var diffMins = Math.round(
                  ((diffMs % 86400000) % 3600000) / 60000
                ); // minutes
                if (diffDays == 3) {
                  // send reminder for 3 days
                }
                if (diffDays == 1) {
                  // send reminder for 1 days
                }
                if (diffDays == 0) {
                  if (diffHrs == 4) {
                    // send reminder for 4 hrs
                  }
                  if (diffHrs <= 1) {
                    // send reminder for 1 hrs or less
                  }
                }
              }
            }
          }
        }
      }
      return {
        status: true,
        statusCode: 200,
        message: "ok",
      };
    } else {
      return {
        status: true,
        statusCode: 200,
        message: "ok",
      };
    }
  } catch (error) {
    return {
      status: false,
      statusCode: 500,
      message: err.message,
    };
  }
}

async function dailyAutoCheckOutSession() {
  try {
    var now = new Date();
    var hr = now.getMinutes();
    // console.log("dailyAutoCheckOutSession: Minutes", hr);
    const startdt = new Date(new Date().setHours(0, 0, 0, 0));
    const enddt = new Date();
    const bookingList = await Booking.find({
      $and: [{ start: { $gte: startdt, $lt: enddt } }],
    });
    if (bookingList.length > 0) {
      for (const booking of bookingList) {
        if (booking.members.length > 0) {
          for (const memberBooking of booking.members) {
            const memberBookobj = await MemberBooking.find({
              $and: [
                { _id: { $eq: memberBooking } },
                { bookingstatus: { $eq: "CheckedIn" } },
              ],
            });
            if (memberBookobj.length > 0) {
              for (const item of memberBookobj) {
                await MemberBooking.findByIdAndUpdate(
                  item._id,
                  {
                    bookingstatus: "Complete",
                    checkout_date: Date.now(),
                  },
                  { new: false }
                );
                //Send push notification for completion
                const notification = await sendCheckOutConfirmNotification(
                  item
                );
              }
            }
          }
        }
      }
      return {
        status: true,
        statusCode: 200,
        message: "ok",
      };
    } else {
      return {
        status: true,
        statusCode: 200,
        message: "ok",
      };
    }
  } catch (error) {
    throw new Error(error);
  }
}

async function bookingReminder24HrsBeforeSession() {
  try {
    var now = new Date();
    var mm = now.getMinutes();
    var hr = now.getHours();
    // console.log("dailyAutoCheckOutSession: Minutes", mm);
    const tomorrowDate = new Date(now.getTime());
    const hoursToAdd = 24 * 60 * 60 * 1000;
    tomorrowDate.setTime(now.getTime() + hoursToAdd);
    var hr2 = tomorrowDate.getHours();
    // tomorrowDate.setHours(hr, 0, 0, 0);
    // console.log("bookingReminder24HrsBeforeSession: after", tomorrowDate);
    const startdt = tomorrowDate.setHours(hr2, 0, 0, 0);
    const bookingList = await Booking.find({
      $and: [{ start: { $eq: startdt } }],
    });
    if (bookingList.length > 0) {
      for (const booking of bookingList) {
        if (booking.members.length > 0) {
          for (const memberBooking of booking.members) {
            const memberBookobj = await MemberBooking.find({
              $and: [
                { _id: { $eq: memberBooking } },
                { bookingstatus: { $eq: "Booked" } },
              ],
            });
            if (memberBookobj.length > 0) {
              for (const item of memberBookobj) {
                //Send booking reminder for 24hr
                await sendBookingReminderNotification(item, "24Hrs");
              }
            }
          }
        }
      }
      return {
        status: true,
        statusCode: 200,
        message: "ok",
      };
    } else {
      return {
        status: true,
        statusCode: 200,
        message: "ok",
      };
    }
  } catch (error) {
    throw new Error(error);
  }
}

async function bookingReminder12HrsBeforeSession() {
  try {
    var now = new Date();
    var mm = now.getMinutes();
    var hr = now.getHours();
    // console.log("dailyAutoCheckOutSession: Minutes", mm);
    const dateCopy = new Date(now.getTime());
    const hoursToAdd = 12 * 60 * 60 * 1000;
    dateCopy.setTime(now.getTime() + hoursToAdd);
    var hr2 = dateCopy.getHours();
    // console.log("bookingReminder12HrsBeforeSession: after", dateCopy);
    const startdt = dateCopy.setHours(hr2, 0, 0, 0);
    const bookingList = await Booking.find({
      $and: [{ start: { $eq: startdt } }],
    });
    if (bookingList.length > 0) {
      for (const booking of bookingList) {
        if (booking.members.length > 0) {
          for (const memberBooking of booking.members) {
            const memberBookobj = await MemberBooking.find({
              $and: [
                { _id: { $eq: memberBooking } },
                { bookingstatus: { $eq: "Booked" } },
              ],
            });
            if (memberBookobj.length > 0) {
              for (const item of memberBookobj) {
                //Send booking reminder for 24hr
                await sendBookingReminderNotification(item, "12Hrs");
              }
            }
          }
        }
      }
      return {
        status: true,
        statusCode: 200,
        message: "ok",
      };
    } else {
      return {
        status: true,
        statusCode: 200,
        message: "ok",
      };
    }
  } catch (error) {
    throw new Error(error);
  }
}

async function bookingReminder4HrsBeforeSession() {
  try {
    var now = new Date();
    var mm = now.getMinutes();
    var hr = now.getHours();
    // console.log("bookingReminder4HrsBeforeSession: Minutes", mm);
    const dateCopy = new Date(now.getTime());
    const hoursToAdd = 4 * 60 * 60 * 1000;
    dateCopy.setTime(now.getTime() + hoursToAdd);
    var hr2 = dateCopy.getHours();
    // console.log("bookingReminder4HrsBeforeSession: after", dateCopy);
    const startdt = dateCopy.setHours(hr2, 0, 0, 0);
    const bookingList = await Booking.find({
      $and: [{ start: { $eq: startdt } }],
    });
    if (bookingList.length > 0) {
      for (const booking of bookingList) {
        if (booking.members.length > 0) {
          for (const memberBooking of booking.members) {
            const memberBookobj = await MemberBooking.find({
              $and: [
                { _id: { $eq: memberBooking } },
                { bookingstatus: { $eq: "Booked" } },
              ],
            });
            if (memberBookobj.length > 0) {
              for (const item of memberBookobj) {
                //Send booking reminder for 24hr
                await sendBookingReminderNotification(item, "4Hrs");
              }
            }
          }
        }
      }
      return {
        status: true,
        statusCode: 200,
        message: "ok",
      };
    } else {
      return {
        status: true,
        statusCode: 200,
        message: "ok",
      };
    }
  } catch (error) {
    throw new Error(error);
  }
}

async function bookingReminder30MisBeforeSession() {
  try {
    var now = new Date();
    var mm = now.getMinutes();
    var hr = now.getHours();
    // console.log("bookingReminder30MisBeforeSession: before", hr, mm);
    const dateCopy = new Date(now.getTime());
    const minutesToAdd = 30 * 60 * 1000;
    dateCopy.setTime(now.getTime() + minutesToAdd);
    var mm1 = dateCopy.getMinutes();
    var hr2 = dateCopy.getHours();
    // console.log("bookingReminder30MisBeforeSession: after", hr2, mm1);
    const startdt = dateCopy.setHours(hr2, 0, 0, 0);
    const bookingList = await Booking.find({
      $and: [{ start: { $eq: startdt } }],
    });
    const bookingList2 = await Booking.find({
      $and: [{ start: { $eq: dateCopy } }],
    });
    if (bookingList.length > 0) {
      for (const booking of bookingList) {
        if (booking.members.length > 0) {
          for (const memberBooking of booking.members) {
            const memberBookobj = await MemberBooking.find({
              $and: [
                { _id: { $eq: memberBooking } },
                { bookingstatus: { $eq: "Booked" } },
              ],
            });
            if (memberBookobj.length > 0) {
              for (const item of memberBookobj) {
                //Send booking reminder for 24hr
                await sendBookingReminderNotification(item, "30Mins");
              }
            }
          }
        }
      }
      return {
        status: true,
        statusCode: 200,
        message: "ok",
      };
    } else {
      return {
        status: true,
        statusCode: 200,
        message: "ok",
      };
    }
  } catch (error) {
    throw new Error(error);
  }
}
