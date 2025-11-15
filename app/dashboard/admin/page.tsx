'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { getCurrentUser, getSystemConfig, saveSystemConfig } from '@/lib/storage';
import { getVisitEntries } from '@/lib/storage';
import { predefinedOptions } from '@/lib/personas';
import { User } from '@/types';
import { Settings, Users, FileText, Database, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function AdminPage() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [systemConfig, setSystemConfig] = useState(getSystemConfig());

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    setUser(currentUser);
  }, [router]);

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Administration</h1>
          <p className="text-gray-600 mt-1">Manage system settings and configurations</p>
        </div>

        {/* System Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Travel Plan Approval Required</h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {systemConfig.approvalRequired 
                    ? 'Plans must be approved by Team Leaders before becoming active'
                    : 'Plans become active immediately after creation'}
                </p>
              </div>
              <button
                onClick={() => {
                  const newConfig = {
                    ...systemConfig,
                    approvalRequired: !systemConfig.approvalRequired,
                    updatedAt: new Date().toISOString(),
                    updatedBy: user?.id || 'admin',
                  };
                  if (saveSystemConfig(newConfig)) {
                    setSystemConfig(newConfig);
                    toast.showToast(
                      `Approval requirement ${newConfig.approvalRequired ? 'enabled' : 'disabled'}`,
                      'success'
                    );
                  } else {
                    toast.showToast('Failed to update configuration', 'error');
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  systemConfig.approvalRequired
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {systemConfig.approvalRequired ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Enabled</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Disabled</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Manage Verticals */}
          <button
            onClick={() => alert('Manage Verticals feature - Coming soon!')}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:border-blue-300 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Verticals</h3>
                <p className="text-sm text-gray-500 mt-1">Business divisions</p>
              </div>
            </div>
          </button>

          {/* Manage Options */}
          <button
            onClick={() => alert('Predefined Options management - Coming soon!')}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:border-green-300 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Predefined Options</h3>
                <p className="text-sm text-gray-500 mt-1">Dropdown values</p>
              </div>
            </div>
          </button>

          {/* Manage Users */}
          <button
            onClick={() => alert('User Management - Coming soon!')}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:border-purple-300 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-500 mt-1">Team members</p>
              </div>
            </div>
          </button>

          {/* Data Export */}
          <button
            onClick={() => {
              const visits = getVisitEntries();
              const csv = [
                ['Date', 'Company', 'Purpose', 'Outcome', 'Value', 'Status'].join(','),
                ...visits.map(v => [
                  v.dateOfVisit,
                  v.companyName,
                  v.purposeOfMeeting,
                  v.visitOutcome,
                  v.potentialSaleValue || '0',
                  v.status
                ].join(','))
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `visit-reports-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:border-orange-300 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Data Export</h3>
                <p className="text-sm text-gray-500 mt-1">Export reports</p>
              </div>
            </div>
          </button>
        </div>

        {/* Current Predefined Options */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Current Predefined Options</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Purpose of Meeting</h3>
              <div className="flex flex-wrap gap-2">
                {predefinedOptions.purpose.map((option) => (
                  <span
                    key={option}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                  >
                    {option}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Visit Outcome</h3>
              <div className="flex flex-wrap gap-2">
                {predefinedOptions.outcome.map((option) => (
                  <span
                    key={option}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                  >
                    {option}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Convert Status</h3>
              <div className="flex flex-wrap gap-2">
                {predefinedOptions.convert.map((option) => (
                  <span
                    key={option}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                  >
                    {option}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Status</h3>
              <div className="flex flex-wrap gap-2">
                {predefinedOptions.status.map((option) => (
                  <span
                    key={option}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                  >
                    {option}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Result</h3>
              <div className="flex flex-wrap gap-2">
                {predefinedOptions.result.map((option) => (
                  <span
                    key={option}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                  >
                    {option}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

