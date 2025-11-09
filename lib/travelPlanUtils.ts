import { format, getDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { TravelPlanEntry, TravelPlanEntryStatus } from '@/types';

/**
 * Get day name from date string
 */
export function getDayName(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'EEEE'); // Full day name (Monday, Tuesday, etc.)
  } catch {
    return '';
  }
}

/**
 * Get all days in a month
 */
export function getDaysInMonth(year: number, month: number): Date[] {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));
  return eachDayOfInterval({ start, end });
}

/**
 * Get month name from month number (1-12)
 */
export function getMonthName(month: number): string {
  const date = new Date(2000, month - 1, 1);
  return format(date, 'MMMM'); // Full month name (January, February, etc.)
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDateForInput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Format date to DD/MMM/YYYY (e.g., 01/Sep/2022)
 */
export function formatDateForDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MMM/yyyy');
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dateObj < today;
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isSameDay(dateObj, new Date());
}

/**
 * Get status indicator for travel plan entry
 */
export function getStatusIndicator(status: TravelPlanEntryStatus, visitReportId?: string) {
  if (visitReportId) {
    return { icon: '✅', color: 'green', label: 'Visit Report Created' };
  }
  
  switch (status) {
    case 'converted':
      return { icon: '✅', color: 'green', label: 'Converted to Report' };
    case 'completed':
      return { icon: '🟡', color: 'yellow', label: 'Completed' };
    case 'in-progress':
      return { icon: '🔵', color: 'blue', label: 'In Progress' };
    case 'skipped':
      return { icon: '❌', color: 'red', label: 'Skipped' };
    case 'rescheduled':
      return { icon: '🔄', color: 'orange', label: 'Rescheduled' };
    case 'planned':
    default:
      return { icon: '⚪', color: 'gray', label: 'Planned' };
  }
}

/**
 * Calculate time variance between planned and actual
 */
export function calculateTimeVariance(planned: string, actual: string): number {
  if (!planned || !actual) return 0;
  
  const [plannedHours, plannedMinutes] = planned.split(':').map(Number);
  const [actualHours, actualMinutes] = actual.split(':').map(Number);
  
  const plannedTotal = plannedHours * 60 + plannedMinutes;
  const actualTotal = actualHours * 60 + actualMinutes;
  
  return actualTotal - plannedTotal; // Returns minutes difference
}

/**
 * Format time variance for display
 */
export function formatTimeVariance(minutes: number): string {
  if (minutes === 0) return 'On time';
  if (minutes > 0) return `+${minutes} min`;
  return `${minutes} min`;
}

/**
 * Validate check-in/check-out times
 */
export function validateTimes(checkIn: string, checkOut: string): { valid: boolean; error?: string } {
  if (!checkIn || !checkOut) {
    return { valid: true }; // Optional fields
  }
  
  const [inHours, inMinutes] = checkIn.split(':').map(Number);
  const [outHours, outMinutes] = checkOut.split(':').map(Number);
  
  const inTotal = inHours * 60 + inMinutes;
  const outTotal = outHours * 60 + outMinutes;
  
  if (outTotal <= inTotal) {
    return { valid: false, error: 'Check-out time must be after check-in time' };
  }
  
  const duration = outTotal - inTotal;
  if (duration > 24 * 60) {
    return { valid: false, error: 'Visit duration cannot exceed 24 hours' };
  }
  
  if (duration < 5) {
    return { valid: false, error: 'Visit duration is very short. Is this correct?' };
  }
  
  return { valid: true };
}

/**
 * Get entries for a specific date
 */
export function getEntriesForDate(entries: TravelPlanEntry[], date: Date | string): TravelPlanEntry[] {
  const dateStr = typeof date === 'string' ? date : formatDateForInput(date);
  return entries.filter((e) => e.date === dateStr);
}

/**
 * Get conversion statistics for a plan
 */
export function getConversionStats(entries: TravelPlanEntry[]) {
  const total = entries.length;
  const converted = entries.filter((e) => e.status === 'converted' || e.visitReportId).length;
  const completed = entries.filter((e) => e.status === 'completed').length;
  const pending = entries.filter((e) => e.status === 'planned' || e.status === 'in-progress').length;
  
  return {
    total,
    converted,
    completed,
    pending,
    conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0,
  };
}

