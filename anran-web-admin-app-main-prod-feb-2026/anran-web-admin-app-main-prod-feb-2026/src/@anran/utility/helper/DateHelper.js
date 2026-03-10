import dayjs from 'dayjs';
import AdvancedFormat from 'dayjs/plugin/advancedFormat'; // load on demand
import relativeTime from 'dayjs/plugin/relativeTime'; // load on demand
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import updateLocale from 'dayjs/plugin/updateLocale';
import calendar from 'dayjs/plugin/calendar';
import utc from 'dayjs/plugin/utc';
var timezone = require('dayjs/plugin/timezone');

dayjs.extend(AdvancedFormat); // use plugin
dayjs.extend(relativeTime); // use plugin
dayjs.extend(isSameOrBefore); // use plugin
dayjs.extend(calendar);
dayjs.extend(updateLocale);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Kuala_Lumpur');

dayjs.updateLocale('en', {
  calendar: {
    sameDay: '[Today at] h:mm A',
    lastDay: '[Yesterday at] h:mm A',
    nextDay: '[Tomorrow at] h:mm A',
    lastWeek: '[last] dddd [at] h:mm A',
    nextWeek: 'dddd [at] h:mm A',
    sameElse: 'DD/MM/YYYY',
  },
  monthsShort: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
});

export const getDateMonthName = (dateObject) => {
  if (dateObject) return dayjs(dateObject);
  return dayjs();
};

export const getDateObject = (dateObject) => {
  if (dateObject) return dayjs(dateObject);
  return dayjs();
};

export const getFormattedDate = (dateObject, format = 'MMM DD,YYYY') => {
  if (dateObject) return dayjs(dateObject).format(format);
  return dayjs().format(format);
};

export const getFormattedDateTime = (
  value = 0,
  unit = 'days',
  format = 'YYYY-MM-DD',
) => {
  if (value === 0) {
    return dayjs().format(format);
  } else {
    return dayjs().add(value, unit).format(format);
  }
};

export const timeFromNow = (date) => {
  console.log('timeFromNow', date);
  const timestamp = dayjs(date).format('X');
  const newDate = dayjs.unix(timestamp);
  return dayjs(newDate).fromNow();
};

export const isBeforeToday = (date) => {
  return dayjs().isBefore(dayjs(date));
};

export const isAfterToday = (date) => {
  console.log('isAfterToday', date, dayjs().isAfter(dayjs(date)));
  return dayjs().isAfter(dayjs(date));
};

export const isBeforeYear = (date1, date2) => {
  return dayjs(date1).isBefore(dayjs(date2));
};

export const isSameOrBeforeTodayDay = (date1, todayDate) => {
  return dayjs(date1).isSameOrBefore(todayDate);
};
