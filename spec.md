# Visit Report System - Specification Document

## 1. Overview

The Visit Report System is designed for sales teams to track and manage client visits. It captures comprehensive information about each visit, including client details, meeting purpose, discussions, products/services, action items, potential sales opportunities, and visit outcomes.

## 2. System Logic

### 2.1 Report Structure

#### 2.1.1 Header Information
- **Visit Report Period**: Monthly reporting (e.g., Jan'2022)
- **Sales Engineer**: The person creating/filling the report
- **Team Leader**: Manager overseeing the sales engineer
- **Vertical**: Business division (e.g., Fluid Sealing Div.)

#### 2.1.2 Visit Entry Fields
Each visit record contains the following information:

1. **Serial Number**: Auto-incrementing unique identifier
2. **Date of Visit**: Date when the visit occurred (format: DD-MM-YYYY)
3. **Day of Visit**: Day of the week (e.g., THURSDAY)
4. **Name of Company**: Client company name
5. **PLANT**: Specific plant/location identifier
6. **City / Area**: Geographic location
7. **State**: State where visit occurred
8. **Contact Person**: Name(s) of person(s) met during visit
9. **Designation**: Job title/role of contact person
10. **Mobile**: Contact's mobile number
11. **Email**: Contact's email address
12. **Purpose of Meeting**: Reason for the visit (e.g., DEVELOPMENT, TECHNICAL QUERY)
13. **Discussion Points**: Specific topics/products discussed (e.g., product codes, technical details)
14. **Product / Services**: Products or services discussed/presented
15. **Action Step / Action Plan**: Next steps or commitments made
16. **Remarks / Notes / Comments**: Additional observations or important information
17. **Potential Sale Value / Opportunity Size**: Estimated monetary value of opportunity (in currency format)
18. **Visit Outcome**: Result of the visit (Satisfied, Dissatisfied, Need for Improvement)
19. **Convert**: Conversion status (PreLead / Enquiry / etc.)
20. **Status**: Current status of the opportunity (to be defined)
21. **Result**: Final result of the opportunity (to be defined)
22. **Closure Date**: Date when opportunity was closed (if applicable)

### 2.2 Business Rules & Logic

#### 2.2.1 Writing Guidelines
- **Style**: Write in normal style using standard language
- **Length**: One or two sentences per field
- **Action Words**: Use action verbs such as:
  - Achieved
  - Conducted
  - Collected
  - Surveyed
  - Persuaded
  - Initiated
  - Solved
  - Received
- **Avoid**:
  - Personal pronouns: "I met them", "customer said", "I told them", "Mr so and so"
  - Routine activities in current customer activity
  - Writing everything in CAPITALS
- **Include**:
  - Quantities and values (data-driven reporting)
  - Future reports/planning information when relevant

#### 2.2.2 Data Validation Rules
- Date of Visit must be a valid date
- Day of Visit should automatically match the Date of Visit
- Email addresses should follow standard email format
- Mobile numbers should be validated (numeric, appropriate length)
- Potential Sale Value should be numeric and formatted with commas (e.g., 3,00,000)
- Visit Outcome must be one of the predefined options
- Convert field must be one of the predefined options

#### 2.2.3 Workflow Logic
1. Sales Engineer creates a new visit report entry
2. System validates all required fields
3. System calculates/derives Day of Visit from Date of Visit
4. User selects Visit Outcome from predefined options
5. User selects Convert status from predefined options
6. System tracks Status and Result (may be updated later)
7. Closure Date is set when opportunity is closed

## 3. User Stories

### 3.1 Sales Engineer User Stories

#### US-001: Create New Visit Report Entry
**As a** Sales Engineer  
**I want to** create a new visit report entry after visiting a client  
**So that** I can document the visit details and track the opportunity

**Acceptance Criteria:**
- I can fill in all visit details in a form
- The form includes all 22 fields mentioned in the specification
- Date of Visit automatically populates Day of Visit
- I can save the entry as draft or submit it
- I can see a preview of my entry before submitting

#### US-002: View My Visit Reports
**As a** Sales Engineer  
**I want to** view all my visit reports  
**So that** I can track my visits and follow up on action items

**Acceptance Criteria:**
- I can see a list of all my visit reports
- I can filter by date range, company, or status
- I can sort by date, company, or potential sale value
- I can view detailed information for each visit
- I can see visit reports grouped by month/period

#### US-003: Edit Visit Report
**As a** Sales Engineer  
**I want to** edit my visit reports  
**So that** I can update information or correct mistakes

**Acceptance Criteria:**
- I can edit any field in my visit report
- I can only edit reports I created
- System tracks edit history
- I can see when the report was last modified

#### US-004: Update Visit Status
**As a** Sales Engineer  
**I want to** update the status and result of a visit  
**So that** I can track the progress of opportunities

**Acceptance Criteria:**
- I can update Status field with predefined options
- I can update Result field with predefined options
- I can set Closure Date when opportunity is closed
- System validates that Closure Date is after Visit Date

#### US-005: Add Multiple Contact Persons
**As a** Sales Engineer  
**I want to** add multiple contact persons for a single visit  
**So that** I can document all stakeholders met during the visit

**Acceptance Criteria:**
- I can add multiple contact persons in one visit entry
- Each contact person can have their own designation, mobile, and email
- System displays all contacts clearly in the report

#### US-006: Calculate Monthly Report
**As a** Sales Engineer  
**I want to** generate a monthly visit report  
**So that** I can submit it to my Team Leader

**Acceptance Criteria:**
- I can select a month/period
- System aggregates all visits for that period
- Report includes header information (Sales Engineer, Team Leader, Vertical)
- Report can be exported/printed in a formatted view

#### US-016: View Visit Details
**As a** Sales Engineer  
**I want to** click on a visit report row to see full details  
**So that** I can review all information about a specific visit

**Acceptance Criteria:**
- I can click on any visit row in the table
- A detailed view opens showing all 22 fields
- I can see all contact persons for that visit
- I can edit the visit from the detail view
- I can navigate back to the dashboard

#### US-017: Filter Visits by Statistics
**As a** Sales Engineer  
**I want to** click on statistic cards to filter visits  
**So that** I can quickly see visits matching that criteria

**Acceptance Criteria:**
- Clicking "Total Visits" card shows all visits
- Clicking "Satisfied Visits" card filters to show only satisfied visits
- Clicking "This Month" card filters to show only current month visits
- Clicking "Total Opportunity" card shows visits sorted by value
- Filter state is clearly indicated
- I can clear filters to see all visits again

#### US-018: Edit Visit Report from Detail View
**As a** Sales Engineer  
**I want to** edit a visit report from its detail page  
**So that** I can update information without navigating away

**Acceptance Criteria:**
- I can click an "Edit" button on the visit detail page
- The form opens with all existing data pre-filled
- I can modify any field
- Changes are saved and reflected immediately
- I can cancel editing without saving changes

### 3.2 Team Leader User Stories

#### US-007: Review Team Visit Reports
**As a** Team Leader  
**I want to** review visit reports from my team members  
**So that** I can monitor team performance and provide guidance

**Acceptance Criteria:**
- I can see all visit reports from my team members
- I can filter by team member, date, or company
- I can see aggregated statistics (total visits, total opportunities, etc.)
- I can view individual visit details

#### US-008: Approve/Reject Visit Reports
**As a** Team Leader  
**I want to** approve or reject visit reports  
**So that** I can ensure quality and completeness

**Acceptance Criteria:**
- I can approve a visit report
- I can reject a visit report with comments
- Sales Engineer is notified of approval/rejection
- Rejected reports can be resubmitted after corrections

#### US-009: View Team Analytics
**As a** Team Leader  
**I want to** view analytics and insights from team visit reports  
**So that** I can make data-driven decisions

**Acceptance Criteria:**
- I can see total visits per team member
- I can see total potential sale value by team member
- I can see visit outcomes distribution (Satisfied/Dissatisfied/Need for Improvement)
- I can see conversion rates (PreLead/Enquiry)
- I can see trends over time

#### US-019: View Team Member Details
**As a** Team Leader  
**I want to** click on a team member card to see their visit reports  
**So that** I can review individual performance

**Acceptance Criteria:**
- I can click on any team member card
- A filtered view shows only that member's visits
- I can see statistics specific to that team member
- I can view individual visit details
- I can navigate back to team overview

#### US-020: Filter Team Visits by Statistics
**As a** Team Leader  
**I want to** click on statistic cards to filter team visits  
**So that** I can analyze specific aspects of team performance

**Acceptance Criteria:**
- Clicking "Total Visits" shows all team visits
- Clicking "Satisfied" filters to satisfied visits only
- Clicking "Need Improvement" filters to visits needing improvement
- Clicking "Total Opportunity" shows visits sorted by value
- Filter state is clearly indicated

#### US-021: View Visit Details as Team Leader
**As a** Team Leader  
**I want to** click on a visit row to see full details  
**So that** I can review team member visit reports in detail

**Acceptance Criteria:**
- I can click on any visit row in the team table
- A detailed view shows all visit information
- I can see which team member created the visit
- I can approve or reject the visit from detail view
- I can add comments or feedback

### 3.3 System/Admin User Stories

#### US-010: Manage Verticals
**As a** System Administrator  
**I want to** manage verticals (business divisions)  
**So that** reports can be categorized correctly

**Acceptance Criteria:**
- I can create, edit, and deactivate verticals
- I can assign Team Leaders to verticals
- I can assign Sales Engineers to Team Leaders

#### US-011: Manage Predefined Options
**As a** System Administrator  
**I want to** manage predefined dropdown options  
**So that** data entry is consistent

**Acceptance Criteria:**
- I can manage Purpose of Meeting options
- I can manage Visit Outcome options
- I can manage Convert status options
- I can manage Status options
- I can manage Result options

#### US-012: Data Export
**As a** System Administrator  
**I want to** export visit report data  
**So that** it can be used for analysis in other tools

**Acceptance Criteria:**
- I can export data in CSV format
- I can export data in Excel format
- I can filter data before exporting
- Exported data includes all fields

#### US-022: Access Management Features
**As a** System Administrator  
**I want to** click on management cards to access configuration  
**So that** I can manage system settings

**Acceptance Criteria:**
- Clicking "Manage Verticals" opens vertical management page
- Clicking "Predefined Options" opens options management page
- Clicking "Manage Users" opens user management page
- Clicking "Data Export" opens export interface
- Each management page has appropriate functionality

### 3.4 Common User Stories

#### US-013: Search and Filter
**As a** User  
**I want to** search and filter visit reports  
**So that** I can quickly find specific information

**Acceptance Criteria:**
- I can search by company name
- I can search by contact person name
- I can filter by date range
- I can filter by state/city
- I can filter by product/service
- I can filter by visit outcome
- I can combine multiple filters

#### US-014: Validation and Error Handling
**As a** User  
**I want to** receive clear validation messages  
**So that** I can correct errors quickly

**Acceptance Criteria:**
- Required fields are clearly marked
- Validation errors are shown inline
- Email format is validated
- Mobile number format is validated
- Date format is validated
- Numeric fields (Potential Sale Value) are validated

#### US-015: Responsive Design
**As a** User  
**I want to** access the system on mobile devices  
**So that** I can create visit reports on the go

**Acceptance Criteria:**
- System works on mobile phones
- System works on tablets
- Forms are easy to fill on mobile
- All features are accessible on mobile

## 4. Data Model

### 4.1 Entities

#### VisitReport
- id (Primary Key)
- report_period (e.g., "Jan'2022")
- sales_engineer_id (Foreign Key)
- team_leader_id (Foreign Key)
- vertical_id (Foreign Key)
- created_at
- updated_at
- status (draft/submitted/approved/rejected)

#### VisitEntry
- id (Primary Key)
- visit_report_id (Foreign Key)
- serial_number
- date_of_visit
- day_of_visit (auto-calculated)
- company_name
- plant
- city_area
- state
- purpose_of_meeting
- discussion_points
- product_services
- action_step
- remarks
- potential_sale_value
- visit_outcome
- convert_status
- status
- result
- closure_date
- created_at
- updated_at

#### ContactPerson
- id (Primary Key)
- visit_entry_id (Foreign Key)
- name
- designation
- mobile
- email

#### Vertical
- id (Primary Key)
- name
- description
- active

#### SalesEngineer
- id (Primary Key)
- name
- email
- team_leader_id (Foreign Key)
- active

#### TeamLeader
- id (Primary Key)
- name
- email
- vertical_id (Foreign Key)
- active

## 5. Technical Considerations

### 5.1 Data Validation
- Client-side validation for immediate feedback
- Server-side validation for security
- Email format validation
- Phone number format validation
- Date validation and auto-calculation of day

### 5.2 Data Formatting
- Currency formatting for Potential Sale Value (e.g., 3,00,000)
- Date formatting (DD-MM-YYYY)
- Auto-capitalization for certain fields (e.g., Day of Visit, State)

### 5.3 Performance
- Pagination for large lists of visit reports
- Efficient database queries with proper indexing
- Caching for frequently accessed data (dropdowns, etc.)

### 5.4 Security
- User authentication and authorization
- Role-based access control (Sales Engineer, Team Leader, Admin)
- Data encryption for sensitive information
- Audit logging for all changes

## 6. Future Enhancements (Out of Scope for MVP)

- Email notifications for action items
- Calendar integration for visit scheduling
- Mobile app (native)
- Advanced analytics and reporting
- Integration with CRM systems
- Document attachment capability
- Photo upload for visit documentation
- GPS location tracking
- Offline mode for mobile access

