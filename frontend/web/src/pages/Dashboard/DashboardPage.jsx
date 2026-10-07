import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { REPORT_STATUS } from '../../data/mockReports.js';
import SummaryCard from '../../components/ui/SummaryCard.jsx';
import ReportTable from '../../components/reports/ReportTable.jsx';
import FilterBar from '../../components/reports/FilterBar.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import { useState, useMemo } from 'react';
import { FileText, FilePlus, Clock3, ClipboardCheck, CircleCheck } from 'lucide-react';

const TAB_STATUSES = {
  all:           null,
  new:           REPORT_STATUS.NEW,
  'under-review': REPORT_STATUS.UNDER_REVIEW,
  'in-progress': REPORT_STATUS.IN_PROGRESS,
  resolved:      REPORT_STATUS.RESOLVED,
};

export default function DashboardPage() {
  const { reports, reportsLoading, currentUser } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', category: '' });

  const counts = useMemo(() => ({
    total:       reports.length,
    new:         reports.filter((r) => r.status === REPORT_STATUS.NEW).length,
    inProgress:  reports.filter((r) => r.status === REPORT_STATUS.IN_PROGRESS).length,
    underReview: reports.filter((r) => r.status === REPORT_STATUS.UNDER_REVIEW).length,
    resolved:    reports.filter((r) => r.status === REPORT_STATUS.RESOLVED).length,
  }), [reports]);

  const filtered = useMemo(() => {
    let list = [...reports];

    // Tab filter
    const tabStatus = TAB_STATUSES[activeTab];
    if (tabStatus) list = list.filter((r) => r.status === tabStatus);

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((r) =>
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.location?.kebele?.toLowerCase().includes(q) ||
        r.location?.city?.toLowerCase().includes(q)
      );
    }
    if (filters.status) list = list.filter((r) => r.status === filters.status);
    if (filters.priority) list = list.filter((r) => r.priority === filters.priority);
    if (filters.category) list = list.filter((r) => r.category === filters.category);

    return list;
  }, [reports, activeTab, filters]);

  const tabClass = (tab) =>
    `px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
      activeTab === tab
        ? 'bg-[#1a6b3c] text-white'
        : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Report Inbox</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review, assign, track and resolve reports submitted to your institution.
        </p>
      </div>

      {/* Summary cards */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Total Reports:</p>
        <div className="flex flex-wrap gap-3">
          <SummaryCard
            icon={<FileText className="w-6 h-6" />}
            label="total reports"
            count={counts.total}
            color="blue"
            onClick={() => { setActiveTab('all'); navigate('/reports'); }}
          />
          <SummaryCard
            icon={<FilePlus className="w-6 h-6" />}
            label="New"
            count={counts.new}
            color="red"
            onClick={() => setActiveTab('new')}
          />
          <SummaryCard
            icon={<Clock3 className="w-6 h-6" />}
            label="In progress"
            count={counts.inProgress}
            color="orange"
            onClick={() => setActiveTab('in-progress')}
          />
          <SummaryCard
            icon={<ClipboardCheck className="w-6 h-6" />}
            label="Under Review"
            count={counts.underReview}
            color="yellow"
            onClick={() => setActiveTab('under-review')}
          />
          <SummaryCard
            icon={<CircleCheck className="w-6 h-6" />}
            label="Resolved"
            count={counts.resolved}
            color="green"
            onClick={() => setActiveTab('resolved')}
          />
        </div>
      </div>

      {/* Main report card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="px-6 py-4 border-b border-gray-100">
          <FilterBar
            filters={filters}
            onChange={setFilters}
            onClear={() => setFilters({ search: '', status: '', priority: '', category: '' })}
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 overflow-x-auto">
          <button className={tabClass('all')} onClick={() => setActiveTab('all')}>
            All <span className="ml-1 text-xs opacity-70">{counts.total}</span>
          </button>
          <button className={tabClass('new')} onClick={() => setActiveTab('new')}>
            New <span className="ml-1 text-xs opacity-70">{counts.new}</span>
          </button>
          <button className={tabClass('under-review')} onClick={() => setActiveTab('under-review')}>
            Under Review <span className="ml-1 text-xs opacity-70">{counts.underReview}</span>
          </button>
          <button className={tabClass('in-progress')} onClick={() => setActiveTab('in-progress')}>
            In Progress <span className="ml-1 text-xs opacity-70">{counts.inProgress}</span>
          </button>
          <button className={tabClass('resolved')} onClick={() => setActiveTab('resolved')}>
            Resolved <span className="ml-1 text-xs opacity-70">{counts.resolved}</span>
          </button>
        </div>

        {/* Table */}
        {reportsLoading ? (
          <LoadingSpinner message="Loading reports..." />
        ) : (
          <ReportTable reports={filtered} />
        )}
      </div>
    </div>
  );
}
