const express = require("express");
const router = express.Router();
const { schedule } = require("../../scheduler/jobs/scheduler");

router.get("/start/job-all", async (req, res) => {
  try {
    // await schedule.autoDailyCancelBookingJob({ userId: "123" });
    await schedule.autoCompleteSessionJob({ userId: "123" });
    await schedule.autoCheckOutSessionJob({ userId: "123" });
    await schedule.bookingReminder30MinsJob({ userId: "123" });
    await schedule.bookingReminder4hrsJob({ userId: "123" });
    await schedule.bookingReminder12hrsJob({ userId: "123" });
    await schedule.bookingReminder24hrsJob({ userId: "123" });
    await schedule.packageExpiryReminder1MonthJob({ userId: "123" });
    await schedule.activatePackagesJob({ userId: "123" });
    // await schedule.dailyStaffAttendanceReset({ userId: "123" });
    res.send({ message: "OK" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/stop/job-all", async (req, res) => {
  try {
    await schedule.cancelJob({ jobName: "daily-auto-cancel-booking" });
    await schedule.cancelJob({ jobName: "daily-auto-checkout-session" });
    await schedule.cancelJob({ jobName: "booking-reminder-30mins" });
    await schedule.cancelJob({ jobName: "booking-reminder-4hrs" });
    await schedule.cancelJob({ jobName: "booking-reminder-12hrs" });
    await schedule.cancelJob({ jobName: "booking-reminder-24hrs" });
    await schedule.cancelJob({ jobName: "package-expiry-reminder-1month" });
    // await schedule.cancelJob({ jobName: "staff-attendance-reset-daily" });
    res.send({ message: "OK" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/demo", async (req, res) => {
  try {
    await schedule.sendWelcomeMail({ userId: "123" });
    // schedule.now("registration demo", { userId: "123" });
    res.send({ message: "OK" });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/start/auto-cancel-job", async (req, res) => {
  try {
    await schedule.autoDailyCancelBookingJob({ userId: "123" });
    // schedule.now("registration demo", { userId: "123" });
    res.send({ message: "OK" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/start/auto-check-out-job", async (req, res) => {
  try {
    await schedule.autoCheckOutSessionJob({ userId: "123" });
    // schedule.now("registration demo", { userId: "123" });
    res.send({ message: "OK" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/start/auto-complete-session-job", async (req, res) => {
  try {
    await schedule.autoCompleteSessionJob({ userId: "123" });
    // schedule.now("registration demo", { userId: "123" });
    res.send({ message: "OK" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/stop/auto-complete-session-job", async (req, res) => {
  try {
    await schedule.cancelJob({ jobName: "daily-auto-complete-session" });
    res.send({ message: "OK" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/start/activate-packages-job", async (req, res) => {
  try {
    await schedule.activatePackagesJob({ userId: "123" });
    // schedule.now("registration demo", { userId: "123" });
    res.send({ message: "OK" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/stop/activate-packages-job", async (req, res) => {
  try {
    await schedule.cancelJob({ jobName: "daily-activate-packages" });
    res.send({ message: "OK" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/start/booking-reminder-job-all", async (req, res) => {
  try {
    await schedule.bookingReminder30MinsJob({ userId: "123" });
    await schedule.bookingReminder4hrsJob({ userId: "123" });
    await schedule.bookingReminder12hrsJob({ userId: "123" });
    await schedule.bookingReminder24hrsJob({ userId: "123" });
    res.send({ message: "OK" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/stop/booking-reminder-job-all", async (req, res) => {
  try {
    await schedule.cancelJob({ jobName: "booking-reminder-30mins" });
    await schedule.cancelJob({ jobName: "booking-reminder-4hrs" });
    await schedule.cancelJob({ jobName: "booking-reminder-12hrs" });
    await schedule.cancelJob({ jobName: "booking-reminder-24hrs" });
    res.send({ message: "OK" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/start/package-reminder-job-all", async (req, res) => {
  try {
    await schedule.packageExpiryReminder1MonthJob({ userId: "123" });
    res.send({ message: "OK" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/stop/package-reminder-job-all", async (req, res) => {
  try {
    await schedule.cancelJob({ jobName: "package-expiry-reminder-1month" });
    res.send({ message: "OK" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/start/staff-attendance-reset-daily", async (req, res) => {
  try {
    await schedule.dailyStaffAttendanceReset({ userId: "123" });
    res.send({ message: "OK" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/stop/staff-attendance-reset-daily", async (req, res) => {
  try {
    await schedule.cancelJob({ jobName: "staff-attendance-reset-daily" });
    res.send({ message: "OK" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// router.get("/one", async (req, res) => {
//   try {
//     await schedule.autoCancelBookingJob({ userId: "123" });
//     // schedule.now("registration demo", { userId: "123" });
//     res.send({ message: "OK" });
//   } catch (error) {
//     res.status(500).send({ message: error.message });
//   }
// });

router.get("/daily-cancel", async (req, res) => {
  try {
    await schedule.autoDailyCancelBookingJob({ userId: "123" });
    // schedule.now("registration demo", { userId: "123" });
    res.send({ message: "OK" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/one-time/daily-cancel", async (req, res) => {
  try {
    await schedule.autoCancelRunOnce({ userId: "123" });
    // schedule.now("registration demo", { userId: "123" });
    res.send({ message: "OK" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/cancel/:jobName", async (req, res) => {
  try {
    const { jobName } = req.params;
    await schedule.cancelJob({ jobName: jobName });
    // schedule.now("registration demo", { userId: "123" });
    res.send({ message: "OK" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// router.get("/emitter", async (req, res) => {
//   try {
//     const myEmitter = req.app.get("myEmitter");
//     //an emit event to handle registration.
//     myEmitter.emit("registration demo", { userId: "123" });
//     res.send({ message: "OK" });
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

module.exports = router;
