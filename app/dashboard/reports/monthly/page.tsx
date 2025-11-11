'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { getCurrentUser } from '@/lib/storage';
import { getVisitEntries, getTravelPlans, getTravelPlanEntries } from '@/lib/storage';
import { initializeDummyData } from '@/lib/initializeData';
import { VisitEntry, User, TravelPlan, TravelPlanEntry } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { ArrowLeft, Download, Printer, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ToastProvider';

export default function MonthlyReportPage() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [visits, setVisits] = useState<VisitEntry[]>([]);
  const [planData, setPlanData] = useState<{ plan: TravelPlan | null; entries: TravelPlanEntry[] }>({
    plan: null,
    entries: [],
  });
  const [stats, setStats] = useState({
    totalVisits: 0,
    totalValue: 0,
    satisfied: 0,
    dissatisfied: 0,
    needImprovement: 0,
    plannedVisits: 0,
    actualVisits: 0,
    plannedValue: 0,
    actualValue: 0,
  });

  useEffect(() => {
    initializeDummyData();
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'sales_engineer') {
      router.push('/dashboard');
      return;
    }
    setUser(currentUser);
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const allVisits = getVisitEntries();
    const userVisits = allVisits.filter(
      (v) => v.visitReportId && v.visitReportId.includes(user.id)
    );

    const [year, month] = selectedMonth.split('-').map(Number);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[month - 1];

    // Get travel plan for this month
    const allPlans = getTravelPlans();
    const plan = allPlans.find(
      (p) => p.salesEngineerId === user.id && 
             p.month === monthName && 
             p.year === year &&
             (p.status === 'approved' || p.status === 'active' || p.status === 'completed')
    );
    
    let planEntries: TravelPlanEntry[] = [];
    if (plan) {
      const allPlanEntries = getTravelPlanEntries();
      planEntries = allPlanEntries.filter((e) => e.travelPlanId === plan.id);
    }
    setPlanData({ plan: plan || null, entries: planEntries });

    const filtered = userVisits.filter((v) => {
      const visitDate = new Date(v.dateOfVisit);
      return (
        visitDate.getMonth() + 1 === month &&
        visitDate.getFullYear() === year
      );
    });

    setVisits(filtered.sort((a, b) => 
      new Date(a.dateOfVisit).getTime() - new Date(b.dateOfVisit).getTime()
    ));

    const totalValue = filtered.reduce((sum, v) => {
      const value = parseFloat(v.potentialSaleValue?.replace(/,/g, '') || '0');
      return sum + value;
    }, 0);

    // Calculate planned vs actual
    const plannedVisits = planEntries.length;
    const actualVisits = filtered.length;
    const plannedValue = planEntries.reduce((sum, e) => {
      // Estimate value from plan entries (if available in notes or default)
      return sum + 0; // Placeholder - actual value would come from plan if stored
    }, 0);

    setStats({
      totalVisits: filtered.length,
      totalValue,
      satisfied: filtered.filter((v) => v.visitOutcome === 'Satisfied').length,
      dissatisfied: filtered.filter((v) => v.visitOutcome === 'Dissatisfied').length,
      needImprovement: filtered.filter((v) => v.visitOutcome === 'Need for Improvement').length,
      plannedVisits,
      actualVisits,
      plannedValue,
      actualValue: totalValue,
    });
  }, [user, selectedMonth]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const [year, month] = selectedMonth.split('-').map(Number);
  const monthName = monthNames[month - 1];
  const reportPeriod = `${monthName}'${year}`;

  const handleExport = () => {
    const csv = [
      ['Monthly Visit Report', reportPeriod].join(','),
      ['Sales Engineer', user?.name || ''].join(','),
      [''],
      ['Date', 'Company', 'Purpose', 'Outcome', 'Value', 'Status'].join(','),
      ...visits.map(v => [
        formatDate(v.dateOfVisit),
        v.companyName,
        v.purposeOfMeeting,
        v.visitOutcome,
        v.potentialSaleValue || '0',
        v.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visit-report-${selectedMonth}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.showToast('Report exported successfully', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 mb-2 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Back</span>
        </Link>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-2 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">Monthly Visit Report</h1>
                <p className="text-xs text-gray-600 mt-0.5">Generate and export monthly reports</p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-2 py-1 text-xs text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Select month"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const date = new Date();
                    date.setMonth(date.getMonth() - i);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const monthName = monthNames[date.getMonth()];
                    return (
                      <option key={`${year}-${month}`} value={`${year}-${month}`}>
                        {monthName} {year}
                      </option>
                    );
                  })}
                </select>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  aria-label="Export report"
                >
                  <Download className="w-3 h-3" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-label="Print report"
                >
                  <Printer className="w-3 h-3" />
                  <span className="hidden sm:inline">Print</span>
                </button>
              </div>
            </div>

            {/* Report Header */}
            <div className="bg-gray-50 rounded-lg p-2 mb-2 print:bg-white">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <p className="text-xs text-gray-600">Report Period</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">{reportPeriod}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Sales Engineer</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">{user.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Visits</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">{stats.totalVisits}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Opportunity</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">₹{formatCurrency(stats.totalValue)}</p>
                </div>
              </div>
            </div>

            {/* Planned vs Actual */}
            {planData.plan && (
              <div className="bg-blue-50 rounded-lg p-2 mb-2">
                <h3 className="text-xs font-semibold text-gray-900 mb-1">Planned vs Actual</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                  <div>
                    <p className="text-xs text-gray-600">Planned Visits</p>
                    <p className="text-sm font-semibold text-gray-900">{stats.plannedVisits}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Actual Visits</p>
                    <p className="text-sm font-semibold text-gray-900">{stats.actualVisits}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Variance</p>
                    <p className={`text-sm font-semibold ${
                      stats.actualVisits >= stats.plannedVisits ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stats.actualVisits >= stats.plannedVisits ? '+' : ''}{stats.actualVisits - stats.plannedVisits}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Completion Rate</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {stats.plannedVisits > 0 
                        ? Math.round((stats.actualVisits / stats.plannedVisits) * 100) 
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              <div className="bg-green-50 rounded-lg p-2">
                <p className="text-xs text-gray-600">Satisfied</p>
                <p className="text-sm font-semibold text-green-800">{stats.satisfied}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-2">
                <p className="text-xs text-gray-600">Dissatisfied</p>
                <p className="text-sm font-semibold text-red-800">{stats.dissatisfied}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-2">
                <p className="text-xs text-gray-600">Need Improvement</p>
                <p className="text-sm font-semibold text-yellow-800">{stats.needImprovement}</p>
              </div>
            </div>
          </div>

          {/* Visit Details Table */}
          <div className="overflow-x-auto">
            {visits.length === 0 ? (
              <div className="p-4 text-center">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No visits found for {reportPeriod}</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Outcome</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {visits.map((visit) => (
                    <tr key={visit.id}>
                      <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-900">
                        {formatDate(visit.dateOfVisit)}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap text-xs font-medium text-gray-900">
                        {visit.companyName}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-500">
                        {visit.purposeOfMeeting}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
                            visit.visitOutcome === 'Satisfied'
                              ? 'bg-green-100 text-green-800'
                              : visit.visitOutcome === 'Dissatisfied'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {visit.visitOutcome}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-900">
                        {visit.potentialSaleValue ? `₹${visit.potentialSaleValue}` : '-'}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-500">
                        {visit.status || 'Open'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}


