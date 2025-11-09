'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { getCurrentUser } from '@/lib/storage';
import { getVisitEntries } from '@/lib/storage';
import { initializeDummyData } from '@/lib/initializeData';
import { VisitEntry, User } from '@/types';
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
  const [stats, setStats] = useState({
    totalVisits: 0,
    totalValue: 0,
    satisfied: 0,
    dissatisfied: 0,
    needImprovement: 0,
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

    setStats({
      totalVisits: filtered.length,
      totalValue,
      satisfied: filtered.filter((v) => v.visitOutcome === 'Satisfied').length,
      dissatisfied: filtered.filter((v) => v.visitOutcome === 'Dissatisfied').length,
      needImprovement: filtered.filter((v) => v.visitOutcome === 'Need for Improvement').length,
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
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Monthly Visit Report</h1>
                <p className="text-gray-600 mt-1">Generate and export monthly visit reports</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
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
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  aria-label="Export report"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  aria-label="Print report"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Report Header */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6 print:bg-white">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Report Period</p>
                  <p className="font-semibold text-gray-900">{reportPeriod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sales Engineer</p>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Visits</p>
                  <p className="font-semibold text-gray-900">{stats.totalVisits}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Opportunity</p>
                  <p className="font-semibold text-gray-900">₹{formatCurrency(stats.totalValue)}</p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Satisfied</p>
                <p className="text-2xl font-semibold text-green-800">{stats.satisfied}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Dissatisfied</p>
                <p className="text-2xl font-semibold text-red-800">{stats.dissatisfied}</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Need Improvement</p>
                <p className="text-2xl font-semibold text-yellow-800">{stats.needImprovement}</p>
              </div>
            </div>
          </div>

          {/* Visit Details Table */}
          <div className="overflow-x-auto">
            {visits.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No visits found for {reportPeriod}</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outcome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {visits.map((visit) => (
                    <tr key={visit.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(visit.dateOfVisit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {visit.companyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {visit.purposeOfMeeting}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visit.potentialSaleValue ? `₹${visit.potentialSaleValue}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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


