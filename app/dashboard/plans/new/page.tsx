'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { getCurrentUser, saveTravelPlan, getTravelPlans } from '@/lib/storage';
import { initializeTravelPlanData } from '@/lib/initializeTravelPlans';
import { TravelPlan, User } from '@/types';
import { getMonthName } from '@/lib/travelPlanUtils';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { generateId } from '@/lib/utils';

export default function NewTravelPlanPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [month, setMonth] = useState<number>(() => {
    const now = new Date();
    return now.getMonth() + 1; // Next month
  });
  const [year, setYear] = useState<number>(() => {
    const now = new Date();
    return now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
  });
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
  }, [router, toast]);

  const handleCreate = () => {
    if (!user) return;

    const monthName = getMonthName(month);
    
    // Check if plan already exists for this month/year
    const existingPlans = getTravelPlans();
    const duplicatePlan = existingPlans.find(
      (p) => p.salesEngineerId === user.id && 
             p.month === monthName && 
             p.year === year &&
             (p.status === 'draft' || p.status === 'submitted' || p.status === 'approved' || p.status === 'active')
    );

    if (duplicatePlan) {
      toast.showToast(`A plan for ${monthName} ${year} already exists. Please edit the existing plan.`, 'error');
      router.push(`/dashboard/plans/${duplicatePlan.id}`);
      return;
    }

    const plan: TravelPlan = {
      id: generateId(),
      salesEngineerId: user.id,
      teamLeaderId: user.teamLeaderId || 'tl-001', // Default team leader
      month: monthName,
      year,
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

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Available months: current month + next 3 months
  const availableMonths = [];
  for (let i = 0; i < 4; i++) {
    const m = currentMonth + i;
    const y = m > 12 ? currentYear + 1 : currentYear;
    const monthNum = m > 12 ? m - 12 : m;
    availableMonths.push({ month: monthNum, year: y, name: getMonthName(monthNum) });
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/dashboard/plans')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Travel Plan</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Month and Year
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Month</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {availableMonths.map((m) => (
                      <option key={`${m.year}-${m.month}`} value={m.month}>
                        {m.name} {m.year}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    min={currentYear}
                    max={currentYear + 1}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">Planning Guidelines</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Plan should be created before the month begins</li>
                    <li>• You can add day-wise visits after creating the plan</li>
                    <li>• Plan will be submitted to your Team Leader for approval</li>
                    <li>• You can edit the plan until it's approved</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => router.push('/dashboard/plans')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
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

