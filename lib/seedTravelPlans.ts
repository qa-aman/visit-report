import { TravelPlan, TravelPlanEntry, Location, PurposeOption } from '@/types';
import { generateId } from './utils';
import { getDayName, formatDateForInput } from './travelPlanUtils';

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1; // 1-12

// Helper to create dates in YYYY-MM-DD format
const createDate = (year: number, month: number, day: number): string => {
  return formatDateForInput(new Date(year, month - 1, day));
};

// Sample Locations
export const seedLocations = (): Location[] => {
  return [
    { id: 'loc-001', name: 'Mumbai', state: 'Maharashtra', region: 'West', active: true },
    { id: 'loc-002', name: 'Delhi', state: 'Delhi', region: 'North', active: true },
    { id: 'loc-003', name: 'Bangalore', state: 'Karnataka', region: 'South', active: true },
    { id: 'loc-004', name: 'Ahmedabad', state: 'Gujarat', region: 'West', active: true },
    { id: 'loc-005', name: 'Pune', state: 'Maharashtra', region: 'West', active: true },
    { id: 'loc-006', name: 'Chennai', state: 'Tamil Nadu', region: 'South', active: true },
    { id: 'loc-007', name: 'Kolkata', state: 'West Bengal', region: 'East', active: true },
    { id: 'loc-008', name: 'Hyderabad', state: 'Telangana', region: 'South', active: true },
  ];
};

// Sample Purpose Options
export const seedPurposeOptions = (): PurposeOption[] => {
  return [
    { id: 'purpose-001', value: 'Product Demo', category: 'demo', active: true },
    { id: 'purpose-002', value: 'Technical Query', category: 'visit', active: true },
    { id: 'purpose-003', value: 'Follow-up', category: 'follow-up', active: true },
    { id: 'purpose-004', value: 'Development', category: 'visit', active: true },
    { id: 'purpose-005', value: 'Customer Meeting', category: 'meeting', active: true },
    { id: 'purpose-006', value: 'Site Survey', category: 'visit', active: true },
    { id: 'purpose-007', value: 'Installation Support', category: 'visit', active: true },
    { id: 'purpose-008', value: 'Training', category: 'meeting', active: true },
  ];
};

