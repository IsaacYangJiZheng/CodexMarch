import dayjs from 'dayjs';

export const stringasUTC = (date) => {
  if (date) {
    return new Date(dayjs(date).utc().local().format('YYYY-MM-DD HH:mm:ss'));
  } else {
    return null;
  }
};
