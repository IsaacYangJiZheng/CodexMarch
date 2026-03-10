var moment = require("moment-timezone");
const dayjs = require("dayjs");
var utc = require("dayjs/plugin/utc");
var timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

function convertMalaysiaTZ(date) {
  const tz = "Asia/Kuala_Lumpur";
  var parmDate = dayjs(date);
  var localDate = dayjs(parmDate).tz(tz);
  return new Date(
    (typeof date === "string" ? new Date(localDate) : localDate).toLocaleString(
      "en-MY",
      {
        timeZone: "Asia/Kuala_Lumpur",
      }
    )
  );
}

function convertDateMalaysiaTZ(date) {
  var parmDate = moment(date);
  var localDate = parmDate.tz("Asia/Kuala_Lumpur").format("DD/MM/YYYY");
  return localDate;
}

function convertTimeMalaysiaTZ(date) {
  var parmDate = moment(date);
  var localDate = parmDate.tz("Asia/Kuala_Lumpur").format("LT");
  return localDate;
}

function convertDateTimeMalaysiaTZ(date) {
  var parmDate = moment(date);
  var localDate = parmDate.tz("Asia/Kuala_Lumpur").format("DD/MM/YYYY, h:mm a");
  return localDate;
}

function convertUTCtoMalaysiaTZ(date) {
  var parmDate = moment(date);
  var localDate = parmDate.tz("Asia/Kuala_Lumpur");
  return localDate;
}

module.exports = {
  convertMalaysiaTZ,
  convertDateMalaysiaTZ,
  convertTimeMalaysiaTZ,
  convertDateTimeMalaysiaTZ,
  convertUTCtoMalaysiaTZ,
};
