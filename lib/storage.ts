import { VisitReport, VisitEntry, PredefinedOption, TravelPlan, TravelPlanEntry, User } from '@/types';

const STORAGE_KEYS = {
  VISIT_REPORTS: 'visit_reports',
  VISIT_ENTRIES: 'visit_entries',
  PREDEFINED_OPTIONS: 'predefined_options',
  CURRENT_USER: 'current_user',
  TRAVEL_PLANS: 'travel_plans',
  TRAVEL_PLAN_ENTRIES: 'travel_plan_entries',
  LOCATIONS: 'locations',
  PURPOSE_OPTIONS: 'purpose_options',
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
    if (!data) return null;
    const parsed = JSON.parse(data);
    return parsed;
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

// Travel Plan Storage Functions
export function getTravelPlans(): TravelPlan[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRAVEL_PLANS);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading travel plans:', error);
    localStorage.removeItem(STORAGE_KEYS.TRAVEL_PLANS);
    return [];
  }
}

export function saveTravelPlan(plan: TravelPlan): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const plans = getTravelPlans();
    const index = plans.findIndex((p) => p.id === plan.id);
    if (index >= 0) {
      plans[index] = plan;
    } else {
      plans.push(plan);
    }
    localStorage.setItem(STORAGE_KEYS.TRAVEL_PLANS, JSON.stringify(plans));
    return true;
  } catch (error) {
    console.error('Error saving travel plan:', error);
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
    }
    return false;
  }
}

export function deleteTravelPlan(planId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const plans = getTravelPlans();
    const filtered = plans.filter((p) => p.id !== planId);
    localStorage.setItem(STORAGE_KEYS.TRAVEL_PLANS, JSON.stringify(filtered));
    // Also delete all entries for this plan
    const entries = getTravelPlanEntries();
    const filteredEntries = entries.filter((e) => e.travelPlanId !== planId);
    localStorage.setItem(STORAGE_KEYS.TRAVEL_PLAN_ENTRIES, JSON.stringify(filteredEntries));
    return true;
  } catch (error) {
    console.error('Error deleting travel plan:', error);
    return false;
  }
}

export function getTravelPlanEntries(): TravelPlanEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRAVEL_PLAN_ENTRIES);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading travel plan entries:', error);
    localStorage.removeItem(STORAGE_KEYS.TRAVEL_PLAN_ENTRIES);
    return [];
  }
}

export function getTravelPlanEntriesByPlanId(planId: string): TravelPlanEntry[] {
  return getTravelPlanEntries().filter((e) => e.travelPlanId === planId);
}

export function saveTravelPlanEntry(entry: TravelPlanEntry): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const entries = getTravelPlanEntries();
    const index = entries.findIndex((e) => e.id === entry.id);
    if (index >= 0) {
      entries[index] = entry;
    } else {
      entries.push(entry);
    }
    localStorage.setItem(STORAGE_KEYS.TRAVEL_PLAN_ENTRIES, JSON.stringify(entries));
    return true;
  } catch (error) {
    console.error('Error saving travel plan entry:', error);
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
    }
    return false;
  }
}

export function deleteTravelPlanEntry(entryId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const entries = getTravelPlanEntries();
    const filtered = entries.filter((e) => e.id !== entryId);
    localStorage.setItem(STORAGE_KEYS.TRAVEL_PLAN_ENTRIES, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting travel plan entry:', error);
    return false;
  }
}

export function getTravelPlanEntryById(entryId: string): TravelPlanEntry | null {
  const entries = getTravelPlanEntries();
  return entries.find((e) => e.id === entryId) || null;
}

