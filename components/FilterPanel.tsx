'use client';

import { useState } from 'react';
import { X, Calendar, MapPin, Package, Filter } from 'lucide-react';

interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void;
  availableStates: string[];
  availableCities: string[];
  availableProducts: string[];
}

export interface FilterState {
  dateRange: { start: string; end: string };
  state: string;
  city: string;
  product: string;
  outcome: string;
}

export default function FilterPanel({
  onFilterChange,
  availableStates,
  availableCities,
  availableProducts,
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: '', end: '' },
    state: '',
    city: '',
    product: '',
    outcome: '',
  });

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      dateRange: { start: '', end: '' },
      state: '',
      city: '',
      product: '',
      outcome: '',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = 
    filters.dateRange.start ||
    filters.dateRange.end ||
    filters.state ||
    filters.city ||
    filters.product ||
    filters.outcome;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
        aria-label="Toggle filter panel"
      >
        <div className="flex items-center gap-1.5">
          <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
          <span className="text-xs sm:text-sm font-medium text-gray-900">Filters</span>
          {hasActiveFilters && (
            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
              Active
            </span>
          )}
        </div>
        <span className="text-gray-500 text-xs">{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && (
        <div className="p-2 border-t border-gray-200 space-y-2">
          {/* Date Range */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) =>
                    handleFilterChange('dateRange', {
                      ...filters.dateRange,
                      start: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1 text-xs text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Start date"
                />
              </div>
              <div>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) =>
                    handleFilterChange('dateRange', {
                      ...filters.dateRange,
                      end: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1 text-xs text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="End date"
                />
              </div>
            </div>
          </div>

          {/* State Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              State
            </label>
            <select
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              className="w-full px-2 py-1 text-xs text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter by state"
            >
              <option value="">All States</option>
              {availableStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">City / Area</label>
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="w-full px-2 py-1 text-xs text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:text-gray-500"
              aria-label="Filter by city"
              disabled={!filters.state}
            >
              <option value="">All Cities</option>
              {availableCities
                .filter((city) => !filters.state || true) // Filter by state if needed
                .map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
            </select>
          </div>

          {/* Product/Service Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Package className="w-3 h-3" />
              Product / Service
            </label>
            <select
              value={filters.product}
              onChange={(e) => handleFilterChange('product', e.target.value)}
              className="w-full px-2 py-1 text-xs text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter by product or service"
            >
              <option value="">All Products</option>
              {availableProducts.map((product) => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </div>

          {/* Outcome Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Visit Outcome</label>
            <select
              value={filters.outcome}
              onChange={(e) => handleFilterChange('outcome', e.target.value)}
              className="w-full px-2 py-1 text-xs text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter by visit outcome"
            >
              <option value="">All Outcomes</option>
              <option value="Satisfied">Satisfied</option>
              <option value="Dissatisfied">Dissatisfied</option>
              <option value="Need for Improvement">Need for Improvement</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
              aria-label="Clear all filters"
            >
              <X className="w-3 h-3" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}


