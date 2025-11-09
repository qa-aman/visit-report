'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { getCurrentUser, getTravelPlans, saveTravelPlan, getTravelPlanEntriesByPlanId } from '@/lib/storage';
import { TravelPlan, User, TravelPlanEntry } from '@/types';
import { formatDateForDisplay, getConversionStats } from '@/lib/travelPlanUtils';
import { CheckCircle, XCircle, Clock, ArrowLeft, FileText, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function ApprovePlansPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<TravelPlan | null>(null);
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

    // Get plans submitted for approval
    const allPlans = getTravelPlans();
    const pendingPlans = allPlans.filter(
      (p) => p.teamLeaderId === currentUser.id && p.status === 'submitted'
    );
    setPlans(pendingPlans);
  }, [router, toast]);

  const handleApprove = (plan: TravelPlan) => {
    setSelectedPlan(plan);
    setShowApproveDialog(true);
  };

  const handleReject = (plan: TravelPlan) => {
    setSelectedPlan(plan);
    setRejectionReason('');
    setShowRejectDialog(true);
  };

  const confirmApprove = () => {
    if (!selectedPlan || !user) return;

    const updatedPlan: TravelPlan = {
      ...selectedPlan,
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: user.id,
      updatedAt: new Date().toISOString(),
    };

    if (saveTravelPlan(updatedPlan)) {
      setPlans((prev) => prev.filter((p) => p.id !== selectedPlan.id));
      toast.showToast('Plan approved successfully', 'success');
      setShowApproveDialog(false);
      setSelectedPlan(null);
    } else {
      toast.showToast('Failed to approve plan', 'error');
    }
  };

  const confirmReject = () => {
    if (!selectedPlan || !user || !rejectionReason.trim()) {
      toast.showToast('Please provide a rejection reason', 'error');
      return;
    }

    const updatedPlan: TravelPlan = {
      ...selectedPlan,
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectedBy: user.id,
      rejectionComments: rejectionReason,
      updatedAt: new Date().toISOString(),
    };

    if (saveTravelPlan(updatedPlan)) {
      setPlans((prev) => prev.filter((p) => p.id !== selectedPlan.id));
      toast.showToast('Plan rejected', 'success');
      setShowRejectDialog(false);
      setSelectedPlan(null);
      setRejectionReason('');
    } else {
      toast.showToast('Failed to reject plan', 'error');
    }
  };

  const getPlanEntries = (planId: string): TravelPlanEntry[] => {
    return getTravelPlanEntriesByPlanId(planId);
  };

  if (!user) {
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
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/dashboard/team')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Approve Travel Plans</h1>
            <p className="text-gray-600 mt-1">Review and approve submitted travel plans</p>
          </div>
        </div>

        {plans.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Plans Reviewed</h3>
            <p className="text-gray-600">No pending plans for approval</p>
          </div>
        ) : (
          <div className="space-y-6">
            {plans.map((plan) => {
              const entries = getPlanEntries(plan.id);
              const stats = getConversionStats(entries);

              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">
                        {plan.month} {plan.year}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Submitted: {plan.submittedAt ? formatDateForDisplay(plan.submittedAt) : 'N/A'}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => router.push(`/dashboard/plans/approve/${plan.id}`)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Review Plan
                      </button>
                      <button
                        onClick={() => handleReject(plan)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(plan)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600 mb-1">Total Visits</div>
                      <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600 mb-1">Completed</div>
                      <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600 mb-1">Pending</div>
                      <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600 mb-1">Conversion Rate</div>
                      <div className="text-2xl font-bold text-purple-600">{stats.conversionRate}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Approve Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showApproveDialog}
          title="Approve Travel Plan?"
          message={`Are you sure you want to approve the travel plan for ${selectedPlan?.month} ${selectedPlan?.year}? This will activate the plan for the sales engineer.`}
          confirmText="Approve"
          cancelText="Cancel"
          type="info"
          onConfirm={confirmApprove}
          onCancel={() => {
            setShowApproveDialog(false);
            setSelectedPlan(null);
          }}
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
                      setSelectedPlan(null);
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

