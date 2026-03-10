const { JobHandlers } = require("./handlers");

module.exports = function (agenda) {
  agenda.define("send-welcome-mail", JobHandlers.sendWelcomeEmail);
  //   agenda.define("auto-cancel-booking", JobHandlers.autoCancelBookingJob);
  // agenda.define(
  //   "daily-auto-cancel-booking",
  //   JobHandlers.dailyAutoCancelBookingJob
  // );
  agenda.define(
    "daily-auto-checkout-session",
    JobHandlers.dailyAutoCheckOutSessionJob
  );
  agenda.define(
    "daily-auto-complete-session",
    JobHandlers.dailyAutoCompleteSessionJob
  );
  agenda.define(
    "daily-activate-packages",
    JobHandlers.dailyActivatePackagesJob
  );
  agenda.define(
    "update-member-package-after-24h",
    JobHandlers.updateMemberPackageAfter24h
  );
  agenda.define(
    "booking-reminder-30mins",
    JobHandlers.bookingReminder30MinsJob
  );
  agenda.define("booking-reminder-4hrs", JobHandlers.bookingReminder4hrsJob);
  agenda.define("booking-reminder-12hrs", JobHandlers.bookingReminder12hrsJob);
  agenda.define("booking-reminder-24hrs", JobHandlers.bookingReminder24hrsJob);
  agenda.define(
    "package-expiry-reminder-1month",
    JobHandlers.packageExpiryReminder1MonthJob
  );
  agenda.define(
    "staff-attendance-reset-daily",
    JobHandlers.dailyAutoResetStaffAttendanceJob
  );
  //   agenda.define(
  //     "daily-auto-cancel-run-once",
  //     JobHandlers.dailyAutoCancelRunOnceJob
  //   );
  // More email related jobs
};
