import moment from 'moment-timezone';

export const getCurrentTimeInUTC7 = () => {
  return moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm');
};
