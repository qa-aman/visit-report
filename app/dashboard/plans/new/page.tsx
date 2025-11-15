'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { getCurrentUser, saveTravelPlan, getTravelPlans, getSystemConfig } from '@/lib/storage';
import { initializeTravelPlanData } from '@/lib/initializeTravelPlans';
import { TravelPlan, User } from '@/types';
import { getMonthName } from '@/lib/travelPlanUtils';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { generateId, formatDate } from '@/lib/utils';

export default function NewTravelPlanPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [startDate, setStartDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDate(tomorrow);
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 15);
    return formatDate(nextWeek);
  });
  const [systemConfig, setSystemConfig] = useState({ approvalRequired: true });
  const toast = useToast();

  useEffect(() => {
    initializeTravelPlanData();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    if (currentUser.role !== 'sales_engineer') {
      toast.showToast('Only Sales Engineers can create travel plans', 'error');
      router.push('/dashboard/plans');
      return;
    }
    
    setUser(currentUser);
    const config = getSystemConfig();
    setSystemConfig(config);
  }, [router, toast]);

  const handleCreate = () => {
    if (!user) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      toast.showToast('End date must be after start date', 'error');
      return;
    }

    if (start < new Date()) {
      toast.showToast('Start date cannot be in the past', 'error');
      return;
    }
    
    // Check for overlapping plans
    const existingPlans = getTravelPlans();
    const overlappingPlan = existingPlans.find(
      (p) => p.salesEngineerId === user.id && 
             ((p.status === 'draft' || p.status === 'submitted' || p.status === 'approved' || p.status === 'active')) &&
             ((p.startDate && p.endDate && 
               ((start >= new Date(p.startDate) && start <= new Date(p.endDate)) ||
                (end >= new Date(p.startDate) && end <= new Date(p.endDate)) ||
                (start <= new Date(p.startDate) && end >= new Date(p.endDate))))
             )
    );

    if (overlappingPlan) {
      toast.showToast('A plan already exists for the selected date range. Please edit the existing plan.', 'error');
      router.push(`/dashboard/plans/${overlappingPlan.id}`);
      return;
    }

    // Calculate month and year for display (use start date's month)
    const monthName = getMonthName(start.getMonth() + 1);
    const year = start.getFullYear();

    const plan: TravelPlan = {
      id: generateId(),
      salesEngineerId: user.id,
      teamLeaderId: user.teamLeaderId || 'tl-001',
      startDate: startDate,
      endDate: endDate,
      month: monthName,
      year: year,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (saveTravelPlan(plan)) {
      toast.showToast('Travel plan created successfully', 'success');
      router.push(`/dashboard/plans/${plan.id}`);
    } else {
      toast.showToast('Failed to create travel plan', 'error');
    }
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

  const today = new Date();
  const minDate = formatDate(new Date(today.getTime() + 24 * 60 * 60 * 1000)); // Tomorrow
  const maxDate = formatDate(new Date(today.getFullYear() + 1, 11, 31)); // End of next year

  // Calculate days difference
  const daysDiff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-2 sm:px-3 lg:px-4 py-2">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => router.push('/dashboard/plans')}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Create New Travel Plan</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Select Date Range
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (e.target.value > endDate) {
                        // Auto-adjust end date if start is after end
                        const newEnd = new Date(e.target.value);
                        newEnd.setDate(newEnd.getDate() + 14);
                        setEndDate(formatDate(newEnd));
                      }
                    }}
                    min={minDate}
                    max={maxDate}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    max={maxDate}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              {daysDiff > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Plan duration: {daysDiff} day{daysDiff !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <h3 className="font-medium text-blue-900 mb-1">Planning Guidelines</h3>
                  <ul className="space-y-0.5">
                    <li>• Select the date range for your travel plan (e.g., 10 days, 15 days, or any custom range)</li>
                    <li>• You can add day-wise visits after creating the plan</li>
                    {systemConfig.approvalRequired ? (
                      <li>• Plan will be submitted to your Team Leader for approval</li>
                    ) : (
                      <li>• Plan will be active immediately after creation</li>
                    )}
                    <li>• You can edit the plan until it's submitted for approval</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
              <button
                onClick={() => router.push('/dashboard/plans')}
                className="px-4 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
