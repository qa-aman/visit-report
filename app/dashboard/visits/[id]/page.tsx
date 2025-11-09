'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { getCurrentUser } from '@/lib/storage';
import { getVisitEntries, saveVisitEntry, deleteVisitEntry } from '@/lib/storage';
import { VisitEntry, User } from '@/types';
import { formatDate, formatCurrency, getDayOfWeek, generateId } from '@/lib/utils';
import { ArrowLeft, Edit, Check, X, Mail, Phone, MapPin, Calendar, Building2, DollarSign, User as UserIcon, Trash2, Copy, Printer, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ToastProvider';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function VisitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const visitId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [visit, setVisit] = useState<VisitEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedVisit, setEditedVisit] = useState<VisitEntry | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    const allVisits = getVisitEntries();
    const foundVisit = allVisits.find((v) => v.id === visitId);
    if (!foundVisit) {
      // Visit not found - will show loading state, then user can navigate back
      return;
    }
    setVisit(foundVisit);
    setEditedVisit(foundVisit);
  }, [visitId, router]);

  const handleSave = () => {
    if (editedVisit) {
      const success = saveVisitEntry({
        ...editedVisit,
        updatedAt: new Date().toISOString(),
      });
      if (success) {
        setVisit(editedVisit);
        setIsEditing(false);
        toast.showToast('Visit report updated successfully', 'success');
      } else {
        toast.showToast('Failed to update visit report. Storage may be full.', 'error');
      }
    }
  };

  const handleCancel = () => {
    setEditedVisit(visit);
    setIsEditing(false);
  };

  const handleApproveReject = (status: 'approved' | 'rejected') => {
    if (!visit) return;
    const updatedVisit = {
      ...visit,
      status: status === 'approved' ? 'Approved' : 'Rejected',
      updatedAt: new Date().toISOString(),
    };
    const success = saveVisitEntry(updatedVisit);
    if (success) {
      setVisit(updatedVisit);
      toast.showToast(
        `Visit report ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
        'success'
      );
    } else {
      toast.showToast('Failed to update visit report', 'error');
    }
  };

  const handleDelete = () => {
    if (!visit) return;
    setLoading(true);
    try {
      const success = deleteVisitEntry(visit.id);
      if (success) {
        toast.showToast('Visit report deleted successfully', 'success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      } else {
        toast.showToast('Failed to delete visit report', 'error');
      }
    } catch (error) {
      toast.showToast('An error occurred while deleting', 'error');
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDuplicate = () => {
    if (!visit) return;
    try {
      const allEntries = getVisitEntries();
      const newVisit: VisitEntry = {
        ...visit,
        id: generateId(),
        visitReportId: `${user?.id}-${Date.now()}`,
        serialNumber: allEntries.length + 1,
        dateOfVisit: new Date().toISOString().split('T')[0],
        dayOfVisit: getDayOfWeek(new Date()),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        contactPersons: visit.contactPersons.map(cp => ({
          ...cp,
          id: generateId(),
        })),
      };
      const success = saveVisitEntry(newVisit);
      if (success) {
        toast.showToast('Visit report duplicated successfully', 'success');
      } else {
        toast.showToast('Failed to duplicate visit report. Storage may be full.', 'error');
        return;
      }
      setTimeout(() => {
        router.push(`/dashboard/visits/${newVisit.id}`);
      }, 500);
    } catch (error) {
      toast.showToast('Failed to duplicate visit report', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!visit) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="mb-6">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">
            Visit Report Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The visit report you're looking for doesn't exist or has been deleted.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </Layout>
    );
  }

  const displayVisit = isEditing ? editedVisit : visit;

  if (!displayVisit) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Visit Report Details</h1>
              <p className="text-gray-600 mt-1">{displayVisit.companyName}</p>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    aria-label="Print visit report"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Print</span>
                  </button>
                  <button
                    onClick={handleDuplicate}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    aria-label="Duplicate visit report"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">Duplicate</span>
                  </button>
                  {user.role === 'sales_engineer' && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                      aria-label="Edit visit report"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  )}
                  {user.role === 'sales_engineer' && (
                    <button
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                      aria-label="Delete visit report"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  )}
                  {user.role === 'team_leader' && (
                    <>
                      <button
                        onClick={() => handleApproveReject('approved')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                        aria-label="Approve visit report"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Approve</span>
                      </button>
                      <button
                        onClick={() => handleApproveReject('rejected')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                        aria-label="Reject visit report"
                      >
                        <XCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Reject</span>
                      </button>
                    </>
                  )}
                </>
              )}
              {isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Visit Information */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Visit Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Visit</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={displayVisit.dateOfVisit}
                      onChange={(e) => setEditedVisit({ ...displayVisit!, dateOfVisit: e.target.value, dayOfVisit: getDayOfWeek(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{formatDate(displayVisit.dateOfVisit)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day of Visit</label>
                  <p className="text-gray-900">{displayVisit.dayOfVisit}</p>
                </div>
              </div>
            </section>

            {/* Company Information */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Company Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayVisit.companyName}
                      onChange={(e) => setEditedVisit({ ...displayVisit!, companyName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{displayVisit.companyName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plant</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayVisit.plant}
                      onChange={(e) => setEditedVisit({ ...displayVisit!, plant: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{displayVisit.plant || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    City / Area
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayVisit.cityArea}
                      onChange={(e) => setEditedVisit({ ...displayVisit!, cityArea: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{displayVisit.cityArea}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayVisit.state}
                      onChange={(e) => setEditedVisit({ ...displayVisit!, state: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{displayVisit.state}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Contact Persons */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Contact Persons ({displayVisit.contactPersons.length})
              </h2>
              <div className="space-y-4">
                {displayVisit.contactPersons.map((contact, index) => (
                  <div key={contact.id} className="p-4 border border-gray-200 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={contact.name}
                            onChange={(e) => {
                              const updated = [...displayVisit.contactPersons];
                              updated[index] = { ...contact, name: e.target.value };
                              setEditedVisit({ ...displayVisit!, contactPersons: updated });
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-gray-900">{contact.name}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={contact.designation}
                            onChange={(e) => {
                              const updated = [...displayVisit.contactPersons];
                              updated[index] = { ...contact, designation: e.target.value };
                              setEditedVisit({ ...displayVisit!, contactPersons: updated });
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-gray-900">{contact.designation || '-'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          Mobile
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={contact.mobile}
                            onChange={(e) => {
                              const updated = [...displayVisit.contactPersons];
                              updated[index] = { ...contact, mobile: e.target.value };
                              setEditedVisit({ ...displayVisit!, contactPersons: updated });
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-gray-900">{contact.mobile || '-'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          Email
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={contact.email}
                            onChange={(e) => {
                              const updated = [...displayVisit.contactPersons];
                              updated[index] = { ...contact, email: e.target.value };
                              setEditedVisit({ ...displayVisit!, contactPersons: updated });
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-gray-900">{contact.email || '-'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Meeting Details */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Meeting Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Meeting</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayVisit.purposeOfMeeting}
                      onChange={(e) => setEditedVisit({ ...displayVisit!, purposeOfMeeting: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{displayVisit.purposeOfMeeting}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discussion Points</label>
                  {isEditing ? (
                    <textarea
                      value={displayVisit.discussionPoints}
                      onChange={(e) => setEditedVisit({ ...displayVisit!, discussionPoints: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 whitespace-pre-wrap">{displayVisit.discussionPoints || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product / Services</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayVisit.productServices}
                      onChange={(e) => setEditedVisit({ ...displayVisit!, productServices: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{displayVisit.productServices || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action Step / Action Plan</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayVisit.actionStep}
                      onChange={(e) => setEditedVisit({ ...displayVisit!, actionStep: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{displayVisit.actionStep || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks / Notes</label>
                  {isEditing ? (
                    <textarea
                      value={displayVisit.remarks}
                      onChange={(e) => setEditedVisit({ ...displayVisit!, remarks: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 whitespace-pre-wrap">{displayVisit.remarks || '-'}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Opportunity Details */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Opportunity Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Potential Sale Value</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayVisit.potentialSaleValue}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        const formatted = value ? parseInt(value).toLocaleString('en-IN') : '';
                        setEditedVisit({ ...displayVisit!, potentialSaleValue: formatted });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {displayVisit.potentialSaleValue ? `₹${displayVisit.potentialSaleValue}` : '-'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visit Outcome</label>
                  {isEditing ? (
                    <select
                      value={displayVisit.visitOutcome}
                      onChange={(e) => setEditedVisit({ ...displayVisit!, visitOutcome: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Satisfied">Satisfied</option>
                      <option value="Dissatisfied">Dissatisfied</option>
                      <option value="Need for Improvement">Need for Improvement</option>
                    </select>
                  ) : (
                    <span
                      className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                        displayVisit.visitOutcome === 'Satisfied'
                          ? 'bg-green-100 text-green-800'
                          : displayVisit.visitOutcome === 'Dissatisfied'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {displayVisit.visitOutcome}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Convert Status</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayVisit.convertStatus}
                      onChange={(e) => setEditedVisit({ ...displayVisit!, convertStatus: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{displayVisit.convertStatus}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayVisit.status}
                      onChange={(e) => setEditedVisit({ ...displayVisit!, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{displayVisit.status || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayVisit.result}
                      onChange={(e) => setEditedVisit({ ...displayVisit!, result: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{displayVisit.result || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Closure Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={displayVisit.closureDate}
                      onChange={(e) => setEditedVisit({ ...displayVisit!, closureDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{displayVisit.closureDate ? formatDate(displayVisit.closureDate) : '-'}</p>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

        <ConfirmDialog
          isOpen={showDeleteDialog}
          title="Delete Visit Report"
          message="Are you sure you want to delete this visit report? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
        />
      </div>
    </Layout>
  );
}

