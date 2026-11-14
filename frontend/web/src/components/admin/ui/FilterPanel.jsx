import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';

export default function FilterPanel({
  search,
  onSearchChange,
  filters = [],
  showAdvanced = false,
  onToggleAdvanced,
  children,
}) {
  const [internalShowAdvanced, setInternalShowAdvanced] = useState(showAdvanced);

  const handleToggle = () => {
    const newValue = !internalShowAdvanced;
    setInternalShowAdvanced(newValue);
    if (onToggleAdvanced) {
      onToggleAdvanced(newValue);
    }
  };

  const hasActiveFilters = filters.some((f) => f.value && f.value !== 'all');

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        {onSearchChange && (
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
            />
            {search && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Quick filters or custom content */}
        {children}

        {/* Advanced filter toggle */}
        {filters.length > 0 && (
          <button
            onClick={handleToggle}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              hasActiveFilters
                ? 'border-[#1a6b3c] bg-[#f5f9f6] text-[#1a6b3c]'
                : 'border-gray-300 hover:bg-gray-50 text-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 bg-[#1a6b3c] text-white text-xs rounded-full">
                {filters.filter((f) => f.value && f.value !== 'all').length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {internalShowAdvanced && filters.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200">
          {filters.map((filter, index) => (
            <div key={index} className="min-w-[200px]">
              {filter.type === 'select' && (
                <select
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
                >
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              {filter.type === 'date' && (
                <input
                  type="date"
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
