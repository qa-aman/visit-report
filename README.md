# Visit Report & Travel Planning System

A modern, integrated system for sales teams to plan their monthly travel itineraries and create comprehensive visit reports. Built with a clean, Apple-like design using Next.js 14 and TypeScript.

## 🎯 Overview

This system consists of two interlinked modules:

1. **Travel Planning System** - Plan monthly travel itineraries day-wise with customer visits, locations, purposes, and check-in/check-out times
2. **Visit Report System** - Create detailed visit reports with 22 fields capturing all visit information, outcomes, and opportunities

**Key Workflow:** Sales Engineers first create monthly travel plans → Team Leaders approve plans → Sales Engineers execute visits → Convert planned visits to detailed visit reports

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 👥 Personas & Login

The system includes three personas for testing. Simply click on any persona card on the login page to experience the app with that role:

### Sales Engineer
- **Rajesh Kumar** (rajesh.kumar@company.com)
- **Priya Sharma** (priya.sharma@company.com)

**Capabilities:**
- Create monthly travel plans
- Submit plans for approval
- Execute planned visits
- Convert plans to visit reports
- Create visit reports (with or without linking to plans)
- View personal statistics and analytics

### Team Leader
- **Akhilesh Pathak** (akhilesh.pathak@company.com)

**Capabilities:**
- Review and approve/reject travel plans
- View team travel plans in calendar and table views
- Review team visit reports
- Monitor team performance and analytics
- Track plan execution vs. reporting

### Administrator
- **System Administrator** (admin@company.com)

**Capabilities:**
- Manage system settings
- Configure predefined options
- Manage users and verticals
- Export data

## 📋 Use Cases

### Travel Planning System Use Cases

#### For Sales Engineers

**1. Create Monthly Travel Plan**
- Create a travel plan for any upcoming month
- Plan day-wise visits with customer details
- Specify: Date, From/To locations, Area/Region, Customer Name, Purpose, Check-in/Check-out times
- Upload photos during planning
- Save as draft or submit for approval

**2. View My Travel Plans**
- View all monthly travel plans (draft, submitted, approved, active, completed)
- See calendar view with all planned visits
- Track plan status and approval status
- View statistics: Total visits, Completed, Pending, Conversion rate

**3. Edit Travel Plan**
- Edit draft plans freely
- Modify submitted plans (requires re-submission)
- Update active plans with real-time changes
- Add ad-hoc visits during the month

**4. Update Actual Check-in/Check-out Times**
- Update actual times during visit execution
- System tracks variance from planned times
- Time variance shown in visit report when converted

**5. Upload Visit Photos**
- Upload photos during planning or execution
- Photos linked to both plan entry and visit report
- View photos in plan detail view

**6. Convert Plan to Visit Report**
- Convert completed/in-progress plan entries to visit reports
- Form auto-fills with plan data (date, customer, location, purpose)
- Check-in/out times preserved in remarks
- Photos shared between plan and report
- Bidirectional linking created

**7. Link Visit Report to Plan Entry**
- When creating a new visit report, link it to an existing plan entry
- Modal shows all unconverted plan entries
- Selecting an entry pre-fills the form
- Creates bidirectional link between plan and report

#### For Team Leaders

**8. Review Team Travel Plans**
- View all travel plans submitted by team members
- See plan statistics: Total visits, Completed, Pending, Conversion rate
- Filter by team member, month, or status

**9. Approve/Reject Travel Plans**
- Review plans in two views:
  - **Calendar View**: Monthly grid showing all planned visits, click any day to see details
  - **Table View**: Sortable table with all visit details
- Click any entry to see full details in modal:
  - Date, Customer, Purpose, Locations
  - Check-in/out times (planned and actual)
  - Status, Notes, Photos
  - Link to visit report if converted
- Approve or reject with comments
- Sales Engineer notified of decision

**10. View Team Travel Analytics**
- See total planned visits by team member
- Track conversion rates (plans → reports)
- Monitor compliance (plans submitted on time)
- Compare planned vs. actual visits

