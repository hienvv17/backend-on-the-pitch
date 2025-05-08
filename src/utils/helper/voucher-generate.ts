import { v4 as uuidv4 } from 'uuid';
export const generateVoucherCode = (code: string): string => {
  return `${code}-` + uuidv4().split('-')[0].toUpperCase();
};
