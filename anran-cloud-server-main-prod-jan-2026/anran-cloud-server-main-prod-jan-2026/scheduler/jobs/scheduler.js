const { agenda } = require("../index.js");

const schedule = {
  // autoDailyCancelBookingJob: async (data) => {
  //   await agenda.now("daily-auto-cancel-booking", data);
  // },
  autoCheckOutSessionJob: async (data) => {
    await agenda.now("daily-auto-checkout-session", data);
  },
  autoCompleteSessionJob: async (data) => {
    await agenda.now("daily-auto-complete-session", data);
  },
  activatePackagesJob: async (data) => {
    await agenda.now("daily-activate-packages", data);
  },
  bookingReminder30MinsJob: async (data) => {
    await agenda.now("booking-reminder-30mins", data);
  },
  bookingReminder4hrsJob: async (data) => {
    await agenda.now("booking-reminder-4hrs", data);
  },
  bookingReminder12hrsJob: async (data) => {
    await agenda.now("booking-reminder-12hrs", data);
  },
  bookingReminder24hrsJob: async (data) => {
    await agenda.now("booking-reminder-24hrs", data);
  },
  packageExpiryReminder1MonthJob: async (data) => {
    await agenda.now("package-expiry-reminder-1month", data);
  },
  dailyStaffAttendanceReset: async (data) => {
    await agenda.now("staff-attendance-reset-daily", data);
  },
  // autoCancelRunOnce: async (data) => {
  //   await agenda.now("daily-auto-cancel-run-once", data);
  // },
  sendWelcomeMail: async (data) => {
    await agenda.now("send-welcome-mail", data);
  },
  cancelJob: async (data) => {
    if (data) {
      await agenda.cancel({ name: data.jobName });
    }
  },

  // .... more methods that shedule tasks at the different intervals.
};

module.exports = { schedule };