**11. Monitor Plan Execution**
- Track which planned visits were executed
- See which visits were converted to reports
- Identify visits completed but not reported
- View execution rate per team member

### Visit Report System Use Cases

#### For Sales Engineers

**1. Create New Visit Report**
- Create visit report with all 22 fields:
  - Visit Information: Date, Day, Company, Plant, City/Area, State
  - Contact Persons: Multiple contacts with name, designation, mobile, email
  - Meeting Details: Purpose, Discussion Points, Products/Services
  - Action Items: Action Steps, Remarks
  - Opportunity: Potential Sale Value, Visit Outcome, Convert Status
  - Status Tracking: Status, Result, Closure Date
- Link to travel plan entry (optional)
- Auto-fill from linked plan entry
- Form validation with error messages
- Save and view immediately

**2. View My Visit Reports**
- Dashboard showing all visit reports
- Statistics cards: Total Visits, Total Opportunity, Satisfied Visits, This Month
- Clickable stat cards to filter visits
- Search by company, contact, purpose, or product
- Advanced filters: Date range, State, City, Product, Outcome
- Pagination for large datasets

**3. View Visit Details**
- Click any visit row to see full details
- All 22 fields displayed in organized sections
- All contact persons shown
- Link to original travel plan (if from plan)
- Edit, Delete, Duplicate, Print actions

**4. Edit Visit Report**
- Edit from detail view or dashboard
- Update any field
- Changes saved immediately
- Edit history tracked

**5. Filter and Search**
- Quick search across company, contact, purpose, product
- Advanced filtering:
  - Date range picker
  - State dropdown
  - City dropdown
  - Product/service search
  - Visit outcome filter
- Combine multiple filters
- Clear all filters button

**6. Generate Monthly Report**
- Select month/period
- System aggregates all visits
- Export to CSV/Excel
- Print formatted report

#### For Team Leaders

**7. Review Team Visit Reports**
- View all visit reports from team members
- Filter by team member (click member card)
- Filter by statistics (Total, Satisfied, Need Improvement, Opportunity)
- See team statistics and analytics
- View individual visit details

**8. Approve/Reject Visit Reports**
- Approve visit reports (coming soon)
- Reject with comments
- Sales Engineer notified
- Track approval status

**9. View Team Analytics**
- Total visits per team member
- Total potential sale value by member
- Visit outcomes distribution
- Conversion rates
- Trends over time

#### For Administrators

**10. Manage System Settings**
- Manage verticals (business divisions)
- Configure predefined options (Purpose, Outcome, Convert Status, etc.)
- Manage users and assignments
- Export all data to CSV/Excel

## 🔗 System Integration

The Travel Planning and Visit Report systems are deeply interlinked:

### Planning → Execution → Reporting Workflow

1. **Planning Phase**
   - Sales Engineer creates monthly travel plan
   - Plans day-wise visits with all details
   - Submits plan for Team Leader approval

2. **Approval Phase**
   - Team Leader reviews plan in calendar/table view
   - Approves or rejects with comments
   - Approved plan becomes active

3. **Execution Phase**
   - Sales Engineer follows day-wise plan
   - Updates actual check-in/check-out times
   - Uploads photos during visits

4. **Reporting Phase**
   - Sales Engineer converts plan entry to visit report
   - OR creates visit report and links to plan entry
   - Visit report inherits data from plan
   - Additional details added in report
   - Bidirectional link created

### Linking Features

- **From Plan to Report**: Convert plan entry → Creates report with pre-filled data
- **From Report to Plan**: Link new report → Selects plan entry → Pre-fills form
- **Bidirectional Navigation**: Navigate between plan and report seamlessly
- **Status Tracking**: Plan entry shows "converted" status when report created
- **Shared Data**: Photos, check-in/out times shared between plan and report

## ✨ Features

### Travel Planning
- ✅ Monthly calendar view with day-wise planning
- ✅ Calendar and table views for Team Leaders
- ✅ Status tracking (planned, in-progress, completed, converted)
- ✅ Check-in/check-out time tracking
- ✅ Photo upload
- ✅ Route optimization suggestions
- ✅ Plan approval workflow
- ✅ Conversion to visit reports

