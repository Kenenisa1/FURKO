import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { REPORT_STATUS } from '../../data/mockReports.js';
import ReportTable from '../../components/reports/ReportTable.jsx';
import FilterBar from '../../components/reports/FilterBar.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import { useState, useMemo, useEffect } from 'react';

const STATUS_FROM_PARAM = {
  'new':          REPORT_STATUS.NEW,
  'under-review': REPORT_STATUS.UNDER_REVIEW,
  'in-progress':  REPORT_STATUS.IN_PROGRESS,
  'resolved':     REPORT_STATUS.RESOLVED,
  'accepted':     REPORT_STATUS.ACCEPTED,
  'rejected':     REPORT_STATUS.REJECTED,
  'redirected':   REPORT_STATUS.REDIRECTED,
};

export default function ReportsPage() {
  const { reports, reportsLoading } = useApp();
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status');

  const [filters, setFilters] = useState({
    search: '',
    status: STATUS_FROM_PARAM[statusParam] || '',
    priority: '',
    category: '',
  });

  // Update filter when URL status param changes
  useEffect(() => {
    setFilters((f) => ({ ...f, status: STATUS_FROM_PARAM[statusParam] || '' }));
  }, [statusParam]);

  const filtered = useMemo(() => {
    let list = [...reports];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((r) =>
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.location?.kebele?.toLowerCase().includes(q) ||
        r.location?.city?.toLowerCase().includes(q) ||
        r.assignedTo?.toLowerCase().includes(q)
      );
    }
    if (filters.status)   list = list.filter((r) => r.status === filters.status);
    if (filters.priority) list = list.filter((r) => r.priority === filters.priority);
    if (filters.category) list = list.filter((r) => r.category === filters.category);
    return list;
  }, [reports, filters]);

  const pageTitle = statusParam
    ? `${STATUS_FROM_PARAM[statusParam] || statusParam} Reports`
    : 'All Reports';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {filtered.length} report{filtered.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <FilterBar
            filters={filters}
            onChange={setFilters}
            onClear={() => setFilters({ search: '', status: STATUS_FROM_PARAM[statusParam] || '', priority: '', category: '' })}
          />
        </div>
        {reportsLoading ? (
          <LoadingSpinner message="Loading reports..." />
        ) : (
          <ReportTable reports={filtered} />
        )}
      </div>
    </div>
  );
}
