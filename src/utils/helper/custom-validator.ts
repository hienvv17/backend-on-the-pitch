import { ValidationError } from 'class-validator';
import { ErrorMessage } from '../common/message-const';

export const getCustomErrorMessage = (error: ValidationError) => {
  let baseErrorMessage: string = ErrorMessage.BAD_REQUEST;
  const firstKey = Object.keys(error.constraints)[0];
  baseErrorMessage = error.constraints[firstKey];
  return baseErrorMessage;
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