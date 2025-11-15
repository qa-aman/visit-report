'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { getCurrentUser, getSystemConfig } from '@/lib/storage';
import { getTravelPlans, getTravelPlanEntriesByPlanId, saveTravelPlanEntry, saveTravelPlan } from '@/lib/storage';
import { TravelPlan, TravelPlanEntry, User } from '@/types';
import { getDaysInMonth, getMonthName, formatDateForInput, formatDateForDisplay, getStatusIndicator, getConversionStats, getEntriesForDate, getDayName } from '@/lib/travelPlanUtils';
import { Calendar, Plus, CheckCircle, Clock, ArrowLeft, FileText, MapPin, ExternalLink, Camera, X, Table } from 'lucide-react';
import CalendarView, { CalendarViewMode } from '@/components/CalendarView';
import { useToast } from '@/components/ToastProvider';
import { saveVisitEntry, getVisitEntries } from '@/lib/storage';
import { VisitEntry, ContactPerson } from '@/types';
import { generateId, formatDate, getDayOfWeek } from '@/lib/utils';

export default function TravelPlanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [entries, setEntries] = useState<TravelPlanEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TravelPlanEntry | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const [calendarViewMode, setCalendarViewMode] = useState<CalendarViewMode>('month');
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkEntries, setBulkEntries] = useState<Array<Partial<TravelPlanEntry>>>([]);
  const toast = useToast();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    const allPlans = getTravelPlans();
    const foundPlan = allPlans.find((p) => p.id === planId);
    
    if (!foundPlan) {
      toast.showToast('Travel plan not found', 'error');
      router.push('/dashboard/plans');
      return;
    }

    // Check permissions
    if (currentUser.role === 'sales_engineer' && foundPlan.salesEngineerId !== currentUser.id) {
      toast.showToast('You do not have permission to view this plan', 'error');
      router.push('/dashboard/plans');
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

  const stats = useMemo(() => {
    return getConversionStats(entries);
  }, [entries]);

  const handleDayClick = (date: Date) => {
    // Always create a new entry when clicking on empty space
    setEditingEntry(null);
    setSelectedDate(date);
    setShowEntryModal(true);
  };

  const handleSaveEntry = (entryData: Partial<TravelPlanEntry>) => {
    if (!plan) return;

    const dateStr = selectedDate ? formatDateForInput(selectedDate) : entryData.date!;
    const dayName = selectedDate ? getDayName(dateStr) : entryData.day!;

    const entry: TravelPlanEntry = {
      id: editingEntry?.id || `entry-${Date.now()}`,
      travelPlanId: plan.id,
      date: dateStr,
      day: dayName,
      fromLocation: entryData.fromLocation || '',
      toLocation: entryData.toLocation || '',
      areaRegion: entryData.areaRegion || '',
      customerName: entryData.customerName || '',
      purpose: entryData.purpose || '',
      plannedCheckIn: entryData.plannedCheckIn,
      plannedCheckOut: entryData.plannedCheckOut,
      actualCheckIn: entryData.actualCheckIn,
      actualCheckOut: entryData.actualCheckOut,
      status: entryData.status || 'planned',
      photos: entryData.photos || editingEntry?.photos || [],
      notes: entryData.notes,
      isAdHoc: entryData.isAdHoc || false,
      createdAt: editingEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (saveTravelPlanEntry(entry)) {
      setEntries((prev) => {
        const filtered = prev.filter((e) => e.id !== entry.id);
        return [...filtered, entry];
      });
      toast.showToast(editingEntry ? 'Entry updated successfully' : 'Entry created successfully', 'success');
      setShowEntryModal(false);
      setSelectedDate(null);
      setEditingEntry(null);
    } else {
      toast.showToast('Failed to save entry', 'error');
    }
  };

  const handleConvertToReport = async (entry: TravelPlanEntry) => {
    if (!user || !plan) return;

    // Check if already converted
    if (entry.visitReportId) {
      router.push(`/dashboard/visits/${entry.visitReportId}`);
      return;
    }

    // Check if entry is completed or in-progress
    if (entry.status !== 'completed' && entry.status !== 'in-progress') {
      toast.showToast('Only completed or in-progress visits can be converted to reports', 'error');
      return;
    }

    try {
      // Create visit report entry from travel plan entry
      const allEntries = getVisitEntries();
      const serialNumber = allEntries.length + 1;

      // Build notes with check-in/check-out times
      let notes = entry.notes || '';
      if (entry.plannedCheckIn || entry.actualCheckIn) {
        notes += `\n\nPlanned Check-in: ${entry.plannedCheckIn || 'N/A'}, Actual Check-in: ${entry.actualCheckIn || 'N/A'}`;
      }
      if (entry.plannedCheckOut || entry.actualCheckOut) {
        notes += `\nPlanned Check-out: ${entry.plannedCheckOut || 'N/A'}, Actual Check-out: ${entry.actualCheckOut || 'N/A'}`;
      }

      const visitEntry: VisitEntry = {
        id: generateId(),
        visitReportId: `${user.id}-${Date.now()}`,
        serialNumber,
        dateOfVisit: entry.date,
        dayOfVisit: entry.day,
        companyName: entry.customerName,
        plant: entry.areaRegion,
        cityArea: entry.areaRegion,
        state: entry.toLocation, // Extract state from location if needed
        contactPersons: [], // User will add contacts in visit report
        purposeOfMeeting: entry.purpose,
        discussionPoints: '',
        productServices: '',
        actionStep: '',
        remarks: notes.trim(),
        potentialSaleValue: '',
        visitOutcome: 'Satisfied' as const,
        convertStatus: 'PreLead' as const,
        status: 'Open',
        result: '',
        closureDate: '',
        travelPlanEntryId: entry.id, // Link back to plan entry
        isFromPlan: true, // Flag indicating from plan
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (saveVisitEntry(visitEntry)) {
        // Update plan entry to mark as converted
        const updatedEntry: TravelPlanEntry = {
          ...entry,
          status: 'converted',
          visitReportId: visitEntry.id,
          updatedAt: new Date().toISOString(),
        };

        if (saveTravelPlanEntry(updatedEntry)) {
          setEntries((prev) => {
            const filtered = prev.filter((e) => e.id !== entry.id);
            return [...filtered, updatedEntry];
          });
          toast.showToast('Visit report created from travel plan', 'success');
          // Navigate to the new visit report
          setTimeout(() => {
            router.push(`/dashboard/visits/${visitEntry.id}`);
          }, 500);
        } else {
          toast.showToast('Report created but failed to update plan entry', 'warning');
          router.push(`/dashboard/visits/${visitEntry.id}`);
        }
      } else {
        toast.showToast('Failed to create visit report', 'error');
      }
    } catch (error) {
      console.error('Error converting to report:', error);
      toast.showToast('Failed to convert to visit report', 'error');
    }
  };

  const handleSubmitPlan = () => {
    if (!plan) return;
    
    const systemConfig = getSystemConfig();
    const newStatus = systemConfig.approvalRequired ? 'submitted' : 'approved';
    
    const updatedPlan: TravelPlan = {
      ...plan,
      status: newStatus,
      submittedAt: newStatus === 'submitted' ? new Date().toISOString() : plan.submittedAt,
      approvedAt: newStatus === 'approved' ? new Date().toISOString() : plan.approvedAt,
      updatedAt: new Date().toISOString(),
    };

    if (saveTravelPlan(updatedPlan)) {
      setPlan(updatedPlan);
      if (systemConfig.approvalRequired) {
        toast.showToast('Plan submitted for approval', 'success');
      } else {
        toast.showToast('Plan is now active', 'success');
      }
    } else {
      toast.showToast('Failed to submit plan', 'error');
    }
  };

  const handleBulkAdd = () => {
    if (!plan) return;
    
    let successCount = 0;
    let errorCount = 0;

    bulkEntries.forEach((entryData) => {
      if (!entryData.date || !entryData.customerName) {
        errorCount++;
        return;
      }

      const dateStr = entryData.date;
      const dayName = getDayName(dateStr);

      const entry: TravelPlanEntry = {
        id: `entry-${Date.now()}-${Math.random()}`,
        travelPlanId: plan.id,
        date: dateStr,
        day: dayName,
        fromLocation: entryData.fromLocation || '',
        toLocation: entryData.toLocation || '',
        areaRegion: entryData.areaRegion || '',
        customerName: entryData.customerName || '',
        purpose: entryData.purpose || '',
        plannedCheckIn: entryData.plannedCheckIn,
        plannedCheckOut: entryData.plannedCheckOut,
        actualCheckIn: entryData.actualCheckIn,
        actualCheckOut: entryData.actualCheckOut,
        status: entryData.status || 'planned',
        photos: entryData.photos || [],
        notes: entryData.notes,
        isAdHoc: entryData.isAdHoc || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (saveTravelPlanEntry(entry)) {
        successCount++;
        setEntries((prev) => {
          const filtered = prev.filter((e) => e.id !== entry.id);
          return [...filtered, entry];
        });
      } else {
        errorCount++;
      }
    });

    if (successCount > 0) {
      toast.showToast(`Successfully added ${successCount} visit(s)`, 'success');
    }
    if (errorCount > 0) {
      toast.showToast(`Failed to add ${errorCount} visit(s)`, 'error');
    }

    setBulkEntries([]);
    setShowBulkAdd(false);
  };

  const addBulkRow = () => {
    setBulkEntries([...bulkEntries, {
      date: '',
      customerName: '',
      fromLocation: '',
      toLocation: '',
      areaRegion: '',
      purpose: '',
      plannedCheckIn: '',
      plannedCheckOut: '',
      status: 'planned',
    }]);
  };

  const removeBulkRow = (index: number) => {
    setBulkEntries(bulkEntries.filter((_, i) => i !== index));
  };

  const updateBulkRow = (index: number, field: keyof TravelPlanEntry, value: any) => {
    const updated = [...bulkEntries];
    updated[index] = { ...updated[index], [field]: value };
    setBulkEntries(updated);
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

  const canEdit = plan.status === 'draft' && user.role === 'sales_engineer'; // Only draft plans can be edited

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/dashboard/plans')}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-semibold text-gray-900">
                {plan.startDate && plan.endDate 
                  ? `${formatDateForDisplay(plan.startDate)} - ${formatDateForDisplay(plan.endDate)} Travel Plan`
                  : `${plan.month} ${plan.year} Travel Plan`}
              </h1>
              <p className="text-xs text-gray-600 mt-0.5">
                Status: <span className="font-medium">{plan.status}</span>
              </p>
            </div>
          </div>
          {canEdit && (
            <div className="flex items-center gap-1.5">
              {!showBulkAdd ? (
                <button
                  onClick={() => {
                    setShowBulkAdd(true);
                    if (bulkEntries.length === 0) {
                      addBulkRow();
                    }
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span className="hidden sm:inline">Bulk Add</span>
                  <span className="sm:hidden">Bulk</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={addBulkRow}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Row
                  </button>
                  <button
                    onClick={handleBulkAdd}
                    disabled={bulkEntries.length === 0 || bulkEntries.every(e => !e.date || !e.customerName)}
                    className="px-2 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save All ({bulkEntries.length})
                  </button>
                  <button
                    onClick={() => {
                      setShowBulkAdd(false);
                      setBulkEntries([]);
                    }}
                    className="px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
              <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-2 py-0.5 text-xs rounded transition-colors ${
                    viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-2 py-0.5 text-xs rounded transition-colors ${
                    viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Table className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
            <div className="flex items-center gap-1 mb-0.5">
              <Calendar className="w-3 h-3 text-gray-600" />
              <span className="text-xs text-gray-600">Total</span>
            </div>
            <p className="text-base font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
            <div className="flex items-center gap-1 mb-0.5">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span className="text-xs text-gray-600">Converted</span>
            </div>
            <p className="text-base font-bold text-green-600">{stats.converted}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
            <div className="flex items-center gap-1 mb-0.5">
              <Clock className="w-3 h-3 text-blue-600" />
              <span className="text-xs text-gray-600">Pending</span>
            </div>
            <p className="text-base font-bold text-blue-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
            <div className="flex items-center gap-1 mb-0.5">
              <FileText className="w-3 h-3 text-purple-600" />
              <span className="text-xs text-gray-600">Rate</span>
            </div>
            <p className="text-base font-bold text-purple-600">{stats.conversionRate}%</p>
          </div>
        </div>

        {/* Bulk Add Panel */}
        {showBulkAdd && canEdit && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Quick Add Multiple Visits</h3>
              <span className="text-xs text-gray-600">{bulkEntries.length} row(s)</span>
            </div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-white sticky top-0">
                  <tr>
                    <th className="px-1 py-1 text-left font-medium text-gray-700 border-b">Date*</th>
                    <th className="px-1 py-1 text-left font-medium text-gray-700 border-b">Customer*</th>
                    <th className="px-1 py-1 text-left font-medium text-gray-700 border-b">From</th>
                    <th className="px-1 py-1 text-left font-medium text-gray-700 border-b">To</th>
                    <th className="px-1 py-1 text-left font-medium text-gray-700 border-b">Area</th>
                    <th className="px-1 py-1 text-left font-medium text-gray-700 border-b">Purpose</th>
                    <th className="px-1 py-1 text-left font-medium text-gray-700 border-b">Check-in</th>
                    <th className="px-1 py-1 text-left font-medium text-gray-700 border-b">Check-out</th>
                    <th className="px-1 py-1 text-left font-medium text-gray-700 border-b w-8"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bulkEntries.map((entry, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-1 py-0.5">
                        <input
                          type="date"
                          value={entry.date || ''}
                          onChange={(e) => updateBulkRow(index, 'date', e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && entry.date && entry.customerName) {
                              e.preventDefault();
                              if (index === bulkEntries.length - 1) {
                                addBulkRow();
                              } else {
                                (e.target as HTMLInputElement).parentElement?.parentElement?.nextElementSibling?.querySelector('input')?.focus();
                              }
                            }
                          }}
                          className="w-full px-1 py-0.5 text-xs text-gray-900 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </td>
                      <td className="px-1 py-0.5">
                        <input
                          type="text"
                          value={entry.customerName || ''}
                          onChange={(e) => updateBulkRow(index, 'customerName', e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && entry.date && entry.customerName) {
                              e.preventDefault();
                              if (index === bulkEntries.length - 1) {
                                addBulkRow();
                              } else {
                                (e.target as HTMLInputElement).parentElement?.parentElement?.nextElementSibling?.querySelector('input')?.focus();
                              }
                            }
                          }}
                          className="w-full px-1 py-0.5 text-xs text-gray-900 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder="Company name"
                          required
                        />
                      </td>
                      <td className="px-1 py-0.5">
                        <input
                          type="text"
                          value={entry.fromLocation || ''}
                          onChange={(e) => updateBulkRow(index, 'fromLocation', e.target.value)}
                          className="w-full px-1 py-0.5 text-xs text-gray-900 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder="From"
                        />
                      </td>
                      <td className="px-1 py-0.5">
                        <input
                          type="text"
                          value={entry.toLocation || ''}
                          onChange={(e) => updateBulkRow(index, 'toLocation', e.target.value)}
                          className="w-full px-1 py-0.5 text-xs text-gray-900 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder="To"
                        />
                      </td>
                      <td className="px-1 py-0.5">
                        <input
                          type="text"
                          value={entry.areaRegion || ''}
                          onChange={(e) => updateBulkRow(index, 'areaRegion', e.target.value)}
                          className="w-full px-1 py-0.5 text-xs text-gray-900 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder="Area"
                        />
                      </td>
                      <td className="px-1 py-0.5">
                        <select
                          value={entry.purpose || ''}
                          onChange={(e) => updateBulkRow(index, 'purpose', e.target.value)}
                          className="w-full px-1 py-0.5 text-xs text-gray-900 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select</option>
                          <option value="Product Demo">Product Demo</option>
                          <option value="Technical Query">Technical Query</option>
                          <option value="Follow-up">Follow-up</option>
                          <option value="Development">Development</option>
                          <option value="Customer Meeting">Customer Meeting</option>
                          <option value="Site Survey">Site Survey</option>
                        </select>
                      </td>
                      <td className="px-1 py-0.5">
                        <input
                          type="time"
                          value={entry.plannedCheckIn || ''}
                          onChange={(e) => updateBulkRow(index, 'plannedCheckIn', e.target.value)}
                          className="w-full px-1 py-0.5 text-xs text-gray-900 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-1 py-0.5">
                        <input
                          type="time"
                          value={entry.plannedCheckOut || ''}
                          onChange={(e) => updateBulkRow(index, 'plannedCheckOut', e.target.value)}
                          className="w-full px-1 py-0.5 text-xs text-gray-900 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-1 py-0.5">
                        <button
                          type="button"
                          onClick={() => removeBulkRow(index)}
                          className="text-red-600 hover:text-red-700"
                          aria-label="Remove row"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
              <span>💡 Tip: Fill Date & Customer (required). Press Tab to move between fields. Add rows as needed.</span>
              <span className="font-medium">{bulkEntries.filter(e => e.date && e.customerName).length} valid</span>
            </div>
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && !showBulkAdd && (
          <div className="h-[600px]">
            <CalendarView
              entries={entries}
              currentDate={plan.startDate ? new Date(plan.startDate) : new Date()}
              onDateClick={(date) => {
                if (canEdit) {
                  handleDayClick(date);
                }
              }}
              onEntryClick={(entry) => {
                if (entry.visitReportId) {
                  router.push(`/dashboard/visits/${entry.visitReportId}`);
                } else if (entry.status === 'completed' || entry.status === 'in-progress') {
                  handleConvertToReport(entry);
                } else if (canEdit) {
                  const date = new Date(entry.date);
                  setSelectedDate(date);
                  setEditingEntry(entry);
                  setShowEntryModal(true);
                }
              }}
              viewMode={calendarViewMode}
              onViewModeChange={setCalendarViewMode}
              canEdit={canEdit}
            />
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && !showBulkAdd && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">From → To</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Check-in/out</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-2 py-4 text-center text-gray-500 text-xs">
                        No planned visits. {canEdit && 'Click "Bulk Add" to add multiple visits quickly!'}
                      </td>
                    </tr>
                  ) : (
                    entries
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((entry) => {
                        const indicator = getStatusIndicator(entry.status, entry.visitReportId);
                        return (
                          <tr
                            key={entry.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              const date = new Date(entry.date);
                              setSelectedDate(date);
                              setEditingEntry(entry);
                              setShowEntryModal(true);
                            }}
                          >
                            <td className="px-2 py-1">
                              <div className="text-xs font-medium text-gray-900">{entry.date}</div>
                              <div className="text-xs text-gray-500">{entry.day}</div>
                            </td>
                            <td className="px-2 py-1">
                              <div className="text-xs font-medium text-gray-900">{entry.customerName}</div>
                              <div className="text-xs text-gray-500">{entry.areaRegion}</div>
                            </td>
                            <td className="px-2 py-1 text-xs text-gray-900">{entry.purpose}</td>
                            <td className="px-2 py-1">
                              <div className="text-xs text-gray-900">{entry.fromLocation} → {entry.toLocation}</div>
                            </td>
                            <td className="px-2 py-1">
                              {entry.plannedCheckIn && (
                                <div className="text-xs text-gray-600">In: {entry.plannedCheckIn}</div>
                              )}
                              {entry.plannedCheckOut && (
                                <div className="text-xs text-gray-600">Out: {entry.plannedCheckOut}</div>
                              )}
                            </td>
                            <td className="px-2 py-1">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                entry.status === 'completed' ? 'bg-green-100 text-green-800' :
                                entry.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                entry.status === 'converted' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`} title={indicator.label}>
                                {indicator.icon} {entry.status}
                              </span>
                            </td>
                            <td className="px-2 py-1">
                              {entry.visitReportId && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/dashboard/visits/${entry.visitReportId}`);
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  View Report
                                </button>
                              )}
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

        {/* Action Buttons */}
        {user.role === 'sales_engineer' && plan.status === 'draft' && !showBulkAdd && (
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={handleSubmitPlan}
              className="px-3 py-1.5 text-xs bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Submit for Approval
            </button>
          </div>
        )}

        {/* Entry Modal */}
        {showEntryModal && selectedDate && (
          <EntryModal
            entry={editingEntry}
            date={selectedDate}
            onSave={handleSaveEntry}
            onClose={() => {
              setShowEntryModal(false);
              setSelectedDate(null);
              setEditingEntry(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
}


// Entry Modal Component (simplified - will be enhanced)
function EntryModal({ entry, date, onSave, onConvert, onClose }: {
  entry: TravelPlanEntry | null;
  date: Date;
  onSave: (data: Partial<TravelPlanEntry>) => void;
  onConvert?: () => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    fromLocation: entry?.fromLocation || '',
    toLocation: entry?.toLocation || '',
    areaRegion: entry?.areaRegion || '',
    customerName: entry?.customerName || '',
    purpose: entry?.purpose || '',
    plannedCheckIn: entry?.plannedCheckIn || '',
    plannedCheckOut: entry?.plannedCheckOut || '',
    actualCheckIn: entry?.actualCheckIn || '',
    actualCheckOut: entry?.actualCheckOut || '',
    status: entry?.status || 'planned',
    notes: entry?.notes || '',
    photos: entry?.photos || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      date: date.toISOString().split('T')[0],
      day: getDayName(date.toISOString().split('T')[0]),
      photos: formData.photos,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-2 max-h-[95vh] overflow-y-auto">
        <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900">
              {entry ? 'Edit Visit' : 'Add Visit'} - {date.toLocaleDateString()}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">
              ✕
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-2 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">From Location</label>
              <input
                type="text"
                value={formData.fromLocation}
                onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">To Location</label>
              <input
                type="text"
                value={formData.toLocation}
                onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Area/Region</label>
            <input
              type="text"
              value={formData.areaRegion}
              onChange={(e) => setFormData({ ...formData, areaRegion: e.target.value })}
              className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Customer Name *</label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Purpose</label>
            <select
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select Purpose</option>
              <option value="Product Demo">Product Demo</option>
              <option value="Technical Query">Technical Query</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Development">Development</option>
              <option value="Customer Meeting">Customer Meeting</option>
              <option value="Site Survey">Site Survey</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Planned Check-in</label>
              <input
                type="time"
                value={formData.plannedCheckIn}
                onChange={(e) => setFormData({ ...formData, plannedCheckIn: e.target.value })}
                className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Planned Check-out</label>
              <input
                type="time"
                value={formData.plannedCheckOut}
                onChange={(e) => setFormData({ ...formData, plannedCheckOut: e.target.value })}
                className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Actual Check-in</label>
              <input
                type="time"
                value={formData.actualCheckIn}
                onChange={(e) => {
                  const newData = { ...formData, actualCheckIn: e.target.value };
                  // Auto-update status to in-progress when check-in is added
                  if (e.target.value && formData.status === 'planned') {
                    newData.status = 'in-progress';
                  }
                  setFormData(newData);
                }}
                className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Actual Check-out</label>
              <input
                type="time"
                value={formData.actualCheckOut}
                onChange={(e) => {
                  const newData = { ...formData, actualCheckOut: e.target.value };
                  // Auto-update status to completed when check-out is added
                  if (e.target.value && formData.actualCheckIn) {
                    newData.status = 'completed';
                  }
                  setFormData(newData);
                }}
                className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                if (!formData.actualCheckIn) {
                  setFormData({ ...formData, actualCheckIn: timeStr, status: 'in-progress' });
                } else if (!formData.actualCheckOut) {
                  setFormData({ ...formData, actualCheckOut: timeStr, status: 'completed' });
                }
              }}
              className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {!formData.actualCheckIn ? 'Mark Check-in Now' : !formData.actualCheckOut ? 'Mark Check-out Now' : 'Visit Completed'}
            </button>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="px-2 py-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="skipped">Skipped</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Photos (Optional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center">
              <input
                type="file"
                accept="image/jpeg,image/png"
                multiple
                className="hidden"
                id="photo-upload"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 10) {
                    alert('Maximum 10 photos allowed');
                    return;
                  }
                  const photoNames = files.map(f => f.name);
                  setFormData({ ...formData, photos: [...(entry?.photos || []), ...photoNames] });
                }}
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer flex flex-col items-center gap-1 hover:bg-gray-50 rounded-lg p-2 transition-colors"
              >
                <Camera className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-600">
                  Click to upload (max 10)
                </span>
                <span className="text-xs text-gray-500">
                  {formData.photos.length}/10
                </span>
              </label>
              {formData.photos && formData.photos.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {formData.photos.map((photo, idx) => (
                    <div key={idx} className="relative flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                      <span className="text-gray-700 truncate max-w-[100px]">{photo}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            photos: formData.photos.filter((_, i) => i !== idx),
                          });
                        }}
                        className="text-red-600 hover:text-red-700"
                        aria-label="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <div>
              {entry && (entry.status === 'completed' || entry.status === 'in-progress') && !entry.visitReportId && (
                <button
                  type="button"
                  onClick={onConvert}
                  className="px-2 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  Convert
                </button>
              )}
              {entry?.visitReportId && (
                <a
                  href={`/dashboard/visits/${entry.visitReportId}`}
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  View Report
                </a>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2 py-1 text-xs bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                {entry ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

