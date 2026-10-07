import { REPORT_STATUS, PRIORITY } from '../../data/mockReports.js';
import { Search, X } from 'lucide-react';

export default function FilterBar({ filters, onChange, onClear }) {
  const statuses = Object.values(REPORT_STATUS);
  const priorities = Object.values(PRIORITY);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by report ID, title, location..."
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
        />
      </div>

      {/* Status */}
      <select
        value={filters.status || ''}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] bg-white"
      >
        <option value="">All Statuses</option>
        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      {/* Priority */}
      <select
        value={filters.priority || ''}
        onChange={(e) => onChange({ ...filters, priority: e.target.value })}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] bg-white"
      >
        <option value="">All Priorities</option>
        {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>

      {/* Category */}
      <select
        value={filters.category || ''}
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] bg-white"
      >
        <option value="">All Categories</option>
        <option value="Water & Sanitation">Water & Sanitation</option>
        <option value="Road & Infrastructure">Road & Infrastructure</option>
        <option value="Waste Management">Waste Management</option>
        <option value="Electricity & Lighting">Electricity & Lighting</option>
      </select>

      {/* Clear */}
      {(filters.search || filters.status || filters.priority || filters.category) && (
        <button
          onClick={onClear}
          className="px-3 py-2 text-sm text-gray-500 hover:text-red-600 border border-gray-200 rounded-lg hover:border-red-200 transition-colors flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          Clear filters
        </button>
      )}
    </div>
  );
}
