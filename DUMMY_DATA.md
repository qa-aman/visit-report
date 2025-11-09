# Dummy Data Overview

This document describes the comprehensive dummy data that has been seeded into the Visit Report System to showcase all features and edge cases.

## Data Summary

**Total Visit Entries:** 18 comprehensive visit reports

**Distribution:**
- **Rajesh Kumar (se-001):** 10 visits
- **Priya Sharma (se-002):** 4 visits
- **Team Total:** 18 visits across both engineers

## Test Cases Covered

### ✅ Positive Use Cases

1. **High-Value Successful Deal** (EPIGRAL)
   - Multiple contact persons (2)
   - Satisfied outcome
   - ₹3,00,000 opportunity
   - Proposal status
   - Complete data fields

2. **Technical Query Resolved** (RELIANCE INDUSTRIES)
   - Problem-solving scenario
   - Satisfied outcome
   - ₹5,50,000 opportunity
   - Negotiation status

3. **Product Demonstration** (TATA CHEMICALS)
   - Multiple decision makers (2 contacts)
   - Satisfied outcome
   - ₹8,00,000 opportunity
   - Enquiry status
   - Sample request

### ❌ Negative Use Cases

4. **Dissatisfied Customer** (ADANI GROUP)
   - Product failure complaint
   - Dissatisfied outcome
   - ₹0 value (service issue)
   - On Hold status
   - Root cause investigation needed

5. **Need for Improvement** (ESSAR STEEL)
   - Competitive pricing issue
   - Need for Improvement outcome
   - ₹12,00,000 opportunity
   - Pending status
   - Pricing strategy review required

### 🎯 Corner Cases

6. **Very High Value Opportunity** (LARSEN & TOUBRO)
   - Multiple contact persons (3)
   - ₹50,00,000 opportunity
   - Long sales cycle
   - Comprehensive proposal needed

7. **Minimal Data Entry** (GUJARAT AMBUJA)
   - Only required fields filled
   - Empty optional fields
   - Tests form validation

8. **Closed Deal - Won** (ULTRATECH CEMENT)
   - Successful closure
   - Result: Won
   - Closure date set
   - ₹15,00,000 value

9. **Closed Deal - Lost** (JINDAL STEEL)
   - Lost to competitor
   - Result: Lost
   - Closure date set
   - ₹20,00,000 (lost opportunity)

10. **Multiple Visits Same Company** (EPIGRAL - 2nd visit)
    - Same company, different date
    - Different contact person
    - Different purpose
    - Tests duplicate company handling

### 📊 Edge Cases

11. **Very Long Text Fields** (BHARAT PETROLEUM)
    - Long company name
    - Long designations
    - Extensive discussion points
    - Multiple contact persons (3)
    - Comprehensive remarks
    - Tests text field handling

12. **Different States** (ITC LIMITED)
    - Karnataka state
    - Different geographic location
    - Tests state/city filtering

13. **Today's Visit** (INDIAN OIL CORPORATION)
    - Current date
    - Most recent entry
    - Tests date sorting

14. **Old Visit** (GAIL INDIA)
    - Previous month
    - Historical data
    - Tests date range filtering

### 👥 Second Sales Engineer Data

15. **Priya's Successful Visit** (VEDANTA LIMITED)
    - Different engineer
    - Satisfied outcome
    - ₹6,00,000 opportunity

16. **Priya's Follow-up** (HINDALCO INDUSTRIES)
    - Multiple contacts (2)
    - Proposal under review
    - Pending status

17. **Priya's Service Visit** (NALCO)
    - Routine maintenance
    - Satisfied outcome
    - Lower value opportunity

18. **Priya's Cancelled Deal** (SAIL)
    - Result: Cancelled
    - Budget constraints
    - Relationship maintained

## Data Characteristics

### Visit Outcomes Distribution
- **Satisfied:** 12 visits (67%)
- **Dissatisfied:** 3 visits (17%)
- **Need for Improvement:** 3 visits (17%)

### Convert Status Distribution
- **PreLead:** 2 visits
- **Enquiry:** 4 visits
- **Proposal:** 5 visits
- **Negotiation:** 3 visits
- **Closed:** 4 visits

### Status Distribution
- **Open:** 4 visits
- **In Progress:** 5 visits
- **Pending:** 3 visits
- **On Hold:** 1 visit
- **Closed:** 4 visits

### Result Distribution (for Closed)
- **Won:** 1 visit
- **Lost:** 1 visit
- **Cancelled:** 1 visit
- **Empty:** 1 visit

### Geographic Distribution
- **Gujarat:** 8 visits
- **Chhattisgarh:** 2 visits
- **Rajasthan:** 1 visit
- **Uttar Pradesh:** 2 visits
- **Odisha:** 2 visits
- **Maharashtra:** 1 visit
- **Karnataka:** 1 visit
- **Assam:** 1 visit

### Value Range
- **₹0:** 1 visit (service issue)
- **₹1,50,000 - ₹3,50,000:** 4 visits
- **₹4,50,000 - ₹8,00,000:** 5 visits
- **₹10,00,000 - ₹20,00,000:** 4 visits
- **₹50,00,000+:** 1 visit (high-value)
- **₹75,00,000:** 1 visit (very high-value)

## Contact Person Scenarios

- **Single Contact:** 10 visits
- **Two Contacts:** 5 visits
- **Three Contacts:** 2 visits
- **Empty Contact Info:** 1 visit (minimal data)

## Date Range Coverage

- **Today:** 1 visit
- **Last 7 days:** 5 visits
- **Last 14 days:** 8 visits
- **Last 30 days:** 17 visits
- **Previous month:** 1 visit

## Showcase Features

This dummy data allows you to demonstrate:

1. ✅ **Dashboard Statistics** - Real numbers and calculations
2. ✅ **Filtering** - By date, outcome, status, state
3. ✅ **Sorting** - By date, value, company
4. ✅ **Multiple Outcomes** - All three outcome types
5. ✅ **Status Tracking** - Various statuses and results
6. ✅ **Team Analytics** - Team leader view with aggregated data
7. ✅ **High/Low Values** - Range from ₹0 to ₹75,00,000
8. ✅ **Geographic Diversity** - Multiple states and cities
9. ✅ **Contact Scenarios** - Single to multiple contacts
10. ✅ **Date Variations** - Current, recent, and historical
11. ✅ **Edge Cases** - Long text, minimal data, duplicates
12. ✅ **Closed Deals** - Won, Lost, Cancelled scenarios

## How to Use

The dummy data is automatically loaded when you:
1. Log in as any persona
2. Navigate to the dashboard
3. View team reports (as Team Leader)

Data persists in browser localStorage and will be available across sessions until cleared.

## Resetting Data

To reset and reload dummy data:
1. Open browser console (F12)
2. Run: `localStorage.clear()`
3. Refresh the page
4. Data will be re-initialized automatically

