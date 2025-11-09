'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { getCurrentUser } from '@/lib/storage';
import { getVisitEntries } from '@/lib/storage';
import { initializeDummyData } from '@/lib/initializeData';
import { VisitEntry, User } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Plus, Calendar, Building2, TrendingUp, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ToastProvider';
import FilterPanel, { FilterState } from '@/components/FilterPanel';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useMemo } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [allVisits, setAllVisits] = useState<VisitEntry[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    dateRange: { start: '', end: '' },
    state: '',
    city: '',
    product: '',
    outcome: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    // Initialize dummy data if needed
    initializeDummyData();

    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    const allVisitsData = getVisitEntries();
    let baseFilteredVisits = allVisitsData;

    if (currentUser.role === 'sales_engineer') {
      // Get visits for this sales engineer's reports
      baseFilteredVisits = allVisitsData.filter(
        (v) => v.visitReportId && v.visitReportId.includes(currentUser.id)
      );
    } else if (currentUser.role === 'team_leader') {
      // Get visits from team members
      const teamMemberIds = ['se-001', 'se-002']; // This should come from actual team data
      baseFilteredVisits = allVisitsData.filter((v) =>
        teamMemberIds.some((id) => v.visitReportId?.includes(id))
      );
    }

    setAllVisits(baseFilteredVisits);
  }, [router]);

  // Memoized filtering logic
  const filteredVisits = useMemo(() => {
    let result = allVisits;

    // Apply active filter if any
    if (activeFilter === 'satisfied') {
      result = result.filter((v) => v.visitOutcome === 'Satisfied');
    } else if (activeFilter === 'thisMonth') {
      const now = new Date();
      result = result.filter((v) => {
        const visitDate = new Date(v.dateOfVisit);
        return (
          visitDate.getMonth() === now.getMonth() &&
          visitDate.getFullYear() === now.getFullYear()
        );
      });
    } else if (activeFilter === 'byValue') {
      result = [...result].sort((a, b) => {
        const aValue = parseFloat(a.potentialSaleValue?.replace(/,/g, '') || '0');
        const bValue = parseFloat(b.potentialSaleValue?.replace(/,/g, '') || '0');
        return bValue - aValue;
      });
    }

    // Apply advanced filters
    if (advancedFilters.dateRange.start) {
      result = result.filter((v) => {
        const visitDate = new Date(v.dateOfVisit);
        return visitDate >= new Date(advancedFilters.dateRange.start);
      });
    }
    if (advancedFilters.dateRange.end) {
      result = result.filter((v) => {
        const visitDate = new Date(v.dateOfVisit);
        const endDate = new Date(advancedFilters.dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        return visitDate <= endDate;
      });
    }
    if (advancedFilters.state) {
      result = result.filter((v) => v.state === advancedFilters.state);
    }
    if (advancedFilters.city) {
      result = result.filter((v) => v.cityArea === advancedFilters.city);
    }
    if (advancedFilters.product) {
      result = result.filter((v) => 
        v.productServices?.toLowerCase().includes(advancedFilters.product.toLowerCase())
      );
    }
    if (advancedFilters.outcome) {
      result = result.filter((v) => v.visitOutcome === advancedFilters.outcome);
    }

    // Apply search filter (debounced)
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter((v) => {
        const companyMatch = v.companyName.toLowerCase().includes(query);
        const contactMatch = v.contactPersons.some((c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query)
        );
        const purposeMatch = v.purposeOfMeeting.toLowerCase().includes(query);
        const productMatch = v.productServices?.toLowerCase().includes(query);
        return companyMatch || contactMatch || purposeMatch || productMatch;
      });
    }

    return result.sort((a, b) => 
      new Date(b.dateOfVisit).getTime() - new Date(a.dateOfVisit).getTime()
    );
  }, [allVisits, activeFilter, advancedFilters, debouncedSearchQuery]);

  // Pagination
  const paginatedVisits = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVisits.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVisits, currentPage]);

  const totalPages = Math.ceil(filteredVisits.length / itemsPerPage);

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [activeFilter, advancedFilters, debouncedSearchQuery]);

  // Memoized stats calculation
  const stats = useMemo(() => {
    const totalValue = allVisits.reduce((sum, v) => {
      const value = parseFloat(v.potentialSaleValue?.replace(/,/g, '') || '0');
      return sum + value;
    }, 0);

    const satisfied = allVisits.filter(
      (v) => v.visitOutcome === 'Satisfied'
    ).length;

    const now = new Date();
    const thisMonth = allVisits.filter((v) => {
      const visitDate = new Date(v.dateOfVisit);
      return (
        visitDate.getMonth() === now.getMonth() &&
        visitDate.getFullYear() === now.getFullYear()
      );
    }).length;

    return {
      totalVisits: allVisits.length,
      totalValue,
      satisfied,
      thisMonth,
    };
  }, [allVisits]);

  // Get unique values for filters
  const availableStates = useMemo(() => {
    return Array.from(new Set(allVisits.map(v => v.state).filter(Boolean))).sort();
  }, [allVisits]);

  const availableCities = useMemo(() => {
    return Array.from(new Set(allVisits.map(v => v.cityArea).filter(Boolean))).sort();
  }, [allVisits]);

  const availableProducts = useMemo(() => {
    return Array.from(
      new Set(
        allVisits
          .map(v => v.productServices)
          .filter(Boolean)
          .flatMap(p => p?.split(',').map(s => s.trim()) || [])
      )
    ).sort();
  }, [allVisits]);

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Welcome back, {user.name}
            </h1>
            <p className="text-gray-600 mt-1">Here's your visit report overview</p>
          </div>
          {user.role === 'sales_engineer' && (
            <Link
              href="/dashboard/visits/new"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>New Visit Report</span>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => setActiveFilter(activeFilter === 'all' ? null : 'all')}
            className={`bg-white rounded-2xl p-6 shadow-sm border transition-all text-left ${
              activeFilter === 'all' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Visits</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">
                  {stats.totalVisits}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'byValue' ? null : 'byValue')}
            className={`bg-white rounded-2xl p-6 shadow-sm border transition-all text-left ${
              activeFilter === 'byValue' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 hover:border-green-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Opportunity</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">
                  ₹{formatCurrency(stats.totalValue)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'satisfied' ? null : 'satisfied')}
            className={`bg-white rounded-2xl p-6 shadow-sm border transition-all text-left ${
              activeFilter === 'satisfied' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfied Visits</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">
                  {stats.satisfied}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'thisMonth' ? null : 'thisMonth')}
            className={`bg-white rounded-2xl p-6 shadow-sm border transition-all text-left ${
              activeFilter === 'thisMonth' ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200 hover:border-orange-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">
                  {stats.thisMonth}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by company, contact person, purpose, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Search visits"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        <FilterPanel
          onFilterChange={setAdvancedFilters}
          availableStates={availableStates}
          availableCities={availableCities}
          availableProducts={availableProducts}
        />

        {(activeFilter || searchQuery || Object.values(advancedFilters).some(v => 
          typeof v === 'string' ? v : v.start || v.end
        )) && (
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="text-gray-600">Filtered by:</span>
            {activeFilter && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                {activeFilter === 'all' ? 'All Visits' :
                 activeFilter === 'satisfied' ? 'Satisfied Visits' :
                 activeFilter === 'thisMonth' ? 'This Month' :
                 activeFilter === 'byValue' ? 'Sorted by Value' : ''}
              </span>
            )}
            {searchQuery && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
                Search: "{searchQuery}"
              </span>
            )}
            {advancedFilters.dateRange.start && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                Date: {formatDate(advancedFilters.dateRange.start)}
                {advancedFilters.dateRange.end && ` - ${formatDate(advancedFilters.dateRange.end)}`}
              </span>
            )}
            {advancedFilters.state && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                State: {advancedFilters.state}
              </span>
            )}
            {advancedFilters.city && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                City: {advancedFilters.city}
              </span>
            )}
            {advancedFilters.product && (
              <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full font-medium">
                Product: {advancedFilters.product}
              </span>
            )}
            <button
              onClick={() => {
                setActiveFilter(null);
                setSearchQuery('');
                setAdvancedFilters({
                  dateRange: { start: '', end: '' },
                  state: '',
                  city: '',
                  product: '',
                  outcome: '',
                });
              }}
              className="text-blue-600 hover:text-blue-700 underline"
              aria-label="Clear all filters"
            >
              Clear all filters
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Visit Reports</h2>
            <span className="text-sm text-gray-500">
              Showing {paginatedVisits.length} of {filteredVisits.length} visits
              {filteredVisits.length !== allVisits.length && ` (${allVisits.length} total)`}
            </span>
          </div>
          <div className="overflow-x-auto">
            {filteredVisits.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 mb-4">No visits recorded yet</p>
                {user.role === 'sales_engineer' && (
                  <Link
                    href="/dashboard/visits/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Your First Visit Report</span>
                  </Link>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Outcome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedVisits.map((visit) => (
                    <tr
                      key={visit.id}
                      onClick={() => router.push(`/dashboard/visits/${visit.id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          router.push(`/dashboard/visits/${visit.id}`);
                        }
                      }}
                      aria-label={`View visit report for ${visit.companyName}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(visit.dateOfVisit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {visit.companyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {visit.purposeOfMeeting}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visit.potentialSaleValue
                          ? `₹${visit.potentialSaleValue}`
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                        aria-label={`Go to page ${pageNum}`}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