### Visit Reports
- ✅ Complete 22-field visit report form
- ✅ Multiple contact person support
- ✅ Auto-calculation of day from date
- ✅ Form validation
- ✅ Dashboard with statistics
- ✅ Advanced filtering and search
- ✅ Pagination
- ✅ Export to CSV/Excel
- ✅ Print functionality
- ✅ Link to travel plans

### General
- ✅ Clean, Apple-like design with Tailwind CSS
- ✅ Persona-based authentication (no password required for demo)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Toast notifications
- ✅ Confirmation dialogs
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ LocalStorage persistence (for demo purposes)

## 🛠 Technology Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **date-fns** - Date formatting and manipulation
- **React Hooks** - State management

## 📁 Project Structure

```
/app
  /dashboard              - Main dashboard
  /dashboard/visits       - Visit report pages
    /new                  - Create visit report
    /[id]                 - View/edit visit details
  /dashboard/plans        - Travel planning pages
    /new                  - Create monthly plan
    /[id]                 - View/edit plan (calendar view)
    /approve              - Team Leader approval list
    /approve/[id]         - Team Leader detailed review
  /dashboard/team         - Team Leader dashboard
  /dashboard/admin        - Admin panel
  /dashboard/reports      - Monthly reports
  /login                  - Persona selection/login
/components               - Reusable components
  /Layout.tsx             - Main layout with navigation
  /Toast.tsx              - Toast notifications
  /ToastProvider.tsx      - Toast context
  /ConfirmDialog.tsx      - Confirmation dialogs
  /FilterPanel.tsx        - Advanced filtering
/lib                     - Utilities and data
  /storage.ts             - LocalStorage operations
  /personas.ts            - Persona definitions
  /utils.ts               - Utility functions
  /travelPlanUtils.ts     - Travel planning utilities
  /seedData.ts            - Dummy data for visit reports
  /seedTravelPlans.ts     - Dummy data for travel plans
  /initializeData.ts      - Data initialization
  /hooks                  - Custom React hooks
    /useDebounce.ts       - Debounce hook
/types                   - TypeScript type definitions
```

## 💾 Data Persistence

Currently, data is stored in browser **localStorage**. This is suitable for demo purposes. For production, you would integrate with a backend API and database.

### Data Structure

- **Visit Reports**: Stored with all 22 fields, contact persons, and metadata
- **Travel Plans**: Monthly plans with entries, status, and approval information
- **Users**: Persona information and role assignments
- **Settings**: Predefined options, locations, purposes

## 📊 Key Statistics Tracked

### For Sales Engineers
- Total visits
- Total opportunity value
- Satisfied visits count
- This month's visits
- Conversion rate (plans → reports)

### For Team Leaders
- Team total visits
- Team total opportunity
- Satisfied visits percentage
- Visits needing improvement
- Plan approval rate
- Plan execution rate
- Report conversion rate

## 🎨 Design Philosophy

- **Clean & Minimal**: Apple-inspired design with plenty of white space
- **Intuitive Navigation**: Clear navigation paths and breadcrumbs
- **Visual Feedback**: Toast notifications, loading states, hover effects
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Responsive**: Works seamlessly on mobile, tablet, and desktop

## 📝 Documentation

- **`spec.md`** - Complete Visit Report System specification
- **`spec-travel-planning.md`** - Complete Travel Planning System specification
- **`CREDENTIALS.md`** - Quick reference for persona credentials
- **`IMPLEMENTATION_REVIEW.md`** - Implementation review and ratings

## 🚧 Future Enhancements

- Email notifications for approvals/rejections
- Calendar integration for visit scheduling
- Mobile app (native)
- Advanced analytics and reporting
- Integration with CRM systems
- GPS location tracking
- Offline mode for mobile access
- Real-time collaboration features

## 📄 License

This project is for demonstration purposes.

---

**Built with ❤️ for modern sales teams**
