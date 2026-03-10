module.exports = {
  autoCancelBooking123,
};

async function autoCancelBooking123() {
  try {
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
