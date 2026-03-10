const MemberPackage = require("../../../models/memberPackage");
const {
  sendPackageExpiryReminderNotification,
} = require("../../../helper/reminder");

module.exports = {
  packageReminder1MonthExpiry,
};

async function packageReminder1MonthExpiry() {
  try {
    var now = new Date();
    const tempDate = new Date(now.getTime());
    const monthsToAdd = 1;
    var monthDate = new Date(tempDate.setMonth(now.getMonth() + monthsToAdd));
    // console.log("packageReminder1MonthExpiry: after", monthDate);
    const packageList = await MemberPackage.find({
      $and: [
        { isExpired: { $eq: false } },
        { validDate: { $gte: now, $lt: monthDate } },
      ],
    });
    if (packageList.length > 0) {
      for (const memberPackage of packageList) {
        //Send expiry reminder for 1 month
        await sendPackageExpiryReminderNotification(memberPackage, "1-Month");
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
