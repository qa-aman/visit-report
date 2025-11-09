'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { getCurrentUser, getTravelPlans, saveTravelPlan, getTravelPlanEntriesByPlanId } from '@/lib/storage';
import { TravelPlan, User, TravelPlanEntry } from '@/types';
import { getDaysInMonth, getMonthName, formatDateForInput, getStatusIndicator, getEntriesForDate, getDayName } from '@/lib/travelPlanUtils';
import { CheckCircle, XCircle, ArrowLeft, Calendar, Table, MapPin, Clock, User as UserIcon, FileText } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import ConfirmDialog from '@/components/ConfirmDialog';
import { formatDateForDisplay } from '@/lib/travelPlanUtils';

export default function ApprovePlanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [entries, setEntries] = useState<TravelPlanEntry[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const [selectedEntry, setSelectedEntry] = useState<TravelPlanEntry | null>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const toast = useToast();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (currentUser.role !== 'team_leader') {
      toast.showToast('Only Team Leaders can approve plans', 'error');
      router.push('/dashboard');
      return;
    }

    setUser(currentUser);

    const allPlans = getTravelPlans();
    const foundPlan = allPlans.find((p) => p.id === planId);

    if (!foundPlan || foundPlan.teamLeaderId !== currentUser.id) {
      toast.showToast('Plan not found or you do not have permission', 'error');
      router.push('/dashboard/plans/approve');
      return;
    }

    if (foundPlan.status !== 'submitted') {
      toast.showToast('This plan is not pending approval', 'error');
      router.push('/dashboard/plans/approve');
      return;
    }

    setPlan(foundPlan);
    const planEntries = getTravelPlanEntriesByPlanId(planId);
    setEntries(planEntries);
  }, [planId, router, toast]);

  const monthDays = useMemo(() => {
    if (!plan) return [];
    const monthNumber = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'].indexOf(plan.month) + 1;
    return getDaysInMonth(plan.year, monthNumber);
  }, [plan]);

  const handleEntryClick = (entry: TravelPlanEntry) => {
    setSelectedEntry(entry);
    setShowEntryModal(true);
  };

  const handleApprove = () => {
    setShowApproveDialog(true);
  };

  const handleReject = () => {
    setRejectionReason('');
    setShowRejectDialog(true);
  };

  const confirmApprove = () => {
    if (!plan || !user) return;

    const updatedPlan: TravelPlan = {
      ...plan,
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: user.id,
      updatedAt: new Date().toISOString(),
    };

    if (saveTravelPlan(updatedPlan)) {
      toast.showToast('Plan approved successfully', 'success');
      setTimeout(() => {
        router.push('/dashboard/plans/approve');
      }, 1000);
    } else {
      toast.showToast('Failed to approve plan', 'error');
    }
  };

  const confirmReject = () => {
    if (!plan || !user || !rejectionReason.trim()) {
      toast.showToast('Please provide a rejection reason', 'error');
      return;
    }

    const updatedPlan: TravelPlan = {
      ...plan,
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectedBy: user.id,
      rejectionComments: rejectionReason,
      updatedAt: new Date().toISOString(),
    };

    if (saveTravelPlan(updatedPlan)) {
      toast.showToast('Plan rejected', 'success');
      setTimeout(() => {
        router.push('/dashboard/plans/approve');
      }, 1000);
    } else {
      toast.showToast('Failed to reject plan', 'error');
    }
  };

  if (!user || !plan) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/plans/approve')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Review Travel Plan: {plan.month} {plan.year}
              </h1>
              <p className="text-gray-600 mt-1">
                Submitted: {plan.submittedAt ? formatDateForDisplay(plan.submittedAt) : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
            <button
              onClick={handleApprove}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  viewMode === 'calendar'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Calendar View
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Table className="w-4 h-4" />
                Table View
              </button>
            </div>
            <div className="text-sm text-gray-600">
              {entries.length} planned visit{entries.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-semibold text-gray-700 py-2">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {monthDays.map((date) => {
                const dateStr = formatDateForInput(date);
                const dayEntries = getEntriesForDate(entries, date);
                const isToday = new Date().toDateString() === date.toDateString();

                return (
                  <div
                    key={dateStr}
                    className={`
                      min-h-[100px] border rounded-lg p-2 transition-all
                      ${isToday ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}
                      ${dayEntries.length > 0 ? 'bg-blue-50 cursor-pointer hover:bg-blue-100' : 'bg-white'}
                    `}
                    onClick={() => dayEntries.length > 0 && handleEntryClick(dayEntries[0])}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm font-medium ${isToday ? 'text-orange-600' : 'text-gray-900'}`}>
                        {date.getDate()}
                      </span>
                      {dayEntries.length > 0 && (
                        <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">
                          {dayEntries.length}
                        </span>
                      )}
                    </div>
                    {dayEntries.length > 0 && (
                      <div className="text-xs text-gray-700 space-y-1">
                        {dayEntries.slice(0, 2).map((entry) => (
                          <div key={entry.id} className="truncate" title={entry.customerName}>
                            {entry.customerName}
                          </div>
                        ))}
                        {dayEntries.length > 2 && (
                          <div className="text-gray-500">+{dayEntries.length - 2} more</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      From → To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in/out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No planned visits
                      </td>
                    </tr>
                  ) : (
                    entries
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((entry) => {
                        const indicator = getStatusIndicator(entry.status, entry.visitReportId);
                        const statusColor = indicator.color === 'green' ? 'text-green-600' : 
                                          indicator.color === 'blue' ? 'text-blue-600' : 
                                          indicator.color === 'yellow' ? 'text-yellow-600' : 
                                          indicator.color === 'red' ? 'text-red-600' : 'text-gray-600';
                        return (
                          <tr
                            key={entry.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleEntryClick(entry)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{entry.date}</div>
                              <div className="text-xs text-gray-500">{entry.day}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{entry.customerName}</div>
                              <div className="text-xs text-gray-500">{entry.areaRegion}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{entry.purpose}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {entry.fromLocation} → {entry.toLocation}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-xs text-gray-600">
                                {entry.plannedCheckIn && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    In: {entry.plannedCheckIn}
                                  </div>
                                )}
                                {entry.plannedCheckOut && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3" />
                                    Out: {entry.plannedCheckOut}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                entry.status === 'completed' ? 'bg-green-100 text-green-800' :
                                entry.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                entry.status === 'converted' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`} title={indicator.label}>
                                {indicator.icon} {entry.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEntryClick(entry);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Entry Detail Modal */}
        {showEntryModal && selectedEntry && (
          <EntryDetailModal
            entry={selectedEntry}
            onClose={() => {
              setShowEntryModal(false);
              setSelectedEntry(null);
            }}
          />
        )}

        {/* Approve Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showApproveDialog}
          title="Approve Travel Plan?"
          message={`Are you sure you want to approve the travel plan for ${plan.month} ${plan.year}? This will activate the plan for the sales engineer.`}
          confirmText="Approve"
          cancelText="Cancel"
          type="info"
          onConfirm={confirmApprove}
          onCancel={() => setShowApproveDialog(false)}
        />

        {/* Reject Dialog */}
        {showRejectDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-red-100">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Reject Travel Plan?</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Please provide a reason for rejecting this plan:
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                  required
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowRejectDialog(false);
                      setRejectionReason('');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmReject}
                    disabled={!rejectionReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Entry Detail Modal Component
function EntryDetailModal({ entry, onClose }: { entry: TravelPlanEntry; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Visit Plan Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <div className="text-gray-900">{entry.date}</div>
              <div className="text-sm text-gray-500">{entry.day}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <div className="text-gray-900">{entry.customerName}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
              <div className="text-gray-900">{entry.purpose}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area/Region</label>
              <div className="text-gray-900">{entry.areaRegion}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Location</label>
              <div className="text-gray-900 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {entry.fromLocation}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Location</label>
              <div className="text-gray-900 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {entry.toLocation}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Planned Check-in</label>
              <div className="text-gray-900 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {entry.plannedCheckIn || 'Not set'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Planned Check-out</label>
              <div className="text-gray-900 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {entry.plannedCheckOut || 'Not set'}
              </div>
            </div>
            {entry.actualCheckIn && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actual Check-in</label>
                <div className="text-gray-900 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {entry.actualCheckIn}
                </div>
              </div>
            )}
            {entry.actualCheckOut && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actual Check-out</label>
                <div className="text-gray-900 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {entry.actualCheckOut}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                entry.status === 'completed' ? 'bg-green-100 text-green-800' :
                entry.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                entry.status === 'converted' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {entry.status}
              </span>
            </div>
          </div>
          {entry.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">{entry.notes}</div>
            </div>
          )}
          {entry.photos && entry.photos.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photos</label>
              <div className="text-sm text-gray-600">
                {entry.photos.length} photo(s) attached
              </div>
            </div>
          )}
          {entry.visitReportId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-900">
                <FileText className="w-5 h-5" />
                <span className="font-medium">Visit Report Created</span>
              </div>
              <a
                href={`/dashboard/visits/${entry.visitReportId}`}
                className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
              >
                View Visit Report →
              </a>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

