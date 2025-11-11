'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { getCurrentUser } from '@/lib/storage';
import { getTravelPlans, getTravelPlanEntries } from '@/lib/storage';
import { initializeTravelPlanData } from '@/lib/initializeTravelPlans';
import { TravelPlan, TravelPlanEntry, User } from '@/types';
import { formatDateForDisplay, getConversionStats } from '@/lib/travelPlanUtils';
import { Calendar, Plus, CheckCircle, Clock, XCircle, FileText, Table } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function TravelPlansPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [entries, setEntries] = useState<TravelPlanEntry[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('table');
  const toast = useToast();

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
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Travel Plans</h1>
            <p className="text-xs text-gray-600 mt-0.5">Plan and manage your monthly travel itineraries</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1.5 ${
                  viewMode === 'table'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Table className="w-3 h-3" />
                Table
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1.5 ${
                  viewMode === 'calendar'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="w-3 h-3" />
                Calendar
              </button>
            </div>
            {user.role === 'sales_engineer' && (
              <button
                onClick={() => router.push('/dashboard/plans/new')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Plan</span>
              </button>
            )}
          </div>
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
        ) : viewMode === 'table' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Month/Year</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Visits</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Converted</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Conversion Rate</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {plans.map((plan) => {
                    const planEntries = getPlanEntries(plan.id);
                    const stats = getConversionStats(planEntries);
                    return (
                      <tr
                        key={plan.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/dashboard/plans/${plan.id}`)}
                      >
                        <td className="px-3 py-2">
                          <div className="font-medium text-gray-900">{plan.month} {plan.year}</div>
                        </td>
                        <td className="px-3 py-2">{getStatusBadge(plan.status)}</td>
                        <td className="px-3 py-2 text-gray-900">{stats.total}</td>
                        <td className="px-3 py-2 text-green-600 font-medium">{stats.converted}</td>
                        <td className="px-3 py-2 text-blue-600 font-medium">{stats.pending}</td>
                        <td className="px-3 py-2 text-purple-600 font-medium">{stats.conversionRate}%</td>
                        <td className="px-3 py-2 text-gray-600 text-xs">{formatDateForDisplay(plan.createdAt)}</td>
                        <td className="px-3 py-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/plans/${plan.id}`);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {plans.map((plan) => {
              const planEntries = getPlanEntries(plan.id);
              const stats = getConversionStats(planEntries);
              
              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:border-orange-300 transition-all cursor-pointer"
                  onClick={() => router.push(`/dashboard/plans/${plan.id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-base font-semibold text-gray-900">
                          {plan.month} {plan.year}
                        </h2>
                        {getStatusBadge(plan.status)}
                      </div>
                      <p className="text-xs text-gray-500">
                        Created: {formatDateForDisplay(plan.createdAt)}
                        {plan.submittedAt && ` • Submitted: ${formatDateForDisplay(plan.submittedAt)}`}
                        {plan.approvedAt && ` • Approved: ${formatDateForDisplay(plan.approvedAt)}`}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-2">
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-xs text-gray-600 mb-0.5">Total</div>
                      <p className="text-lg font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-green-50 rounded p-2">
                      <div className="text-xs text-gray-600 mb-0.5">Converted</div>
                      <p className="text-lg font-bold text-green-600">{stats.converted}</p>
                    </div>
                    <div className="bg-blue-50 rounded p-2">
                      <div className="text-xs text-gray-600 mb-0.5">Pending</div>
                      <p className="text-lg font-bold text-blue-600">{stats.pending}</p>
                    </div>
                    <div className="bg-purple-50 rounded p-2">
                      <div className="text-xs text-gray-600 mb-0.5">Rate</div>
                      <p className="text-lg font-bold text-purple-600">{stats.conversionRate}%</p>
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

