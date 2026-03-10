const Staff = require("../../../models/staff");

module.exports = {
  staffAttendanceResetDaily,
};

async function staffAttendanceResetDaily() {
  try {
    await Staff.updateMany(
      { isDeleted: false },
      {
        $set: { isInToday: false, isOutToday: false },
      }
    );
    return {
      status: true,
      statusCode: 200,
      message: "ok",
    };
  } catch (error) {
    throw new Error(error);
  }
}
