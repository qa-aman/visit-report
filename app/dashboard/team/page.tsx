'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { getCurrentUser } from '@/lib/storage';
import { getVisitEntries } from '@/lib/storage';
import { initializeDummyData } from '@/lib/initializeData';
import { VisitEntry, User } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { personas } from '@/lib/personas';
import { CheckCircle, XCircle, Clock, TrendingUp, Users as UsersIcon, Search, X } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useMemo } from 'react';

export default function TeamDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [teamVisits, setTeamVisits] = useState<VisitEntry[]>([]);
  const [allTeamVisits, setAllTeamVisits] = useState<VisitEntry[]>([]);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalVisits: 0,
    totalValue: 0,
    satisfied: 0,
    dissatisfied: 0,
    needImprovement: 0,
    pendingApproval: 0,
  });

  useEffect(() => {
    // Initialize dummy data if needed
    initializeDummyData();

    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'team_leader') {
      router.push('/dashboard');
      return;
    }
    setUser(currentUser);

    // Get visits from team members
    const teamMemberIds = personas
      .filter((p) => p.role === 'sales_engineer' && p.teamLeaderId === currentUser.id)
      .map((p) => p.id);

    const allVisits = getVisitEntries();
    let baseFiltered = allVisits.filter((v) =>
      teamMemberIds.some((id) => v.visitReportId?.includes(id))
    );

    // Filter by selected member if any
    if (selectedMember) {
      baseFiltered = baseFiltered.filter((v) => v.visitReportId?.includes(selectedMember));
    }

    // Apply active filter if any
    let filtered = baseFiltered;
    if (activeFilter === 'satisfied') {
      filtered = baseFiltered.filter((v) => v.visitOutcome === 'Satisfied');
    } else if (activeFilter === 'needImprovement') {
      filtered = baseFiltered.filter((v) => v.visitOutcome === 'Need for Improvement');
    } else if (activeFilter === 'byValue') {
      filtered = [...baseFiltered].sort((a, b) => {
        const aValue = parseFloat(a.potentialSaleValue?.replace(/,/g, '') || '0');
        const bValue = parseFloat(b.potentialSaleValue?.replace(/,/g, '') || '0');
        return bValue - aValue;
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((v) => {
        const companyMatch = v.companyName.toLowerCase().includes(query);
        const contactMatch = v.contactPersons.some((c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query)
        );
        const purposeMatch = v.purposeOfMeeting.toLowerCase().includes(query);
        return companyMatch || contactMatch || purposeMatch;
      });
    }

    setAllTeamVisits(baseFiltered);
    setTeamVisits(filtered.sort((a, b) => 
      new Date(b.dateOfVisit).getTime() - new Date(a.dateOfVisit).getTime()
    ));

    // Calculate stats from base filtered (not active filter)
    const totalValue = baseFiltered.reduce((sum, v) => {
      const value = parseFloat(v.potentialSaleValue?.replace(/,/g, '') || '0');
      return sum + value;
    }, 0);

    setStats({
      totalVisits: baseFiltered.length,
      totalValue,
      satisfied: baseFiltered.filter((v) => v.visitOutcome === 'Satisfied').length,
      dissatisfied: baseFiltered.filter((v) => v.visitOutcome === 'Dissatisfied').length,
      needImprovement: baseFiltered.filter((v) => v.visitOutcome === 'Need for Improvement').length,
      pendingApproval: 0, // This would come from report status
    });
  }, [router, selectedMember, activeFilter, searchQuery]);

  if (!user) {
    return null;
  }

  const teamMembers = personas.filter(
    (p) => p.role === 'sales_engineer' && p.teamLeaderId === user.id
  );

  return (
    <Layout>
      <div className="space-y-2">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-gray-900">Team Reports</h1>
          <p className="text-xs text-gray-600 mt-0.5">Monitor team visit reports</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <button
            onClick={() => {
              setActiveFilter(activeFilter === 'all' ? null : 'all');
              setSelectedMember(null);
            }}
            className={`bg-white rounded-lg p-2 shadow-sm border transition-all text-left ${
              activeFilter === 'all' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Visits</p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900 mt-0.5">
                  {stats.totalVisits}
                </p>
              </div>
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <UsersIcon className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'byValue' ? null : 'byValue')}
            className={`bg-white rounded-lg p-2 shadow-sm border transition-all text-left ${
              activeFilter === 'byValue' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 hover:border-green-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Opportunity</p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900 mt-0.5">
                  ₹{formatCurrency(stats.totalValue)}
                </p>
              </div>
              <div className="p-1.5 bg-green-100 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'satisfied' ? null : 'satisfied')}
            className={`bg-white rounded-lg p-2 shadow-sm border transition-all text-left ${
              activeFilter === 'satisfied' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 hover:border-green-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Satisfied</p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900 mt-0.5">
                  {stats.satisfied}
                </p>
              </div>
              <div className="p-1.5 bg-green-100 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'needImprovement' ? null : 'needImprovement')}
            className={`bg-white rounded-lg p-2 shadow-sm border transition-all text-left ${
              activeFilter === 'needImprovement' ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-gray-200 hover:border-yellow-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Need Improvement</p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900 mt-0.5">
                  {stats.needImprovement}
                </p>
              </div>
              <div className="p-1.5 bg-yellow-100 rounded-lg">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
          </button>
        </div>

        {(activeFilter || selectedMember || searchQuery) && (
          <div className="flex items-center gap-1.5 text-xs flex-wrap">
            <span className="text-gray-600">Filtered:</span>
            {selectedMember && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-medium">
                {personas.find(p => p.id === selectedMember)?.name}
              </span>
            )}
            {activeFilter && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                {activeFilter === 'all' ? 'All Visits' :
                 activeFilter === 'satisfied' ? 'Satisfied' :
                 activeFilter === 'needImprovement' ? 'Need Improvement' :
                 activeFilter === 'byValue' ? 'Sorted by Value' : ''}
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-medium">
                "{searchQuery}"
              </span>
            )}
            <button
              onClick={() => {
                setActiveFilter(null);
                setSelectedMember(null);
                setSearchQuery('');
              }}
              className="text-blue-600 hover:text-blue-700 underline text-xs"
            >
              Clear
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 sm:pl-9 pr-7 sm:pr-9 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Team Members Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-2 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Team Members</h2>
          </div>
          <div className="p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {teamMembers.map((member) => {
                const memberVisits = teamVisits.filter((v) =>
                  v.visitReportId?.includes(member.id)
                );
                const memberValue = memberVisits.reduce((sum, v) => {
                  const value = parseFloat(v.potentialSaleValue?.replace(/,/g, '') || '0');
                  return sum + value;
                }, 0);

                return (
                  <button
                    key={member.id}
                    onClick={() => {
                      setSelectedMember(selectedMember === member.id ? null : member.id);
                      setActiveFilter(null);
                    }}
                    className={`w-full p-2 border rounded-lg transition-all text-left ${
                      selectedMember === member.id
                        ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xs font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{member.email}</p>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Visits</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {memberVisits.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Opportunity</p>
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{formatCurrency(memberValue)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Visits */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-2 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900">Team Visit Reports</h2>
            <span className="text-xs text-gray-500">
              {teamVisits.length} {teamVisits.length === 1 ? 'visit' : 'visits'}
            </span>
          </div>
          <div className="overflow-x-auto">
            {teamVisits.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs text-gray-500">No visits recorded by team members yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">
                      Company
                    </th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">
                      Engineer
                    </th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">
                      Outcome
                    </th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teamVisits.map((visit) => {
                    const engineer = personas.find((p) =>
                      visit.visitReportId?.includes(p.id)
                    );
                    return (
                      <tr
                        key={visit.id}
                        onClick={() => router.push(`/dashboard/visits/${visit.id}`)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-900">
                          {formatDate(visit.dateOfVisit)}
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs font-medium text-gray-900">
                          {visit.companyName}
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-500">
                          {engineer?.name || 'Unknown'}
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap">
                          <span
                            className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
                              visit.visitOutcome === 'Satisfied'
                                ? 'bg-green-100 text-green-800'
                                : visit.visitOutcome === 'Dissatisfied'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {visit.visitOutcome}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-900">
                          {visit.potentialSaleValue ? `₹${visit.potentialSaleValue}` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

