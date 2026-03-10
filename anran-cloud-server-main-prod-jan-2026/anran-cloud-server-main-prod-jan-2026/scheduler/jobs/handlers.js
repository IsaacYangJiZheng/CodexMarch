// const PaymentService = require("../relative-to-your-project");
// const mailService = require("../relative-to-your-project");
const {
  autoCancelBooking,
  dailyAutoCancelBooking,
  autoCancelBookingRunOnce,
  dailyAutoCheckOutSession,
  dailyAutoCompleteSession,
  bookingReminder30MisBeforeSession,
  bookingReminder4HrsBeforeSession,
  bookingReminder12HrsBeforeSession,
  bookingReminder24HrsBeforeSession,
  // handleBookingUsage,
  checkFor24hFirstUsage,
} = require("./services/bookingService");

const { packageReminder1MonthExpiry } = require("./services/packageService");
const { staffAttendanceResetDaily } = require("./services/attendanceService");

const JobHandlers = {
  // autoCancelBookingJob: async (job, done) => {
  //   job.repeatEvery("0 15 * * *", {
  //     skipImmediate: false,
  //   });
  //   await job.save();
  //   const { data } = job.attrs;
  //   await autoCancelBooking();
  //   // await PaymentService.completePayout(data);
  //   done();
  // },
  // dailyAutoCancelBookingJob: async (job, done) => {
  //   // every hours past 50 min
  //   job.repeatEvery("50 0/1 * * *", {
  //     skipImmediate: false,
  //   });
  //   await job.save();
  //   try {
  //     await dailyAutoCancelBooking();
  //     done();
  //   } catch (error) {
  //     done(error);
  //   }
  // },
  // dailyAutoCompleteSessionJob: async (job, done) => {
  //   // every hours past 1 min
  //   job.repeatEvery("1 0/1 * * *", {
  //     skipImmediate: false,
  //   });
  //   await job.save();
  //   try {
  //     await dailyAutoCompleteSession();
  //     done();
  //   } catch (error) {
  //     done(error);
  //   }
  // },
  dailyAutoCompleteSessionJob: async (job, done) => {
    // every hours past 1 min
    job.repeatEvery("1 0/1 * * *", {
      skipImmediate: false,
    });
    await job.save();
    try {
      await dailyAutoCompleteSession();
      // const result = await dailyAutoCompleteSession();

      // if (result && Array.isArray(result.scheduledUpdates) && result.scheduledUpdates.length) {
      //   for (const upd of result.scheduledUpdates) {
      //     await job.agenda.schedule("in 24 hours", "update-member-package-after-24h", upd);
      //   }
      // }
      done();
    } catch (error) {
      done(error);
    }
  },
  dailyActivatePackagesJob: async (job, done) => {
    job.repeatEvery("2 0/1 * * *", {
      skipImmediate: false,
    });
    await job.save();
    try {
      await checkFor24hFirstUsage();
      done();
    } catch (error) {
      done(error);
    }
  },
  // updateMemberPackageAfter24h: async (job, done) => {
  //   try {
  //     const { memberPackageId, bookingId, branch, pax } = job.attrs.data;
  //     await handleBookingUsage({ memberPackageId, bookingId, branch, pax });
  //     done();
  //   } catch (err) {
  //     done(err);
  //   }
  // },
  dailyAutoCheckOutSessionJob: async (job, done) => {
    // every hours past 5 min
    job.repeatEvery("5 0/1 * * *", {
      skipImmediate: false,
    });
    await job.save();
    try {
      await dailyAutoCheckOutSession();
      done();
    } catch (error) {
      done(error);
    }
  },
  bookingReminder30MinsJob: async (job, done) => {
    // every hours past 30 min
    job.repeatEvery("30 0/1 * * *", {
      skipImmediate: false,
    });
    await job.save();
    try {
      await bookingReminder30MisBeforeSession();
      done();
    } catch (error) {
      done(error);
    }
  },
  bookingReminder4hrsJob: async (job, done) => {
    // every hours
    job.repeatEvery("0 0/1 * * *", {
      skipImmediate: false,
    });
    await job.save();
    try {
      await bookingReminder4HrsBeforeSession();
      done();
    } catch (error) {
      done(error);
    }
  },
  bookingReminder12hrsJob: async (job, done) => {
    // every hours
    job.repeatEvery("0 0/1 * * *", {
      skipImmediate: false,
    });
    await job.save();
    try {
      await bookingReminder12HrsBeforeSession();
      done();
    } catch (error) {
      done(error);
    }
  },
  bookingReminder24hrsJob: async (job, done) => {
    // every hours
    job.repeatEvery("0 0/1 * * *", {
      skipImmediate: false,
    });
    await job.save();
    try {
      await bookingReminder24HrsBeforeSession();
      done();
    } catch (error) {
      done(error);
    }
  },
  packageExpiryReminder1MonthJob: async (job, done) => {
    // every hours
    job.repeatEvery("0 0/1 * * *", {
      skipImmediate: false,
    });
    await job.save();
    try {
      await packageReminder1MonthExpiry();
      done();
    } catch (error) {
      done(error);
    }
  },
  dailyAutoCancelRunOnceJob: async (job, done) => {
    await autoCancelBookingRunOnce();
    done();
  },
  dailyAutoResetStaffAttendanceJob: async (job, done) => {
    // every day
    job.repeatEvery("24 hours", {
      skipImmediate: false,
    });
    await job.save();
    try {
      await staffAttendanceResetDaily();
      done();
    } catch (error) {
      done(error);
    }
  },
  sendWelcomeEmail: async (job, done) => {
    const { data } = job.attrs;
    var now = new Date();
    var hr = now.getMinutes();
    // console.log("Minutes", hr);
    // console.log("sendWelcomeEmail Jobs", data);
    // await mailService.welcome(data);
    done();
  },

  // .... more methods that perform diffrent tasks
};

module.exports = { JobHandlers };
