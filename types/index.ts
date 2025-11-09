export type UserRole = 'sales_engineer' | 'team_leader' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamLeaderId?: string;
  verticalId?: string;
}

export interface Vertical {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface ContactPerson {
  id: string;
  name: string;
  designation: string;
  mobile: string;
  email: string;
}

export interface VisitEntry {
  id: string;
  visitReportId: string;
  serialNumber: number;
  dateOfVisit: string;
  dayOfVisit: string;
  companyName: string;
  plant: string;
  cityArea: string;
  state: string;
  contactPersons: ContactPerson[];
  purposeOfMeeting: string;
  discussionPoints: string;
  productServices: string;
  actionStep: string;
  remarks: string;
  potentialSaleValue: string;
  visitOutcome: 'Satisfied' | 'Dissatisfied' | 'Need for Improvement';
  convertStatus: 'PreLead' | 'Enquiry' | 'Proposal' | 'Negotiation' | 'Closed' | string;
  status: string;
  result: string;
  closureDate: string;
  travelPlanEntryId?: string; // Link to travel plan entry
  isFromPlan?: boolean; // Flag indicating if created from travel plan
  createdAt: string;
  updatedAt: string;
}

export interface VisitReport {
  id: string;
  reportPeriod: string;
  salesEngineerId: string;
  teamLeaderId: string;
  verticalId: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  visitEntries: VisitEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface PredefinedOption {
  id: string;
  category: 'purpose' | 'outcome' | 'convert' | 'status' | 'result';
  value: string;
  active: boolean;
}

// Travel Planning Types
export interface Location {
  id: string;
  name: string;
  state: string;
  region: string;
  coordinates?: { lat: number; lng: number };
  active: boolean;
}

export interface PurposeOption {
  id: string;
  value: string;
  category: 'visit' | 'meeting' | 'demo' | 'follow-up';
  active: boolean;
}

export type TravelPlanStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'active' | 'completed';
export type TravelPlanEntryStatus = 'planned' | 'in-progress' | 'completed' | 'skipped' | 'rescheduled' | 'converted';

export interface TravelPlanEntry {
  id: string;
  travelPlanId: string;
  date: string; // YYYY-MM-DD format
  day: string; // Day of week (e.g., "Monday")
  fromLocation: string;
  toLocation: string;
  areaRegion: string;
  customerName: string;
  purpose: string;
  plannedCheckIn?: string; // HH:MM format
  plannedCheckOut?: string; // HH:MM format
  actualCheckIn?: string; // HH:MM format
  actualCheckOut?: string; // HH:MM format
  status: TravelPlanEntryStatus;
  visitReportId?: string; // Link to visit report if converted
  photos: string[]; // Array of photo URLs/paths
  notes?: string;
  isAdHoc: boolean; // true if not in original plan
  createdAt: string;
  updatedAt: string;
}

export interface TravelPlan {
  id: string;
  salesEngineerId: string;
  teamLeaderId: string;
  month: string; // e.g., "September"
  year: number; // e.g., 2022
  status: TravelPlanStatus;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionComments?: string;
  createdAt: string;
  updatedAt: string;
}

