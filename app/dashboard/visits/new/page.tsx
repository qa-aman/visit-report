'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { getCurrentUser } from '@/lib/storage';
import { saveVisitEntry, getVisitEntries, getTravelPlans, getTravelPlanEntriesByPlanId, getTravelPlanEntryById, saveTravelPlanEntry } from '@/lib/storage';
import { getPersonaById, getTeamLeaderForEngineer, getVerticalForLeader } from '@/lib/personas';
import { predefinedOptions } from '@/lib/personas';
import { VisitEntry, ContactPerson, User, TravelPlanEntry, TravelPlan } from '@/types';
import { formatDate, getDayOfWeek, generateId, validateEmail, validateMobile } from '@/lib/utils';
import { ArrowLeft, Plus, X, Calendar, Link as LinkIcon, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ToastProvider';

export default function NewVisitPage() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    dateOfVisit: formatDate(new Date()),
    companyName: '',
    plant: '',
    cityArea: '',
    state: '',
    purposeOfMeeting: '',
    discussionPoints: '',
    productServices: '',
    actionStep: '',
    remarks: '',
    potentialSaleValue: '',
    visitOutcome: '' as 'Satisfied' | 'Dissatisfied' | 'Need for Improvement' | '',
    convertStatus: '',
    status: '',
    result: '',
    closureDate: '',
  });

  const [contactPersons, setContactPersons] = useState<ContactPerson[]>([
    { id: generateId(), name: '', designation: '', mobile: '', email: '' },
  ]);
  const [selectedPlanEntryId, setSelectedPlanEntryId] = useState<string>('');
  const [availablePlanEntries, setAvailablePlanEntries] = useState<TravelPlanEntry[]>([]);
  const [showPlanLinkModal, setShowPlanLinkModal] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    // Load available travel plan entries for linking
    if (currentUser.role === 'sales_engineer') {
      const plans = getTravelPlans().filter(p => p.salesEngineerId === currentUser.id && (p.status === 'approved' || p.status === 'active'));
      const allEntries: TravelPlanEntry[] = [];
      plans.forEach(plan => {
        const entries = getTravelPlanEntriesByPlanId(plan.id);
        // Only show entries that haven't been converted yet
        const unconvertedEntries = entries.filter(e => !e.visitReportId && (e.status === 'completed' || e.status === 'in-progress' || e.status === 'planned'));
        allEntries.push(...unconvertedEntries);
      });
      setAvailablePlanEntries(allEntries);
    }
  }, [router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'dateOfVisit') {
      // Auto-calculate day of visit
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleContactChange = (index: number, field: keyof ContactPerson, value: string) => {
    setContactPersons((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addContactPerson = () => {
    setContactPersons((prev) => [
      ...prev,
      { id: generateId(), name: '', designation: '', mobile: '', email: '' },
    ]);
  };

  const removeContactPerson = (index: number) => {
    if (contactPersons.length > 1) {
      setContactPersons((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleLinkPlanEntry = (entryId: string) => {
    const entry = getTravelPlanEntryById(entryId);
    if (entry) {
      // Pre-fill form data from travel plan entry
      setFormData(prev => ({
        ...prev,
        dateOfVisit: entry.date,
        companyName: entry.customerName,
        cityArea: entry.areaRegion,
        state: entry.toLocation,
        purposeOfMeeting: entry.purpose,
        remarks: entry.notes || '',
      }));
      setSelectedPlanEntryId(entryId);
      setShowPlanLinkModal(false);
      toast.showToast('Travel plan entry linked and form pre-filled', 'success');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.dateOfVisit) newErrors.dateOfVisit = 'Date of visit is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.cityArea.trim()) newErrors.cityArea = 'City/Area is required';
    if (!formData.purposeOfMeeting) newErrors.purposeOfMeeting = 'Purpose of meeting is required';
    if (!formData.visitOutcome) newErrors.visitOutcome = 'Visit outcome is required';
    if (!formData.convertStatus) newErrors.convertStatus = 'Convert status is required';

    // Validate contact persons
    contactPersons.forEach((contact, index) => {
      if (!contact.name.trim()) {
        newErrors[`contact_${index}_name`] = 'Contact name is required';
      }
      if (contact.email && !validateEmail(contact.email)) {
        newErrors[`contact_${index}_email`] = 'Invalid email format';
      }
      if (contact.mobile && !validateMobile(contact.mobile)) {
        newErrors[`contact_${index}_mobile`] = 'Invalid mobile number';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;

    setLoading(true);

    try {
      const allEntries = getVisitEntries();
      const serialNumber = allEntries.length + 1;

      const visitDate = new Date(formData.dateOfVisit);
      const dayOfVisit = getDayOfWeek(visitDate);

      const visitEntry: VisitEntry = {
        id: generateId(),
        visitReportId: `${user.id}-${Date.now()}`,
        serialNumber,
        dateOfVisit: formData.dateOfVisit,
        dayOfVisit,
        companyName: formData.companyName,
        plant: formData.plant,
        cityArea: formData.cityArea,
        state: formData.state,
        contactPersons: contactPersons.filter(
          (c) => c.name.trim() || c.email.trim() || c.mobile.trim()
        ),
        purposeOfMeeting: formData.purposeOfMeeting,
        discussionPoints: formData.discussionPoints,
        productServices: formData.productServices,
        actionStep: formData.actionStep,
        remarks: formData.remarks,
        potentialSaleValue: formData.potentialSaleValue,
        visitOutcome: formData.visitOutcome as 'Satisfied' | 'Dissatisfied' | 'Need for Improvement',
        convertStatus: formData.convertStatus as 'PreLead' | 'Enquiry' | 'Proposal' | 'Negotiation' | 'Closed',
        status: formData.status || 'Open',
        result: formData.result,
        closureDate: formData.closureDate,
        travelPlanEntryId: selectedPlanEntryId || undefined,
        isFromPlan: !!selectedPlanEntryId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const success = saveVisitEntry(visitEntry);
      if (success) {
        // If linked to a plan entry, update the plan entry
        if (selectedPlanEntryId) {
          const planEntry = getTravelPlanEntryById(selectedPlanEntryId);
          if (planEntry) {
            const updatedEntry = {
              ...planEntry,
              visitReportId: visitEntry.id,
              status: 'converted' as const,
              updatedAt: new Date().toISOString(),
            };
            saveTravelPlanEntry(updatedEntry);
          }
        }
        toast.showToast('Visit report created successfully', 'success');
      } else {
        toast.showToast('Failed to save visit report. Storage may be full.', 'error');
        setLoading(false);
        return;
      }
      
      // Show success and redirect
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (error) {
      console.error('Error saving visit:', error);
      toast.showToast('Failed to create visit report', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-3 border-b border-gray-200">
            <h1 className="text-lg font-semibold text-gray-900">New Visit Report</h1>
            <p className="text-xs text-gray-600 mt-0.5">Fill in the details of your client visit</p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Link to Travel Plan */}
            {user.role === 'sales_engineer' && availablePlanEntries.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-900">
                      {selectedPlanEntryId ? 'Linked to Travel Plan' : 'Link to Travel Plan Entry'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPlanLinkModal(true)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex items-center gap-1.5"
                  >
                    <LinkIcon className="w-4 h-4" />
                    {selectedPlanEntryId ? 'Change Link' : 'Select Plan Entry'}
                  </button>
                </div>
                {selectedPlanEntryId && (
                  <p className="text-xs text-blue-700 mt-2">
                    Form will be pre-filled from the selected travel plan entry
                  </p>
                )}
              </div>
            )}

            {/* Visit Information */}
            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Visit Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Date of Visit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfVisit}
                    onChange={(e) => handleInputChange('dateOfVisit', e.target.value)}
                    className={`w-full px-3 py-1.5 text-sm text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.dateOfVisit ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.dateOfVisit && (
                    <p className="text-red-500 text-xs mt-1">{errors.dateOfVisit}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Day of Visit
                  </label>
                  <input
                    type="text"
                    value={formData.dateOfVisit ? getDayOfWeek(new Date(formData.dateOfVisit)) : ''}
                    disabled
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>
              </div>
            </section>

            {/* Company Information */}
            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Company Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Name of Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className={`w-full px-3 py-1.5 text-sm text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.companyName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., EPIGRAL"
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">PLANT</label>
                  <input
                    type="text"
                    value={formData.plant}
                    onChange={(e) => handleInputChange('plant', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., YAMUNA, H202"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    City / Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cityArea}
                    onChange={(e) => handleInputChange('cityArea', e.target.value)}
                    className={`w-full px-3 py-1.5 text-sm text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.cityArea ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., DAHEJ"
                  />
                  {errors.cityArea && (
                    <p className="text-red-500 text-xs mt-1">{errors.cityArea}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className={`w-full px-3 py-1.5 text-sm text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.state ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., GUJARAT"
                  />
                  {errors.state && (
                    <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Contact Persons */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">Contact Persons</h2>
                <button
                  type="button"
                  onClick={addContactPerson}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Contact</span>
                </button>
              </div>
              <div className="space-y-2">
                {contactPersons.map((contact, index) => (
                  <div
                    key={contact.id}
                    className="p-2 border border-gray-200 rounded-lg space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-700">
                        Contact Person {index + 1}
                      </h3>
                      {contactPersons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContactPerson(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                          className={`w-full px-3 py-1.5 text-sm text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`contact_${index}_name`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="e.g., NIRMAL GOHIL"
                        />
                        {errors[`contact_${index}_name`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`contact_${index}_name`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Designation
                        </label>
                        <input
                          type="text"
                          value={contact.designation}
                          onChange={(e) => handleContactChange(index, 'designation', e.target.value)}
                          className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., MANAGER - MECHANICAL"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Mobile
                        </label>
                        <input
                          type="tel"
                          value={contact.mobile}
                          onChange={(e) => handleContactChange(index, 'mobile', e.target.value)}
                          className={`w-full px-3 py-1.5 text-sm text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`contact_${index}_mobile`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="e.g., 6357997198"
                        />
                        {errors[`contact_${index}_mobile`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`contact_${index}_mobile`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={contact.email}
                          onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                          className={`w-full px-3 py-1.5 text-sm text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`contact_${index}_email`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="e.g., al.gohil@epigral"
                        />
                        {errors[`contact_${index}_email`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`contact_${index}_email`]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Meeting Details */}
            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Meeting Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Purpose of Meeting <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.purposeOfMeeting}
                    onChange={(e) => handleInputChange('purposeOfMeeting', e.target.value)}
                    className={`w-full px-3 py-1.5 text-sm text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.purposeOfMeeting ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select purpose</option>
                    {predefinedOptions.purpose.map((purpose) => (
                      <option key={purpose} value={purpose}>
                        {purpose}
                      </option>
                    ))}
                  </select>
                  {errors.purposeOfMeeting && (
                    <p className="text-red-500 text-xs mt-1">{errors.purposeOfMeeting}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Discussion Points
                  </label>
                  <textarea
                    value={formData.discussionPoints}
                    onChange={(e) => handleInputChange('discussionPoints', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 2124, 1570-WELDED"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Product / Services
                  </label>
                  <input
                    type="text"
                    value={formData.productServices}
                    onChange={(e) => handleInputChange('productServices', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., GASKET"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Action Step / Action Plan
                  </label>
                  <input
                    type="text"
                    value={formData.actionStep}
                    onChange={(e) => handleInputChange('actionStep', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., BQ SUBMITTING"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Remarks / Notes / Comments
                  </label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => handleInputChange('remarks', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., MULTIPLE SIZE QUOTE AND SUGGESTION 4MM SQ, EA-202"
                  />
                </div>
              </div>
            </section>

            {/* Opportunity Details */}
            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Opportunity Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Potential Sale Value / Opportunity Size
                  </label>
                  <input
                    type="text"
                    value={formData.potentialSaleValue}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      const formatted = value ? parseInt(value).toLocaleString('en-IN') : '';
                      handleInputChange('potentialSaleValue', formatted);
                    }}
                    className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 300000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Visit Outcome <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.visitOutcome}
                    onChange={(e) => handleInputChange('visitOutcome', e.target.value)}
                    className={`w-full px-3 py-1.5 text-sm text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.visitOutcome ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select outcome</option>
                    {predefinedOptions.outcome.map((outcome) => (
                      <option key={outcome} value={outcome}>
                        {outcome}
                      </option>
                    ))}
                  </select>
                  {errors.visitOutcome && (
                    <p className="text-red-500 text-xs mt-1">{errors.visitOutcome}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Convert <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.convertStatus}
                    onChange={(e) => handleInputChange('convertStatus', e.target.value)}
                    className={`w-full px-3 py-1.5 text-sm text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.convertStatus ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select status</option>
                    {predefinedOptions.convert.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  {errors.convertStatus && (
                    <p className="text-red-500 text-xs mt-1">{errors.convertStatus}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Open">Open</option>
                    {predefinedOptions.status.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Result</label>
                  <select
                    value={formData.result}
                    onChange={(e) => handleInputChange('result', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select result</option>
                    {predefinedOptions.result.map((result) => (
                      <option key={result} value={result}>
                        {result}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Closure Date
                  </label>
                  <input
                    type="date"
                    value={formData.closureDate}
                    onChange={(e) => handleInputChange('closureDate', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </section>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Link
                href="/dashboard"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Visit Report'}
              </button>
            </div>
          </form>
        </div>

        {/* Travel Plan Link Modal */}
        {showPlanLinkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Link to Travel Plan Entry</h2>
                  <button
                    onClick={() => setShowPlanLinkModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Select a travel plan entry to pre-fill the visit report form
                </p>
              </div>
              <div className="p-6">
                {availablePlanEntries.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No available travel plan entries</p>
                ) : (
                  <div className="space-y-3">
                    {availablePlanEntries.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => handleLinkPlanEntry(entry.id)}
                        className={`w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                          selectedPlanEntryId === entry.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900">{entry.customerName}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {entry.date} • {entry.purpose}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {entry.fromLocation} → {entry.toLocation} • {entry.areaRegion}
                            </div>
                          </div>
                          {selectedPlanEntryId === entry.id && (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

