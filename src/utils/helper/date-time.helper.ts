import moment from 'moment-timezone';
type TimeSlot = { startTime: string; endTime: string };

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


export const mergeTimeSlots = (slots: TimeSlot[]): TimeSlot[] => {
  if (!slots.length) return [];
  // Sort by startTime
  const sorted = [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime));
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

  return merged;
}

export const getAvailableTimeSlots = (
  bookedSlots: TimeSlot[],
  openTime: string,
  closeTime: string
): TimeSlot[] => {
  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const toTime = (mins: number) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const openMins = toMinutes(openTime);
  const closeMins = toMinutes(closeTime);

  // Sort booked slots by startTime
  const sorted = [...bookedSlots].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
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
}



