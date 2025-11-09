import { VisitReport, VisitEntry, PredefinedOption } from '@/types';

const STORAGE_KEYS = {
  VISIT_REPORTS: 'visit_reports',
  VISIT_ENTRIES: 'visit_entries',
  PREDEFINED_OPTIONS: 'predefined_options',
  CURRENT_USER: 'current_user',
};

export function getVisitReports(): VisitReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.VISIT_REPORTS);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading visit reports:', error);
    localStorage.removeItem(STORAGE_KEYS.VISIT_REPORTS);
    return [];
  }
}

export function saveVisitReport(report: VisitReport): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const reports = getVisitReports();
    const index = reports.findIndex((r) => r.id === report.id);
    if (index >= 0) {
      reports[index] = report;
    } else {
      reports.push(report);
    }
    localStorage.setItem(STORAGE_KEYS.VISIT_REPORTS, JSON.stringify(reports));
    return true;
  } catch (error) {
    console.error('Error saving visit report:', error);
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
    }
    return false;
  }
}

export function getVisitEntries(): VisitEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.VISIT_ENTRIES);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading visit entries:', error);
    localStorage.removeItem(STORAGE_KEYS.VISIT_ENTRIES);
    return [];
  }
}

export function saveVisitEntry(entry: VisitEntry): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const entries = getVisitEntries();
    const index = entries.findIndex((e) => e.id === entry.id);
    if (index >= 0) {
      entries[index] = entry;
    } else {
      entries.push(entry);
    }
    localStorage.setItem(STORAGE_KEYS.VISIT_ENTRIES, JSON.stringify(entries));
    return true;
  } catch (error) {
    console.error('Error saving visit entry:', error);
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
    }
    return false;
  }
}

export function deleteVisitEntry(entryId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const entries = getVisitEntries();
    const filtered = entries.filter((e) => e.id !== entryId);
    localStorage.setItem(STORAGE_KEYS.VISIT_ENTRIES, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting visit entry:', error);
    return false;
  }
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading current user:', error);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    return null;
  }
}

export function setCurrentUser(user: User): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return true;
  } catch (error) {
    console.error('Error saving current user:', error);
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
    }
    return false;
  }
}

export function clearCurrentUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