// Seed Travel Plans with comprehensive test cases
export const seedTravelPlans = (): { plans: TravelPlan[]; entries: TravelPlanEntry[] } => {
  const plans: TravelPlan[] = [];
  const entries: TravelPlanEntry[] = [];

  // ========== PLAN 1: Current Month - Draft Status ==========
  const plan1Id = 'tp-001';
  plans.push({
    id: plan1Id,
    salesEngineerId: 'se-001',
    teamLeaderId: 'tl-001',
    month: 'December',
    year: currentYear,
    status: 'draft',
    createdAt: createDate(currentYear, currentMonth, 1),
    updatedAt: createDate(currentYear, currentMonth, 5),
  });

  // Add entries for current month (some completed, some pending)
  for (let day = 1; day <= 15; day++) {
    const date = createDate(currentYear, currentMonth, day);
    const dayName = getDayName(date);
    
    entries.push({
      id: generateId(),
      travelPlanId: plan1Id,
      date,
      day: dayName,
      fromLocation: day % 2 === 0 ? 'Mumbai' : 'Pune',
      toLocation: day % 3 === 0 ? 'Ahmedabad' : 'Mumbai',
      areaRegion: day % 2 === 0 ? 'West' : 'Central',
      customerName: `Customer ${day}`,
      purpose: day % 2 === 0 ? 'Product Demo' : 'Technical Query',
      plannedCheckIn: '09:00',
      plannedCheckOut: '17:00',
      actualCheckIn: day <= 10 ? '09:15' : undefined,
      actualCheckOut: day <= 10 ? '17:30' : undefined,
      status: day <= 10 ? 'completed' : day === 11 ? 'in-progress' : 'planned',
      photos: day <= 5 ? [`photo-${day}-1.jpg`, `photo-${day}-2.jpg`] : [],
      isAdHoc: false,
      createdAt: createDate(currentYear, currentMonth, 1),
      updatedAt: createDate(currentYear, currentMonth, day),
    });
  }

  // ========== PLAN 2: Next Month - Submitted Status ==========
  const plan2Id = 'tp-002';
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
  const nextMonthName = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'][nextMonth - 1];

  plans.push({
    id: plan2Id,
    salesEngineerId: 'se-001',
    teamLeaderId: 'tl-001',
    month: nextMonthName,
    year: nextYear,
    status: 'submitted',
    submittedAt: createDate(currentYear, currentMonth, 20),
    createdAt: createDate(currentYear, currentMonth, 15),
    updatedAt: createDate(currentYear, currentMonth, 20),
  });

  // Add entries for next month
  for (let day = 1; day <= 20; day++) {
    const date = createDate(nextYear, nextMonth, day);
    const dayName = getDayName(date);
    
    entries.push({
      id: generateId(),
      travelPlanId: plan2Id,
      date,
      day: dayName,
      fromLocation: 'Mumbai',
      toLocation: day % 2 === 0 ? 'Pune' : 'Ahmedabad',
      areaRegion: 'West',
      customerName: `Future Customer ${day}`,
      purpose: 'Product Demo',
      plannedCheckIn: '10:00',
      plannedCheckOut: '16:00',
      status: 'planned',
      photos: [],
      isAdHoc: false,
      createdAt: createDate(currentYear, currentMonth, 15),
      updatedAt: createDate(currentYear, currentMonth, 20),
    });
  }

  // ========== PLAN 3: Previous Month - Approved & Active ==========
  const plan3Id = 'tp-003';
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const prevMonthName = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'][prevMonth - 1];

  plans.push({
    id: plan3Id,
    salesEngineerId: 'se-001',
    teamLeaderId: 'tl-001',
    month: prevMonthName,
    year: prevYear,
    status: 'approved',
    submittedAt: createDate(prevYear, prevMonth, 25),
    approvedAt: createDate(prevYear, prevMonth, 28),
    approvedBy: 'tl-001',
    createdAt: createDate(prevYear, prevMonth, 20),
    updatedAt: createDate(prevYear, prevMonth, 28),
  });

  // Add entries for previous month (mix of completed, converted, skipped)
  for (let day = 1; day <= 25; day++) {
    const date = createDate(prevYear, prevMonth, day);
    const dayName = getDayName(date);
    
    let status: TravelPlanEntry['status'] = 'completed';
    let visitReportId: string | undefined = undefined;
    
    if (day <= 15) {
      status = 'converted';
      visitReportId = `visit-${day}`; // Simulated visit report ID
    } else if (day === 20) {
      status = 'skipped';
    } else if (day === 22) {
      status = 'rescheduled';
    }
    
    entries.push({
      id: generateId(),
      travelPlanId: plan3Id,
      date,
      day: dayName,
      fromLocation: 'Mumbai',
      toLocation: 'Ahmedabad',
      areaRegion: 'West',
      customerName: `Past Customer ${day}`,
      purpose: day % 2 === 0 ? 'Product Demo' : 'Technical Query',
      plannedCheckIn: '09:00',
      plannedCheckOut: '17:00',
      actualCheckIn: day <= 15 ? '09:10' : undefined,
      actualCheckOut: day <= 15 ? '17:20' : undefined,
      status,
      visitReportId,
      photos: day <= 10 ? [`photo-past-${day}.jpg`] : [],
      isAdHoc: false,
      createdAt: createDate(prevYear, prevMonth, 20),
      updatedAt: createDate(prevYear, prevMonth, day),
    });
  }

  // ========== PLAN 4: Second Sales Engineer - Draft ==========
  const plan4Id = 'tp-004';
  plans.push({
    id: plan4Id,
    salesEngineerId: 'se-002',
    teamLeaderId: 'tl-001',
    month: nextMonthName,
    year: nextYear,
    status: 'draft',
    createdAt: createDate(currentYear, currentMonth, 18),
    updatedAt: createDate(currentYear, currentMonth, 22),
  });

  // Add entries for second sales engineer
  for (let day = 1; day <= 12; day++) {
    const date = createDate(nextYear, nextMonth, day);
    const dayName = getDayName(date);
    
    entries.push({
      id: generateId(),
      travelPlanId: plan4Id,
      date,
      day: dayName,
      fromLocation: 'Bangalore',
      toLocation: 'Chennai',
      areaRegion: 'South',
      customerName: `SE2 Customer ${day}`,
      purpose: 'Follow-up',
      plannedCheckIn: '10:00',
      plannedCheckOut: '15:00',
      status: 'planned',
      photos: [],
      isAdHoc: false,
      createdAt: createDate(currentYear, currentMonth, 18),
      updatedAt: createDate(currentYear, currentMonth, 22),
    });
  }

  // ========== PLAN 5: Rejected Plan (for testing) ==========
  const plan5Id = 'tp-005';
  plans.push({
    id: plan5Id,
    salesEngineerId: 'se-002',
    teamLeaderId: 'tl-001',
    month: nextMonthName,
    year: nextYear,
    status: 'rejected',
    submittedAt: createDate(currentYear, currentMonth, 10),
    rejectedAt: createDate(currentYear, currentMonth, 12),
    rejectedBy: 'tl-001',
    rejectionComments: 'Plan needs more details. Please add specific customer names and purposes for each visit.',
    createdAt: createDate(currentYear, currentMonth, 5),
    updatedAt: createDate(currentYear, currentMonth, 12),
  });

  // Add minimal entries for rejected plan
  for (let day = 1; day <= 5; day++) {
    const date = createDate(nextYear, nextMonth, day);
    const dayName = getDayName(date);
    
    entries.push({
      id: generateId(),
      travelPlanId: plan5Id,
      date,
      day: dayName,
      fromLocation: 'Bangalore',
      toLocation: 'Hyderabad',
      areaRegion: 'South',
      customerName: `Rejected Customer ${day}`,
      purpose: 'Product Demo',
      plannedCheckIn: '09:00',
      plannedCheckOut: '17:00',
      status: 'planned',
      photos: [],
      isAdHoc: false,
      createdAt: createDate(currentYear, currentMonth, 5),
      updatedAt: createDate(currentYear, currentMonth, 12),
    });
  }

  // ========== CORNER CASES ==========
  
  // Entry with ad-hoc flag
  entries.push({
    id: generateId(),
    travelPlanId: plan1Id,
    date: createDate(currentYear, currentMonth, 20),
    day: getDayName(createDate(currentYear, currentMonth, 20)),
    fromLocation: 'Mumbai',
    toLocation: 'Pune',
    areaRegion: 'West',
    customerName: 'Ad-hoc Customer',
    purpose: 'Technical Query',
    plannedCheckIn: '14:00',
    plannedCheckOut: '16:00',
    status: 'planned',
    photos: [],
    isAdHoc: true, // This was added after plan approval
    createdAt: createDate(currentYear, currentMonth, 18),
    updatedAt: createDate(currentYear, currentMonth, 18),
  });

  // Entry with multiple photos
  entries.push({
    id: generateId(),
    travelPlanId: plan1Id,
    date: createDate(currentYear, currentMonth, 8),
    day: getDayName(createDate(currentYear, currentMonth, 8)),
    fromLocation: 'Mumbai',
    toLocation: 'Ahmedabad',
    areaRegion: 'West',
    customerName: 'Photo Rich Customer',
    purpose: 'Site Survey',
    plannedCheckIn: '08:00',
    plannedCheckOut: '18:00',
    actualCheckIn: '08:15',
    actualCheckOut: '18:30',
    status: 'completed',
    photos: ['photo-1.jpg', 'photo-2.jpg', 'photo-3.jpg', 'photo-4.jpg', 'photo-5.jpg'],
    notes: 'Comprehensive site survey with multiple photos',
    isAdHoc: false,
    createdAt: createDate(currentYear, currentMonth, 1),
    updatedAt: createDate(currentYear, currentMonth, 8),
  });

  // Entry with time variance
  entries.push({
    id: generateId(),
    travelPlanId: plan1Id,
    date: createDate(currentYear, currentMonth, 12),
    day: getDayName(createDate(currentYear, currentMonth, 12)),
    fromLocation: 'Pune',
    toLocation: 'Mumbai',
    areaRegion: 'West',
    customerName: 'Time Variance Customer',
    purpose: 'Customer Meeting',
    plannedCheckIn: '10:00',
    plannedCheckOut: '15:00',
    actualCheckIn: '10:45', // 45 min late
    actualCheckOut: '16:30', // 1.5 hours late
    status: 'completed',
    photos: [],
    notes: 'Traffic delay caused late arrival',
    isAdHoc: false,
    createdAt: createDate(currentYear, currentMonth, 1),
    updatedAt: createDate(currentYear, currentMonth, 12),
  });

  return { plans, entries };
};

