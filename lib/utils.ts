import { format, parseISO, getDay } from 'date-fns';

const DAYS = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

export function formatDate(date: string | Date): string {
  try {
    let dateObj: Date;
    if (typeof date === 'string') {
      // Try parsing as ISO first, then try DD-MM-YYYY format
      if (date.includes('T') || date.includes('-') && date.split('-').length === 3) {
        dateObj = parseISO(date);
      } else {
        dateObj = new Date(date);
      }
    } else {
      dateObj = date;
    }
    if (isNaN(dateObj.getTime())) return '';
    return format(dateObj, 'dd-MM-yyyy');
  } catch {
    return '';
  }
}

export function getDayOfWeek(date: string | Date): string {
  try {
    let dateObj: Date;
    if (typeof date === 'string') {
      // Try parsing as ISO first, then try DD-MM-YYYY format
      if (date.includes('T') || date.includes('-') && date.split('-').length === 3) {
        dateObj = parseISO(date);
      } else {
        dateObj = new Date(date);
      }
    } else {
      dateObj = date;
    }
    if (isNaN(dateObj.getTime())) return '';
    return DAYS[getDay(dateObj)];
  } catch {
    return '';
  }
}

export function formatCurrency(value: string | number): string {
  if (!value) return '';
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('en-IN');
}

export function parseCurrency(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/,/g, '');
  return parseFloat(cleaned) || 0;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateMobile(mobile: string): boolean {
  const cleaned = mobile.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

