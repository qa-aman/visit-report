import { VisitEntry, ContactPerson } from '@/types';
import { generateId } from './utils';

const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();

// Helper to create dates
const createDate = (daysAgo: number): string => {
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// Helper to get day of week
const getDayName = (date: Date): string => {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return days[date.getDay()];
};

export const seedVisitEntries = (): VisitEntry[] => {
  const entries: VisitEntry[] = [];

  // ========== POSITIVE USE CASES ==========
  
  // 1. Successful high-value deal
  entries.push({
    id: generateId(),
    visitReportId: 'se-001-2024-01',
    serialNumber: 1,
    dateOfVisit: createDate(2),
    dayOfVisit: getDayName(new Date(createDate(2))),
    companyName: 'EPIGRAL',
    plant: 'YAMUNA, H202',
    cityArea: 'DAHEJ',
    state: 'GUJARAT',
    contactPersons: [
      {
        id: generateId(),
        name: 'NIRMAL GOHIL',
        designation: 'MANAGER - MECHANICAL',
        mobile: '6357997198',
        email: 'nirmal.gohil@epigral.com',
      },
      {
        id: generateId(),
        name: 'HIREN RANA',
        designation: 'MECHANICAL ENGINEER',
        mobile: '9876543210',
        email: 'hiren.rana@epigral.com',
      },
    ],
    purposeOfMeeting: 'DEVELOPMENT',
    discussionPoints: 'Discussed new product line 2124 and 1570-WELDED specifications. Conducted technical survey for upcoming project requirements.',
    productServices: 'GASKET',
    actionStep: 'BQ SUBMITTING',
    remarks: 'MULTIPLE SIZE QUOTE AND SUGGESTION 4MM SQ, EA-202. Received positive feedback on product quality.',
    potentialSaleValue: '3,00,000',
    visitOutcome: 'Satisfied',
    convertStatus: 'Proposal',
    status: 'In Progress',
    result: '',
    closureDate: '',
    createdAt: createDate(2),
    updatedAt: createDate(2),
  });

  // 2. Technical query resolved successfully
  entries.push({
    id: generateId(),
    visitReportId: 'se-001-2024-01',
    serialNumber: 2,
    dateOfVisit: createDate(5),
    dayOfVisit: getDayName(new Date(createDate(5))),
    companyName: 'RELIANCE INDUSTRIES',
    plant: 'JAMNAGAR REFINERY',
    cityArea: 'JAMNAGAR',
    state: 'GUJARAT',
    contactPersons: [
      {
        id: generateId(),
        name: 'RAJESH PATEL',
        designation: 'SENIOR ENGINEER',
        mobile: '9876543211',
        email: 'rajesh.patel@ril.com',
      },
    ],
    purposeOfMeeting: 'TECHNICAL QUERY',
    discussionPoints: 'Solved technical issues with existing installation. Collected feedback on product performance.',
    productServices: 'SEALING SOLUTIONS',
    actionStep: 'FOLLOW UP SCHEDULED',
    remarks: 'Customer satisfied with resolution. Initiated process for additional orders.',
    potentialSaleValue: '5,50,000',
    visitOutcome: 'Satisfied',
    convertStatus: 'Negotiation',
    status: 'In Progress',
    result: '',
    closureDate: '',
    createdAt: createDate(5),
    updatedAt: createDate(5),
  });

  // 3. Product demonstration leading to enquiry
  entries.push({
    id: generateId(),
    visitReportId: 'se-001-2024-01',
    serialNumber: 3,
    dateOfVisit: createDate(8),
    dayOfVisit: getDayName(new Date(createDate(8))),
    companyName: 'TATA CHEMICALS',
    plant: 'MITHAPUR',
    cityArea: 'MITHAPUR',
    state: 'GUJARAT',
    contactPersons: [
      {
        id: generateId(),
        name: 'AMIT KUMAR',
        designation: 'PLANT MANAGER',
        mobile: '9876543212',
        email: 'amit.kumar@tatachemicals.com',
      },
      {
        id: generateId(),
        name: 'SUNITA SHARMA',
        designation: 'PROCUREMENT HEAD',
        mobile: '9876543213',
        email: 'sunita.sharma@tatachemicals.com',
      },
    ],
    purposeOfMeeting: 'PRODUCT DEMONSTRATION',
    discussionPoints: 'Conducted live demonstration of new sealing technology. Surveyed current equipment for compatibility.',
    productServices: 'ADVANCED GASKETS',
    actionStep: 'SEND DETAILED QUOTATION',
    remarks: 'Received strong interest. Customer requested samples for testing.',
    potentialSaleValue: '8,00,000',
    visitOutcome: 'Satisfied',
    convertStatus: 'Enquiry',
    status: 'Open',
    result: '',
    closureDate: '',
    createdAt: createDate(8),
    updatedAt: createDate(8),
  });

  // ========== NEGATIVE USE CASES ==========

  // 4. Dissatisfied customer - product issues
  entries.push({
    id: generateId(),
    visitReportId: 'se-001-2024-01',
    serialNumber: 4,
    dateOfVisit: createDate(10),
    dayOfVisit: getDayName(new Date(createDate(10))),
    companyName: 'ADANI GROUP',
    plant: 'MUNDRA PORT',
    cityArea: 'MUNDRA',
    state: 'GUJARAT',
    contactPersons: [
      {
        id: generateId(),
        name: 'VIKAS SINGH',
        designation: 'MAINTENANCE MANAGER',
        mobile: '9876543214',
        email: 'vikas.singh@adani.com',
      },
    ],
    purposeOfMeeting: 'SERVICE VISIT',
    discussionPoints: 'Addressed complaints about product failure. Collected samples for analysis.',
    productServices: 'GASKET',
    actionStep: 'INVESTIGATE ROOT CAUSE',
    remarks: 'Customer reported premature failure. Need to analyze and provide solution. Replacement required.',
    potentialSaleValue: '0',
    visitOutcome: 'Dissatisfied',
    convertStatus: 'PreLead',
    status: 'On Hold',
    result: '',
    closureDate: '',
    createdAt: createDate(10),
    updatedAt: createDate(10),
  });

  // 5. Need for improvement - competitive pricing
  entries.push({
    id: generateId(),
    visitReportId: 'se-001-2024-01',
    serialNumber: 5,
    dateOfVisit: createDate(12),
    dayOfVisit: getDayName(new Date(createDate(12))),
    companyName: 'ESSAR STEEL',
    plant: 'HAZIRA',
    cityArea: 'HAZIRA',
    state: 'GUJARAT',
    contactPersons: [
      {
        id: generateId(),
        name: 'RAJENDRA MEHTA',
        designation: 'PURCHASE MANAGER',
        mobile: '9876543215',
        email: 'rajendra.mehta@essar.com',
      },
    ],
    purposeOfMeeting: 'NEGOTIATION',
    discussionPoints: 'Discussed pricing and terms. Customer found competitor pricing more attractive.',
    productServices: 'INDUSTRIAL SEALS',
    actionStep: 'REVIEW PRICING STRATEGY',
    remarks: 'Need to improve pricing competitiveness. Customer open to discussion if price adjusted.',
    potentialSaleValue: '12,00,000',
    visitOutcome: 'Need for Improvement',
    convertStatus: 'Negotiation',
    status: 'Pending',
    result: '',
    closureDate: '',
    createdAt: createDate(12),
    updatedAt: createDate(12),
  });

  // ========== CORNER CASES ==========

  // 6. Very high value opportunity
  entries.push({
    id: generateId(),
    visitReportId: 'se-001-2024-01',
    serialNumber: 6,
    dateOfVisit: createDate(15),
    dayOfVisit: getDayName(new Date(createDate(15))),
    companyName: 'LARSEN & TOUBRO',
    plant: 'HAZIRA MANUFACTURING',
    cityArea: 'HAZIRA',
    state: 'GUJARAT',
    contactPersons: [
      {
        id: generateId(),
        name: 'ANIL DESAI',
        designation: 'PROJECT DIRECTOR',
        mobile: '9876543216',
        email: 'anil.desai@lnt.co.in',
      },
      {
        id: generateId(),
        name: 'KAVITA REDDY',
        designation: 'TECHNICAL HEAD',
        mobile: '9876543217',
        email: 'kavita.reddy@lnt.co.in',
      },
      {
        id: generateId(),
        name: 'MOHAN KUMAR',
        designation: 'PROCUREMENT MANAGER',
        mobile: '9876543218',
        email: 'mohan.kumar@lnt.co.in',
      },
    ],
    purposeOfMeeting: 'DEVELOPMENT',
    discussionPoints: 'Major project discussion for upcoming plant expansion. Multiple product lines required. Conducted comprehensive site survey.',
    productServices: 'COMPLETE SEALING SOLUTIONS - MULTIPLE PRODUCTS',
    actionStep: 'SUBMIT COMPREHENSIVE PROPOSAL',
    remarks: 'Large scale opportunity. Multiple decision makers involved. Long sales cycle expected. Need to maintain regular follow-up.',
    potentialSaleValue: '50,00,000',
    visitOutcome: 'Satisfied',
    convertStatus: 'Proposal',
    status: 'In Progress',
    result: '',
    closureDate: '',
    createdAt: createDate(15),
    updatedAt: createDate(15),
  });

  // 7. Minimal data - only required fields
  entries.push({
    id: generateId(),
    visitReportId: 'se-001-2024-01',
    serialNumber: 7,
    dateOfVisit: createDate(18),
    dayOfVisit: getDayName(new Date(createDate(18))),
    companyName: 'GUJARAT AMBUJA',
    plant: '',
    cityArea: 'SURAT',
    state: 'GUJARAT',
    contactPersons: [
      {
        id: generateId(),
        name: 'SURESH KUMAR',
        designation: '',
        mobile: '',
        email: '',
      },
    ],
    purposeOfMeeting: 'FOLLOW UP',
    discussionPoints: '',
    productServices: '',
    actionStep: '',
    remarks: '',
    potentialSaleValue: '',
    visitOutcome: 'Satisfied',
    convertStatus: 'PreLead',
    status: 'Open',
    result: '',
    closureDate: '',
    createdAt: createDate(18),
    updatedAt: createDate(18),
  });

  // 8. Closed deal - Won
  entries.push({
    id: generateId(),
    visitReportId: 'se-001-2024-01',
    serialNumber: 8,
    dateOfVisit: createDate(20),
    dayOfVisit: getDayName(new Date(createDate(20))),
    companyName: 'ULTRATECH CEMENT',
    plant: 'KOTPUTLI',
    cityArea: 'KOTPUTLI',
    state: 'RAJASTHAN',
    contactPersons: [
      {
        id: generateId(),
        name: 'RAJESH VERMA',
        designation: 'PLANT HEAD',
        mobile: '9876543219',
        email: 'rajesh.verma@ultratech.com',
      },
    ],
    purposeOfMeeting: 'NEGOTIATION',
    discussionPoints: 'Finalized terms and conditions. Received purchase order.',
    productServices: 'CEMENT PLANT SEALS',
    actionStep: 'PROCESS ORDER',
    remarks: 'Deal closed successfully. Order value: ₹15,00,000. Delivery scheduled for next month.',
    potentialSaleValue: '15,00,000',
    visitOutcome: 'Satisfied',
    convertStatus: 'Closed',
    status: 'Closed',
    result: 'Won',
    closureDate: createDate(20),
    createdAt: createDate(20),
    updatedAt: createDate(20),
  });

  // 9. Closed deal - Lost
  entries.push({
    id: generateId(),
    visitReportId: 'se-001-2024-01',
    serialNumber: 9,
    dateOfVisit: createDate(25),
    dayOfVisit: getDayName(new Date(createDate(25))),
    companyName: 'JINDAL STEEL',
    plant: 'RAIGARH',
    cityArea: 'RAIGARH',
    state: 'CHHATTISGARH',
    contactPersons: [
      {
        id: generateId(),
        name: 'AMITABH SHARMA',
        designation: 'PROCUREMENT HEAD',
        mobile: '9876543220',
        email: 'amitabh.sharma@jindal.com',
      },
    ],
    purposeOfMeeting: 'NEGOTIATION',
    discussionPoints: 'Competitive bidding process. Customer chose alternative supplier.',
    productServices: 'STEEL PLANT SEALS',
    actionStep: 'ANALYZE LOSS REASONS',
    remarks: 'Lost to competitor due to pricing. Customer relationship maintained for future opportunities.',
    potentialSaleValue: '20,00,000',
    visitOutcome: 'Dissatisfied',
    convertStatus: 'Closed',
    status: 'Closed',
    result: 'Lost',
    closureDate: createDate(25),
    createdAt: createDate(25),
    updatedAt: createDate(25),
  });

  // 10. Multiple visits same company - different dates
  entries.push({
    id: generateId(),
    visitReportId: 'se-001-2024-01',
    serialNumber: 10,
    dateOfVisit: createDate(1),
    dayOfVisit: getDayName(new Date(createDate(1))),
    companyName: 'EPIGRAL',
    plant: 'YAMUNA, H202',
    cityArea: 'DAHEJ',
    state: 'GUJARAT',
    contactPersons: [
      {
        id: generateId(),
        name: 'SAGAR TALWEKAR',
        designation: 'MECHANICAL',
        mobile: '6357997199',
        email: 'sagar.talwekar@epigral.com',
      },
    ],
    purposeOfMeeting: 'TECHNICAL QUERY',
    discussionPoints: '1570-WELDED technical specifications clarification. EA-202 project requirements.',
    productServices: 'GASKET',
    actionStep: 'PROVIDE TECHNICAL DOCUMENTATION',
    remarks: 'EA-202 project follow-up. Multiple size requirements discussed.',
    potentialSaleValue: '2,50,000',
    visitOutcome: 'Need for Improvement',
    convertStatus: 'Enquiry',
    status: 'Open',
    result: '',
    closureDate: '',
    createdAt: createDate(1),
    updatedAt: createDate(1),
  });

  // ========== SECOND SALES ENGINEER DATA ==========

  // 11. Priya's successful visit
  entries.push({
    id: generateId(),
    visitReportId: 'se-002-2024-01',
    serialNumber: 11,
    dateOfVisit: createDate(3),
    dayOfVisit: getDayName(new Date(createDate(3))),
    companyName: 'VEDANTA LIMITED',
    plant: 'BHILAI',
    cityArea: 'BHILAI',
    state: 'CHHATTISGARH',
    contactPersons: [
      {
        id: generateId(),
        name: 'PRIYANKA MISHRA',
        designation: 'ENGINEERING MANAGER',
        mobile: '9876543221',
        email: 'priyanka.mishra@vedanta.co.in',
      },
    ],
    purposeOfMeeting: 'DEVELOPMENT',
    discussionPoints: 'New project requirements discussed. Conducted site survey for upcoming expansion.',
    productServices: 'MINING SEALS',
    actionStep: 'SUBMIT PROPOSAL',
    remarks: 'Strong interest shown. Follow-up meeting scheduled.',
    potentialSaleValue: '6,00,000',
    visitOutcome: 'Satisfied',
    convertStatus: 'Proposal',
    status: 'In Progress',
    result: '',
    closureDate: '',
    createdAt: createDate(3),
    updatedAt: createDate(3),
  });

  // 12. Priya's follow-up visit
  entries.push({
    id: generateId(),
    visitReportId: 'se-002-2024-01',
    serialNumber: 12,
    dateOfVisit: createDate(7),
    dayOfVisit: getDayName(new Date(createDate(7))),
    companyName: 'HINDALCO INDUSTRIES',
    plant: 'RENUKOOT',
    cityArea: 'RENUKOOT',
    state: 'UTTAR PRADESH',
    contactPersons: [
      {
        id: generateId(),
        name: 'ANJALI SINGH',
        designation: 'PLANT MANAGER',
        mobile: '9876543222',
        email: 'anjali.singh@hindalco.com',
      },
      {
        id: generateId(),
        name: 'ROHIT KAPOOR',
        designation: 'TECHNICAL HEAD',
        mobile: '9876543223',
        email: 'rohit.kapoor@hindalco.com',
      },
    ],
    purposeOfMeeting: 'FOLLOW UP',
    discussionPoints: 'Follow-up on previous proposal. Addressed technical queries.',
    productServices: 'ALUMINUM PLANT SEALS',
    actionStep: 'WAIT FOR DECISION',
    remarks: 'Proposal under review. Expected decision in 2 weeks.',
    potentialSaleValue: '4,50,000',
    visitOutcome: 'Satisfied',
    convertStatus: 'Proposal',
    status: 'Pending',
    result: '',
    closureDate: '',
    createdAt: createDate(7),
    updatedAt: createDate(7),
  });

  // 13. Priya's service visit
  entries.push({
    id: generateId(),
    visitReportId: 'se-002-2024-01',
    serialNumber: 13,
    dateOfVisit: createDate(11),
    dayOfVisit: getDayName(new Date(createDate(11))),
    companyName: 'NALCO',
    plant: 'ANGUL',
    cityArea: 'ANGUL',
    state: 'ODISHA',
    contactPersons: [
      {
        id: generateId(),
        name: 'BIBEK DAS',
        designation: 'MAINTENANCE ENGINEER',
        mobile: '9876543224',
        email: 'bibek.das@nalcoindia.co.in',
      },
    ],
    purposeOfMeeting: 'SERVICE VISIT',
    discussionPoints: 'Routine maintenance check. Collected feedback on installed products.',
    productServices: 'MAINTENANCE SEALS',
    actionStep: 'SCHEDULE NEXT SERVICE',
    remarks: 'All products functioning well. Customer satisfied with service.',
    potentialSaleValue: '1,50,000',
    visitOutcome: 'Satisfied',
    convertStatus: 'Enquiry',
    status: 'Open',
    result: '',
    closureDate: '',
    createdAt: createDate(11),
    updatedAt: createDate(11),
  });

  // 14. Priya's cancelled deal
  entries.push({
    id: generateId(),
    visitReportId: 'se-002-2024-01',
    serialNumber: 14,
    dateOfVisit: createDate(14),
    dayOfVisit: getDayName(new Date(createDate(14))),
    companyName: 'SAIL',
    plant: 'ROURKELA',
    cityArea: 'ROURKELA',
    state: 'ODISHA',
    contactPersons: [
      {
        id: generateId(),
        name: 'SANJAY KUMAR',
        designation: 'PROCUREMENT MANAGER',
        mobile: '9876543225',
        email: 'sanjay.kumar@sail.co.in',
      },
    ],
    purposeOfMeeting: 'NEGOTIATION',
    discussionPoints: 'Project cancelled by customer due to budget constraints.',
    productServices: 'STEEL PLANT EQUIPMENT',
    actionStep: 'MAINTAIN RELATIONSHIP',
    remarks: 'Deal cancelled. Customer mentioned future opportunities when budget available.',
    potentialSaleValue: '10,00,000',
    visitOutcome: 'Dissatisfied',
    convertStatus: 'Closed',
    status: 'Closed',
    result: 'Cancelled',
    closureDate: createDate(14),
    createdAt: createDate(14),
    updatedAt: createDate(14),
  });

  // ========== EDGE CASES ==========

  // 15. Very long text fields
  entries.push({
    id: generateId(),
    visitReportId: 'se-001-2024-01',
    serialNumber: 15,
    dateOfVisit: createDate(22),
    dayOfVisit: getDayName(new Date(createDate(22))),
    companyName: 'BHARAT PETROLEUM CORPORATION LIMITED',
    plant: 'MUMBAI REFINERY COMPLEX',
    cityArea: 'MUMBAI',
    state: 'MAHARASHTRA',
    contactPersons: [
      {
        id: generateId(),
        name: 'DR. RAJENDRA KUMAR SHARMA',
        designation: 'CHIEF TECHNICAL OFFICER - REFINERY OPERATIONS',
        mobile: '9876543226',
        email: 'rajendra.sharma@bharatpetroleum.in',
      },
      {
        id: generateId(),
        name: 'MRS. KAVITA PATEL',
        designation: 'SENIOR MANAGER - PROCUREMENT & SUPPLY CHAIN',
        mobile: '9876543227',
        email: 'kavita.patel@bharatpetroleum.in',
      },
      {
        id: generateId(),
        name: 'MR. AMIT KUMAR VERMA',
        designation: 'ASSISTANT GENERAL MANAGER - MAINTENANCE',
        mobile: '9876543228',
        email: 'amit.verma@bharatpetroleum.in',
      },
    ],
    purposeOfMeeting: 'DEVELOPMENT',
    discussionPoints: 'Comprehensive discussion on refinery expansion project covering multiple units including crude distillation, catalytic cracking, and hydrotreating processes. Detailed technical requirements for high-temperature and high-pressure sealing solutions. Conducted extensive site survey covering all critical areas. Discussed compliance requirements with industry standards including API, ASME, and ISO certifications.',
    productServices: 'COMPREHENSIVE REFINERY SEALING SOLUTIONS - HIGH TEMPERATURE GASKETS, EXPANSION JOINTS, VALVE SEALS, PUMP SEALS, AND SPECIALIZED CUSTOM SOLUTIONS',
    actionStep: 'PREPARE DETAILED TECHNICAL PROPOSAL WITH COMPLIANCE DOCUMENTATION AND SUBMIT WITHIN 2 WEEKS. SCHEDULE FOLLOW-UP MEETING WITH TECHNICAL TEAM.',
    remarks: 'Large-scale opportunity with multiple decision makers. Project timeline spans 18 months. Strong technical requirements. Need to coordinate with engineering team for custom solutions. Customer emphasized on quality and compliance. Budget approval pending from board. Multiple vendors being evaluated. Our technical expertise is a key differentiator. Regular follow-up required to maintain engagement.',
    potentialSaleValue: '75,00,000',
    visitOutcome: 'Satisfied',
    convertStatus: 'Proposal',
    status: 'In Progress',
    result: '',
    closureDate: '',
    createdAt: createDate(22),
    updatedAt: createDate(22),
  });

  // 16. Different states and cities
  entries.push({
    id: generateId(),
    visitReportId: 'se-001-2024-01',
    serialNumber: 16,
    dateOfVisit: createDate(28),
    dayOfVisit: getDayName(new Date(createDate(28))),
    companyName: 'ITC LIMITED',
    plant: 'BANGALORE',
    cityArea: 'BANGALORE',
    state: 'KARNATAKA',
    contactPersons: [
      {
        id: generateId(),
        name: 'VENKATESH RAO',
        designation: 'FACILITIES MANAGER',
        mobile: '9876543229',
        email: 'venkatesh.rao@itc.in',
      },
    ],
    purposeOfMeeting: 'TECHNICAL QUERY',
    discussionPoints: 'Technical support for existing installation.',
    productServices: 'FMCG PLANT SEALS',
    actionStep: 'PROVIDE TECHNICAL SUPPORT',
    remarks: 'Customer in different state. Remote support provided.',
    potentialSaleValue: '3,50,000',
    visitOutcome: 'Satisfied',
    convertStatus: 'Enquiry',
    status: 'Open',
    result: '',
    closureDate: '',
    createdAt: createDate(28),
    updatedAt: createDate(28),
  });

  // 17. Today's visit
  entries.push({
    id: generateId(),
    visitReportId: 'se-001-2024-01',
    serialNumber: 17,
    dateOfVisit: now.toISOString().split('T')[0],
    dayOfVisit: getDayName(now),
    companyName: 'INDIAN OIL CORPORATION',
    plant: 'GUWAHATI REFINERY',
    cityArea: 'GUWAHATI',
    state: 'ASSAM',
    contactPersons: [
      {
        id: generateId(),
        name: 'PRANAB BORAH',
        designation: 'REFINERY MANAGER',
        mobile: '9876543230',
        email: 'pranab.borah@indianoil.in',
      },
    ],
    purposeOfMeeting: 'PRODUCT DEMONSTRATION',
    discussionPoints: 'Demonstrated new product line. Customer showed interest.',
    productServices: 'REFINERY SEALS',
    actionStep: 'SEND SAMPLES',
    remarks: 'Visit completed today. Follow-up required.',
    potentialSaleValue: '9,00,000',
    visitOutcome: 'Satisfied',
    convertStatus: 'PreLead',
    status: 'Open',
    result: '',
    closureDate: '',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  });

  // 18. Old visit from last month
  entries.push({
    id: generateId(),
    visitReportId: 'se-001-2024-01',
    serialNumber: 18,
    dateOfVisit: new Date(currentYear, currentMonth - 1, 15).toISOString().split('T')[0],
    dayOfVisit: getDayName(new Date(currentYear, currentMonth - 1, 15)),
    companyName: 'GAIL INDIA',
    plant: 'PATA',
    cityArea: 'PATA',
    state: 'UTTAR PRADESH',
    contactPersons: [
      {
        id: generateId(),
        name: 'ASHOK TIWARI',
        designation: 'PLANT SUPERINTENDENT',
        mobile: '9876543231',
        email: 'ashok.tiwari@gail.co.in',
      },
    ],
    purposeOfMeeting: 'FOLLOW UP',
    discussionPoints: 'Follow-up on previous discussion.',
    productServices: 'GAS PLANT SEALS',
    actionStep: 'CONTINUE FOLLOW-UP',
    remarks: 'Ongoing discussion from last month.',
    potentialSaleValue: '7,00,000',
    visitOutcome: 'Satisfied',
    convertStatus: 'Negotiation',
    status: 'In Progress',
    result: '',
    closureDate: '',
    createdAt: new Date(currentYear, currentMonth - 1, 15).toISOString(),
    updatedAt: new Date(currentYear, currentMonth - 1, 15).toISOString(),
  });

  return entries;
};

