import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, FileText, Search, Eye, Send, CheckSquare, XSquare } from 'lucide-react';
import DataTable from '../../../components/admin/tables/DataTable.jsx';
import SummaryCards from '../../../components/admin/ui/SummaryCards.jsx';
import FilterPanel from '../../../components/admin/ui/FilterPanel.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import { mockFallbackQueue, mockInstitutions, mockCategories } from '../../../data/mockAdminData.js';

export default function FallbackQueuePage() {
  const [queue, setQueue] = useState(mockFallbackQueue);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [bulkSelected, setBulkSelected] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  const filteredQueue = queue.filter((item) => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (
        !item.title.toLowerCase().includes(searchLower) &&
        !item.location.toLowerCase().includes(searchLower) &&
        !item.id.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    if (categoryFilter !== 'all' && item.categoryId !== categoryFilter) return false;
    if (statusFilter !== 'all' && item.reviewStatus !== statusFilter) return false;
    if (ageFilter !== 'all') {
      const ageInDays = parseInt(item.age);
      if (ageFilter === '0-1' && ageInDays > 1) return false;
      if (ageFilter === '2-3' && (ageInDays < 2 || ageInDays > 3)) return false;
      if (ageFilter === '4+' && ageInDays < 4) return false;
    }
    return true;
  });

  // Calculate summary stats
  const totalQueue = queue.length;
  const pendingReview = queue.filter((q) => q.reviewStatus === 'pending').length;
  const underReview = queue.filter((q) => q.reviewStatus === 'under_review').length;
  const highPriority = queue.filter((q) => q.priority === 'high' || q.priority === 'critical').length;

  function handleReviewReport(report) {
    setSelectedReport(report);
    setSelectedInstitution(report.selectedInstitutionId || '');
    setReviewNotes('');
    setShowReviewModal(true);
  }

  function handleSubmitReview() {
    if (!selectedInstitution) {
      alert('Please select an institution');
      return;
    }

    // Simulate routing the report
    setTimeout(() => {
      setQueue((prev) => prev.filter((q) => q.id !== selectedReport.id));
      setSuccessMessage(
        `Report ${selectedReport.id} successfully routed to ${
          mockInstitutions.find((i) => i.id === selectedInstitution)?.name
        }`
      );
      setTimeout(() => setSuccessMessage(''), 4000);
      setShowReviewModal(false);
      setSelectedReport(null);
      setSelectedInstitution('');
      setReviewNotes('');
    }, 500);
  }

  function handleBulkSelect(reportId) {
    setBulkSelected((prev) =>
      prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]
    );
  }

  function handleSelectAll() {
    if (bulkSelected.length === filteredQueue.length) {
      setBulkSelected([]);
    } else {
      setBulkSelected(filteredQueue.map((q) => q.id));
    }
  }

  function handleBulkAction(action) {
    if (bulkSelected.length === 0) {
      alert('Please select at least one report');
      return;
    }

    if (action === 'mark-reviewed') {
      setQueue((prev) =>
        prev.map((q) => (bulkSelected.includes(q.id) ? { ...q, reviewStatus: 'under_review' } : q))
      );
      setSuccessMessage(`${bulkSelected.length} reports marked as under review`);
      setBulkSelected([]);
    } else if (action === 'remove') {
      if (confirm(`Remove ${bulkSelected.length} reports from the queue?`)) {
        setQueue((prev) => prev.filter((q) => !bulkSelected.includes(q.id)));
        setSuccessMessage(`${bulkSelected.length} reports removed from queue`);
        setBulkSelected([]);
      }
    }
    setTimeout(() => setSuccessMessage(''), 4000);
  }

  const columns = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={bulkSelected.length === filteredQueue.length && filteredQueue.length > 0}
          onChange={handleSelectAll}
          className="rounded border-gray-300 text-[#1a6b3c] focus:ring-[#1a6b3c]"
        />
      ),
      render: (item) => (
        <input
          type="checkbox"
          checked={bulkSelected.includes(item.id)}
          onChange={() => handleBulkSelect(item.id)}
          className="rounded border-gray-300 text-[#1a6b3c] focus:ring-[#1a6b3c]"
        />
      ),
    },
    {
      key: 'id',
      label: 'Report ID',
      render: (item) => <span className="font-mono text-sm font-medium text-gray-900">{item.id}</span>,
    },
    {
      key: 'title',
      label: 'Title',
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900">{item.title}</p>
          <p className="text-xs text-gray-500">{item.category}</p>
          <p className="text-xs text-gray-400 mt-0.5">by {item.submittedBy}</p>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (item) => <span className="text-sm text-gray-900">{item.location}</span>,
    },
    {
      key: 'reason',
      label: 'Review Reason',
      render: (item) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
          {item.reason}
        </span>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (item) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            item.priority === 'critical'
              ? 'bg-red-100 text-red-800'
              : item.priority === 'high'
              ? 'bg-orange-100 text-orange-800'
              : item.priority === 'medium'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {item.priority}
        </span>
      ),
    },
    {
      key: 'age',
      label: 'Age',
      render: (item) => (
        <span className="text-sm text-gray-700">{item.age}</span>
      ),
    },
    {
      key: 'reviewStatus',
      label: 'Status',
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.reviewStatus === 'pending' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
          }`}
        >
          {item.reviewStatus === 'pending' ? 'Pending' : 'Reviewing'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleReviewReport(item)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Review and route"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Fallback Review Queue</h2>
        <p className="text-gray-600 mt-1">
          Reports that require manual routing or administrative review
        </p>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        cards={[
          {
            label: 'Total in Queue',
            value: totalQueue,
            subtitle: 'Unrouted reports',
            icon: <FileText className="w-6 h-6" />,
            iconBg: 'bg-gray-100',
            iconColor: 'text-gray-600',
          },
          {
            label: 'Pending Review',
            value: pendingReview,
            subtitle: 'Awaiting action',
            icon: <Clock className="w-6 h-6" />,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
          },
          {
            label: 'Under Review',
            value: underReview,
            subtitle: 'Being processed',
            icon: <Eye className="w-6 h-6" />,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
          },
          {
            label: 'High Priority',
            value: highPriority,
            subtitle: 'Urgent attention needed',
            icon: <AlertCircle className="w-6 h-6" />,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
          },
        ]}
      />

      {/* Alert Banner */}
      {pendingReview > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-900">
              {pendingReview} report{pendingReview > 1 ? 's' : ''} pending review
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              These reports could not be automatically routed and require administrative action to assign them to an
              institution.
            </p>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {bulkSelected.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <p className="text-sm font-semibold text-blue-900">
              {bulkSelected.length} report{bulkSelected.length > 1 ? 's' : ''} selected
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('mark-reviewed')}
              className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50"
            >
              Mark as Reviewing
            </button>
            <button
              onClick={() => handleBulkAction('remove')}
              className="px-3 py-1.5 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50"
            >
              Remove from Queue
            </button>
            <button
              onClick={() => setBulkSelected([])}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
              { value: 'pending', label: 'Pending Review' },
              { value: 'under_review', label: 'Under Review' },
            ],
          },
          {
            type: 'select',
            value: ageFilter,
            onChange: setAgeFilter,
            options: [
              { value: 'all', label: 'All Ages' },
              { value: '0-1', label: '0-1 days' },
              { value: '2-3', label: '2-3 days' },
              { value: '4+', label: '4+ days' },
            ],
          },
        ]}
      />

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredQueue.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{totalQueue}</span> reports in fallback queue
          </p>
        </div>
        {filteredQueue.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">All Clear!</h3>
            <p className="text-sm text-gray-600">No reports in the fallback queue</p>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredQueue} />
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedReport && (
        <Modal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedReport(null);
            setSelectedInstitution('');
            setReviewNotes('');
          }}
          title="Review and Route Report"
        >
          <div className="space-y-6">
            {/* Report Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Report Details</h4>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Report ID</p>
                  <p className="text-sm font-mono font-medium text-gray-900">{selectedReport.id}</p>
                </div>
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
                  <p className="text-xs text-gray-500">Submitted By</p>
                  <p className="text-sm text-gray-900">{selectedReport.submittedBy}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Reason for Fallback</p>
                  <p className="text-sm text-yellow-800 bg-yellow-100 inline-block px-2 py-1 rounded">
                    {selectedReport.reason}
                  </p>
                </div>
              </div>
            </div>

            {/* Routing Decision */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Institution <span className="text-red-600">*</span>
              </label>
              <select
                value={selectedInstitution}
                onChange={(e) => setSelectedInstitution(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
              >
                <option value="">Select an institution...</option>
                {mockInstitutions
                  .filter((inst) => inst.status === 'active')
                  .map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.type})
                    </option>
                  ))}
              </select>
            </div>

            {/* Review Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Review Notes (Optional)</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                placeholder="Add any notes about why this routing decision was made..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedReport(null);
                  setSelectedInstitution('');
                  setReviewNotes('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={!selectedInstitution}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1a6b3c] rounded-lg hover:bg-[#145230] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Route to Institution
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
