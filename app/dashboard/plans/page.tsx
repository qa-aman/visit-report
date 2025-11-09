'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { getCurrentUser } from '@/lib/storage';
import { getTravelPlans, getTravelPlanEntries } from '@/lib/storage';
import { initializeTravelPlanData } from '@/lib/initializeTravelPlans';
import { TravelPlan, TravelPlanEntry, User } from '@/types';
import { formatDateForDisplay, getConversionStats } from '@/lib/travelPlanUtils';
import { Calendar, Plus, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function TravelPlansPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [entries, setEntries] = useState<TravelPlanEntry[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    // Initialize dummy data if needed
    initializeTravelPlanData();

    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    // Load plans
    const allPlans = getTravelPlans();
    const allEntries = getTravelPlanEntries();

    if (currentUser.role === 'sales_engineer') {
      // Filter plans for this sales engineer
      const userPlans = allPlans.filter((p) => p.salesEngineerId === currentUser.id);
      setPlans(userPlans);
      const userPlanIds = userPlans.map((p) => p.id);
      setEntries(allEntries.filter((e) => userPlanIds.includes(e.travelPlanId)));
    } else if (currentUser.role === 'team_leader') {
      // Filter plans for team members
      const teamPlans = allPlans.filter((p) => p.teamLeaderId === currentUser.id);
      setPlans(teamPlans);
      const teamPlanIds = teamPlans.map((p) => p.id);
      setEntries(allEntries.filter((e) => teamPlanIds.includes(e.travelPlanId)));
    } else {
      // Admin sees all
      setPlans(allPlans);
      setEntries(allEntries);
    }
  }, [router]);

  const getStatusBadge = (status: TravelPlan['status']) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">Draft</span>;
      case 'submitted':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Submitted</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>;
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">Active</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Completed</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  const getPlanEntries = (planId: string) => {
    return entries.filter((e) => e.travelPlanId === planId);
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Travel Plans</h1>
            <p className="text-gray-600 mt-2">Plan and manage your monthly travel itineraries</p>
          </div>
          {user.role === 'sales_engineer' && (
            <button
              onClick={() => router.push('/dashboard/plans/new')}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Plan</span>
            </button>
          )}
        </div>

        {plans.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Travel Plans</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first monthly travel plan</p>
            {user.role === 'sales_engineer' && (
              <button
                onClick={() => router.push('/dashboard/plans/new')}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Create Travel Plan
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {plans.map((plan) => {
              const planEntries = getPlanEntries(plan.id);
              const stats = getConversionStats(planEntries);
              
              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:border-orange-300 transition-all cursor-pointer"
                  onClick={() => router.push(`/dashboard/plans/${plan.id}`)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {plan.month} {plan.year}
                        </h2>
                        {getStatusBadge(plan.status)}
                      </div>
                      <p className="text-sm text-gray-500">
                        Created: {formatDateForDisplay(plan.createdAt)}
                        {plan.submittedAt && ` • Submitted: ${formatDateForDisplay(plan.submittedAt)}`}
                        {plan.approvedAt && ` • Approved: ${formatDateForDisplay(plan.approvedAt)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {plan.status === 'approved' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/plans/${plan.id}`);
                          }}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                        >
                          View Plan
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Total Visits</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">Converted</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-600">Pending</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-gray-600">Conversion Rate</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">{stats.conversionRate}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

