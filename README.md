# Visit Report System

A modern, clean visit report management system for sales teams with Apple-like design.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Personas & Login

The system includes three personas for testing. Simply click on any persona card on the login page to experience the app with that role:

### Sales Engineer
- **Rajesh Kumar** (rajesh.kumar@company.com)
- **Priya Sharma** (priya.sharma@company.com)

**Capabilities:**
- Create new visit reports with all 22 fields
- View personal visit reports and statistics
- Track opportunities and visit outcomes

### Team Leader
- **Akhilesh Pathak** (akhilesh.pathak@company.com)

**Capabilities:**
- Review all team member visit reports
- View team analytics and statistics
- Monitor team performance
- Approve/reject reports (coming soon)

### Administrator
- **System Administrator** (admin@company.com)

**Capabilities:**
- Manage system settings
- Configure predefined options
- Manage users and verticals
- Export data

## Features

- ✅ Clean, Apple-like design with Tailwind CSS
- ✅ Persona-based authentication (no password required for demo)
- ✅ Complete visit report form with all 22 fields
- ✅ Multiple contact person support
- ✅ Auto-calculation of day from date
- ✅ Form validation
- ✅ Dashboard with statistics
- ✅ Team leader analytics
- ✅ Responsive design
- ✅ LocalStorage persistence (for demo purposes)

## Technology Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **date-fns** - Date formatting

## Project Structure

```
/app
  /dashboard        - Main dashboard
  /dashboard/visits/new - Create visit report
  /dashboard/team   - Team leader dashboard
  /dashboard/admin  - Admin panel
  /login            - Persona selection/login
/components        - Reusable components
/lib               - Utilities and data
/types             - TypeScript types
```

## Data Persistence

Currently, data is stored in browser localStorage. This is suitable for demo purposes. For production, you would integrate with a backend API and database.

