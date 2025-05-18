import moment from 'moment-timezone';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
type TimeSlot = { startTime: string; endTime: string };
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export const getCurrentTimeInUTC7 = (format?: string) => {
  if (!format) {
    format = 'YYYY-MM-DD HH:mm:ss';
  }
  return moment().tz('Asia/Bangkok').format(format);
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
};

export const isTimeString = (value: string): boolean => {
  const regex = /^([01]\d|2[0-3]):(00|30)$/;
  return regex.test(value);
};

export const isInServiceTime = (
  openTime: string,
  closeTime: string,
  startTime: string,
  endTime: string,
): boolean => {
  return startTime >= openTime && startTime < closeTime && endTime <= closeTime;
};

export const generateEndTime = (
  time: string,
  addHour: number,
  addMin: number,
): string => {
  const [hours, minutes] = time.split(':').map(Number);

  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  date.setMilliseconds(0);

  // Add/subtract hours and minutes
  date.setHours(date.getHours() + addHour);
  date.setMinutes(date.getMinutes() + addMin);

  // Format back to "HH:mm"
  const newHours = String(date.getHours()).padStart(2, '0');
  const newMinutes = String(date.getMinutes()).padStart(2, '0');

  return `${newHours}:${newMinutes}`;
};

export const mergeTimeSlots = (slots: TimeSlot[]): TimeSlot[] => {
  if (!slots.length) return [];
  // Sort by startTime
  const sorted = [...slots].sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  );
  const merged: TimeSlot[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const current = sorted[i];

    if (last.endTime === current.startTime) {
      // Merge the slots
      last.endTime = current.endTime;
    } else {
      // No overlap, add new block
      merged.push({ ...current });
    }
  }

  return merged.filter(Boolean);
};

export const getAvailableTimeSlots = (
  bookedSlots: TimeSlot[],
  openTime: string,
  closeTime: string,
): TimeSlot[] => {
  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const toTime = (mins: number) => {
    const h = Math.floor(mins / 60)
      .toString()
      .padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const openMins = toMinutes(openTime);
  const closeMins = toMinutes(closeTime);

  // Sort booked slots by startTime
  const sorted = [...bookedSlots].sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  );

  const available: TimeSlot[] = [];

  let lastEnd = openMins;

  for (const slot of sorted) {
    const start = toMinutes(slot.startTime);
    const end = toMinutes(slot.endTime);

    // If the gap is 60 minutes or more, push it
    if (start - lastEnd >= 60) {
      available.push({
        startTime: toTime(lastEnd),
        endTime: toTime(start),
      });
    }

    // Update the lastEnd to max(current end, last end)
    lastEnd = Math.max(lastEnd, end);
  }

  // Check final gap from last booking to close time
  if (closeMins - lastEnd >= 60) {
    available.push({
      startTime: toTime(lastEnd),
      endTime: toTime(closeMins),
    });
  }

  return available;
};

export const isTimeInRange = (
  startTime: string,
  endTime: string,
  slot: { startTime: string; endTime: string },
) => {
  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const startMin = toMinutes(startTime);
  const endMin = toMinutes(endTime);
  const slotStart = toMinutes(slot.startTime);
  const slotEnd = toMinutes(slot.endTime);

  // Check if the entire interval is within this slot
  return startMin >= slotStart && endMin <= slotEnd;
};

/**
 * Convert UTC date string to Vietnam time zone and format it.
 * @param dateStr - ISO date string from server (e.g., '2025-05-14T14:00:00.000Z')
 * @param format - Desired format (default: 'YYYY-MM-DD HH:mm:ss')
 * @returns Vietnam-localized formatted string
 */
export function formatToVietnamTime(
  dateStr: string,
  format = 'YYYY-MM-DD HH:mm:ss',
): string {
  return dayjs.utc(dateStr).tz('Asia/Ho_Chi_Minh').format(format);
}

/**
 * Get the difference in minutes between two date strings.
 * @param date1 First date string (format: 'YYYY-MM-DD HH:mm:ss')
 * @param date2 Second date string (format: 'YYYY-MM-DD HH:mm:ss')
 * @returns Difference in minutes (positive if date1 > date2)
 */
export function getTimeDiff(
  date1: string,
  date2: string,
  unit: 'minute' | 'hour' | 'day',
): number {
  const d1 = dayjs(date1, 'YYYY-MM-DD HH:mm:ss');
  const d2 = dayjs(date2, 'YYYY-MM-DD HH:mm:ss');

  if (!d1.isValid() || !d2.isValid()) {
    throw new Error('Invalid date format. Expected "YYYY-MM-DD HH:mm:ss".');
  }

  return d1.diff(d2, unit);
}
