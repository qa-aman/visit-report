'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { getCurrentUser } from '@/lib/storage';
import { getTravelPlans, getTravelPlanEntriesByPlanId, saveTravelPlanEntry, saveTravelPlan } from '@/lib/storage';
import { TravelPlan, TravelPlanEntry, User } from '@/types';
import { getDaysInMonth, getMonthName, formatDateForInput, getStatusIndicator, getConversionStats, getEntriesForDate, getDayName } from '@/lib/travelPlanUtils';
import { Calendar, Plus, CheckCircle, Clock, ArrowLeft, FileText, MapPin, ExternalLink, Camera, X } from 'lucide-react';
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
  const { showToast } = useToast();

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
      showToast('Travel plan not found', 'error');
      router.push('/dashboard/plans');
      return;
    }

    // Check permissions
    if (currentUser.role === 'sales_engineer' && foundPlan.salesEngineerId !== currentUser.id) {
      showToast('You do not have permission to view this plan', 'error');
      router.push('/dashboard/plans');
      return;
    }

    setPlan(foundPlan);
    const planEntries = getTravelPlanEntriesByPlanId(planId);
    setEntries(planEntries);
  }, [planId, router, showToast]);

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
    const dateStr = formatDateForInput(date);
    const existingEntry = entries.find((e) => e.date === dateStr);
    
    if (existingEntry) {
      setEditingEntry(existingEntry);
    } else {
      setEditingEntry(null);
    }
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
      showToast(editingEntry ? 'Entry updated successfully' : 'Entry created successfully', 'success');
      setShowEntryModal(false);
      setSelectedDate(null);
      setEditingEntry(null);
    } else {
      showToast('Failed to save entry', 'error');
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
      showToast('Only completed or in-progress visits can be converted to reports', 'error');
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
          showToast('Visit report created from travel plan', 'success');
          // Navigate to the new visit report
          setTimeout(() => {
            router.push(`/dashboard/visits/${visitEntry.id}`);
          }, 500);
        } else {
          showToast('Report created but failed to update plan entry', 'warning');
          router.push(`/dashboard/visits/${visitEntry.id}`);
        }
      } else {
        showToast('Failed to create visit report', 'error');
      }
    } catch (error) {
      console.error('Error converting to report:', error);
      showToast('Failed to convert to visit report', 'error');
    }
  };

  const handleSubmitPlan = () => {
    if (!plan) return;
    
    const updatedPlan: TravelPlan = {
      ...plan,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (saveTravelPlan(updatedPlan)) {
      setPlan(updatedPlan);
      showToast('Plan submitted for approval', 'success');
    } else {
      showToast('Failed to submit plan', 'error');
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

  const canEdit = plan.status === 'draft' || (plan.status === 'approved' && user.role === 'sales_engineer');

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/dashboard/plans')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {plan.month} {plan.year} Travel Plan
            </h1>
            <p className="text-gray-600 mt-1">
              Status: <span className="font-medium">{plan.status}</span>
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Total Visits</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Converted</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-600">Conversion Rate</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.conversionRate}%</p>
          </div>
        </div>

        {/* Calendar Grid */}
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
              const isPast = date < new Date() && !isToday;

              return (
                <div
                  key={dateStr}
                  className={`
                    min-h-[100px] border rounded-lg p-2 cursor-pointer transition-all
                    ${isToday ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}
                    ${isPast ? 'bg-gray-50' : 'bg-white'}
                    ${canEdit ? 'hover:shadow-md' : ''}
                  `}
                  onClick={() => canEdit && handleDayClick(date)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-medium ${isToday ? 'text-orange-600' : 'text-gray-900'}`}>
                      {date.getDate()}
                    </span>
                    {dayEntries.length > 0 && (
                      <div className="flex gap-1">
                        {dayEntries.map((entry) => {
                          const indicator = getStatusIndicator(entry.status, entry.visitReportId);
                          return (
                            <span
                              key={entry.id}
                              className="text-xs cursor-pointer"
                              title={indicator.label}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (entry.visitReportId) {
                                  router.push(`/dashboard/visits/${entry.visitReportId}`);
                                } else if (entry.status === 'completed' || entry.status === 'in-progress') {
                                  handleConvertToReport(entry);
                                }
                              }}
                            >
                              {indicator.icon}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {dayEntries.length > 0 && (
                    <div className="text-xs text-gray-600 space-y-1">
                      {dayEntries.slice(0, 2).map((entry) => (
                        <div key={entry.id} className="truncate" title={entry.customerName}>
                          {entry.customerName}
                          {entry.visitReportId && (
                            <span className="ml-1 text-green-600" title="Visit Report Created">✓</span>
                          )}
                        </div>
                      ))}
                      {dayEntries.length > 2 && (
                        <div className="text-gray-400">+{dayEntries.length - 2} more</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        {user.role === 'sales_engineer' && plan.status === 'draft' && (
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={handleSubmitPlan}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {entry ? 'Edit Visit' : 'Add Visit'} - {date.toLocaleDateString()}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Location</label>
              <input
                type="text"
                value={formData.fromLocation}
                onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Location</label>
              <input
                type="text"
                value={formData.toLocation}
                onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Area/Region</label>
            <input
              type="text"
              value={formData.areaRegion}
              onChange={(e) => setFormData({ ...formData, areaRegion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
            <select
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Planned Check-in</label>
              <input
                type="time"
                value={formData.plannedCheckIn}
                onChange={(e) => setFormData({ ...formData, plannedCheckIn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Planned Check-out</label>
              <input
                type="time"
                value={formData.plannedCheckOut}
                onChange={(e) => setFormData({ ...formData, plannedCheckOut: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actual Check-in</label>
              <input
                type="time"
                value={formData.actualCheckIn}
                onChange={(e) => setFormData({ ...formData, actualCheckIn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actual Check-out</label>
              <input
                type="time"
                value={formData.actualCheckOut}
                onChange={(e) => setFormData({ ...formData, actualCheckOut: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="skipped">Skipped</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photos (Optional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
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
                  // In a real app, these would be uploaded to a server
                  // For now, we'll just store the file names
                  const photoNames = files.map(f => f.name);
                  setFormData({ ...formData, photos: [...(entry?.photos || []), ...photoNames] });
                }}
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer flex flex-col items-center gap-2 hover:bg-gray-50 rounded-lg p-4 transition-colors"
              >
                <Camera className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Click to upload photos (JPG/PNG, max 5MB each, max 10 photos)
                </span>
                <span className="text-xs text-gray-500">
                  {formData.photos.length} of 10 photos
                </span>
              </label>
              {formData.photos && formData.photos.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {formData.photos.map((photo, idx) => (
                    <div key={idx} className="relative flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
                      <span className="text-gray-700">{photo}</span>
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
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div>
              {entry && (entry.status === 'completed' || entry.status === 'in-progress') && !entry.visitReportId && (
                <button
                  type="button"
                  onClick={onConvert}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Convert to Report
                </button>
              )}
              {entry?.visitReportId && (
                <a
                  href={`/dashboard/visits/${entry.visitReportId}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Report
                </a>
              )}
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                {entry ? 'Update' : 'Save'} Entry
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

