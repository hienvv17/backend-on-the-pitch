import moment from 'moment-timezone';

export const getCurrentTimeInUTC7 = () => {
  return moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm');
};

export const isValidDate = (dateStr: string): boolean => {
  // Check format first: YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;

  // Parse and validate date
  const date = new Date(dateStr);
  const [year, month, day] = dateStr.split('-').map(Number);

  return (
    date.getFullYear() === year &&
    date.getMonth() + 1 === month && // getMonth() is 0-based
    date.getDate() === day
  );
}

export const isTimeString = (value: string): boolean => {
  const regex = /^([01]\d|2[0-3]):(00|30)$/;
  return regex.test(value);
};

export const isInServiceTime = (
  openTime: string,
  closeTime: string,
  startTime: string,
  endTime: string
): boolean => {
  return startTime >= openTime && startTime < closeTime && endTime <= closeTime
}

export const generateEndTime = (time: string, addHour: number, addMin: number): string => {
  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  date.setMilliseconds(0);

  // Add/subtract hours and minutes
  date.setHours(date.getHours() + addHour);
  date.setMinutes(date.getMinutes() + addMin);

  // Format back to "HH:mm"
  const newHours = String(date.getHours()).padStart(2, "0");
  const newMinutes = String(date.getMinutes()).padStart(2, "0");

  return `${newHours}:${newMinutes}`;
}

