import { useState } from 'react';
import { Search, Download, FileText, Clock, CheckCircle, AlertCircle, Filter, TrendingUp, Calendar, Eye } from 'lucide-react';
import DataTable from '../../../components/admin/tables/DataTable.jsx';
import SummaryCards from '../../../components/admin/ui/SummaryCards.jsx';
import FilterPanel from '../../../components/admin/ui/FilterPanel.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import StatusBadge from '../../../components/ui/StatusBadge.jsx';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import { mockAdminReports, mockCategories, mockInstitutions, mockReportsOverTime } from '../../../data/mockAdminData.js';

export default function AdminReportsPage() {
  const [reports] = useState(mockAdminReports);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [institutionFilter, setInstitutionFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7days');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredReports = reports.filter((r) => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (
        !r.title.toLowerCase().includes(searchLower) &&
        !r.id.toLowerCase().includes(searchLower) &&
        !r.location.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    if (categoryFilter !== 'all' && r.categoryId !== categoryFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (institutionFilter !== 'all' && r.institutionId !== institutionFilter) return false;
    if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false;
    return true;
  });

  // Calculate summary stats
  const totalReports = reports.length;
  const newReports = reports.filter((r) => r.status === 'under_review').length;
  const inProgressReports = reports.filter((r) => r.status === 'in_progress').length;
  const resolvedReports = reports.filter((r) => r.status === 'resolved').length;

  const reportsData = mockReportsOverTime[dateRange];

  const columns = [
    {
      key: 'id',
      label: 'Report ID',
      render: (r) => <span className="font-mono text-sm font-medium text-gray-900">{r.id}</span>,
    },
    {
      key: 'title',
      label: 'Title',
      render: (r) => (
        <div>
          <p className="font-medium text-gray-900">{r.title}</p>
          <p className="text-xs text-gray-500">{r.category}</p>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (r) => <span className="text-sm text-gray-900">{r.location}</span>,
    },
    {
      key: 'institution',
      label: 'Institution',
      render: (r) => <span className="text-sm text-gray-900">{r.institution}</span>,
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (r) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            r.priority === 'critical'
              ? 'bg-red-100 text-red-800'
              : r.priority === 'high'
              ? 'bg-orange-100 text-orange-800'
              : r.priority === 'medium'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {r.priority}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'submittedAt',
      label: 'Submitted',
      render: (r) => (
        <span className="text-sm text-gray-700">{new Date(r.submittedAt).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <button
          onClick={() => {
            setSelectedReport(r);
            setShowDetailModal(true);
          }}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="View details"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Monitoring</h2>
          <p className="text-gray-600 mt-1">Platform-wide report oversight and analytics</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          title="Export report data"
        >
          <Download className="w-4 h-4" />
          Export CSV
          <span className="text-xs text-gray-500 ml-1">(Backend required)</span>
        </button>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        cards={[
          {
            label: 'Total Reports',
            value: totalReports,
            subtitle: 'All time',
            icon: <FileText className="w-6 h-6" />,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
          },
          {
            label: 'Under Review',
            value: newReports,
            subtitle: 'Awaiting action',
            icon: <Clock className="w-6 h-6" />,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
          },
          {
            label: 'In Progress',
            value: inProgressReports,
            subtitle: 'Being worked on',
            icon: <AlertCircle className="w-6 h-6" />,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
          },
          {
            label: 'Resolved',
            value: resolvedReports,
            subtitle: 'Completed',
            icon: <CheckCircle className="w-6 h-6" />,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
          },
        ]}
      />

      {/* Analytics Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Report Analytics</h3>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reports Over Time */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-base font-semibold text-gray-900 mb-4">Reports Submitted Over Time</h4>
            <div className="space-y-3">
              {reportsData.map((item, index) => {
                const maxCount = Math.max(...reportsData.map((d) => d.count));
                const percentage = (item.count / maxCount) * 100;
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reports by Priority */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-base font-semibold text-gray-900 mb-4">Reports by Priority</h4>
            <div className="space-y-3">
              {[
                { label: 'Critical', value: 1, color: 'bg-red-500' },
                { label: 'High', value: 2, color: 'bg-orange-500' },
                { label: 'Medium', value: 1, color: 'bg-blue-500' },
                { label: 'Low', value: 1, color: 'bg-gray-500' },
              ].map((item) => {
                const total = 5;
                const percentage = ((item.value / total) * 100).toFixed(1);
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {item.value} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`${item.color} h-2.5 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reports by Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-base font-semibold text-gray-900 mb-4">Reports by Status</h4>
            <div className="space-y-3">
              {[
                { label: 'Resolved', value: resolvedReports, total: totalReports, color: 'bg-green-500' },
                { label: 'In Progress', value: inProgressReports, total: totalReports, color: 'bg-purple-500' },
                { label: 'Under Review', value: newReports, total: totalReports, color: 'bg-orange-500' },
              ].map((item) => {
                const percentage = ((item.value / item.total) * 100).toFixed(1);
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {item.value} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`${item.color} h-2.5 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trend Analysis */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Trend Analysis
            </h4>
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-green-600 mb-1">Resolution Rate</p>
                <p className="text-2xl font-bold text-green-900">
                  {Math.round((resolvedReports / totalReports) * 100)}%
                </p>
                <p className="text-xs text-green-700 mt-1">↑ 5% from last period</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-blue-600 mb-1">Avg. Response Time</p>
                <p className="text-2xl font-bold text-blue-900">2.8 days</p>
                <p className="text-xs text-blue-700 mt-1">↓ 12% faster than last period</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterPanel
        search={search}
        onSearchChange={setSearch}
        showAdvanced={showFilters}
        onToggleAdvanced={setShowFilters}
        filters={[
          {
            type: 'select',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { value: 'all', label: 'All Categories' },
              ...mockCategories.map((cat) => ({ value: cat.id, label: cat.name })),
            ],
          },
          {
            type: 'select',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'All Status' },
              { value: 'under_review', label: 'Under Review' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'resolved', label: 'Resolved' },
            ],
          },
          {
            type: 'select',
            value: institutionFilter,
            onChange: setInstitutionFilter,
            options: [
              { value: 'all', label: 'All Institutions' },
              ...mockInstitutions.map((inst) => ({ value: inst.id, label: inst.name })),
            ],
          },
          {
            type: 'select',
            value: priorityFilter,
            onChange: setPriorityFilter,
            options: [
              { value: 'all', label: 'All Priorities' },
              { value: 'critical', label: 'Critical' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ],
          },
        ]}
      />

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredReports.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{totalReports}</span> reports
          </p>
        </div>
        {filteredReports.length === 0 ? (
          <EmptyState
            icon={<Search className="w-12 h-12" />}
            title="No reports found"
            description="Try adjusting your search or filters"
          />
        ) : (
          <DataTable columns={columns} data={filteredReports} />
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedReport(null);
          }}
          title={`Report ${selectedReport.id}`}
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Report Details</h4>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Title</p>
                  <p className="text-sm font-medium text-gray-900">{selectedReport.title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="text-sm text-gray-900">{selectedReport.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm text-gray-900">{selectedReport.location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Assigned Institution</p>
                  <p className="text-sm text-gray-900">{selectedReport.institution}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Priority</p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      selectedReport.priority === 'critical'
                        ? 'bg-red-100 text-red-800'
                        : selectedReport.priority === 'high'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {selectedReport.priority}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <StatusBadge status={selectedReport.status} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Submitted</p>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedReport.submittedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedReport.lastUpdate).toLocaleString()}
                  </p>
                </div>
                {selectedReport.resolutionTime && (
                  <div>
                    <p className="text-xs text-gray-500">Resolution Time</p>
                    <p className="text-sm font-medium text-green-700">{selectedReport.resolutionTime}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-[#1a6b3c] rounded-lg hover:bg-[#145230]"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
