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

