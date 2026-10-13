import { useState, useEffect } from 'react';
import { Search, Download, FileSearch, CheckCircle, XCircle, Activity, User, Eye } from 'lucide-react';
import DataTable from '../../../components/admin/tables/DataTable.jsx';
import LoadingSpinner from '../../../components/ui/LoadingSpinner.jsx';
import SummaryCards from '../../../components/admin/ui/SummaryCards.jsx';
import FilterPanel from '../../../components/admin/ui/FilterPanel.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import { getAuditLog } from '../../../services/admin/auditApi.js';

export default function AuditLogPage() {
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadAuditLog();
  }, []);

  async function loadAuditLog() {
    setLoading(true);
    try {
      const data = await getAuditLog();
      setAuditLog(data);
    } finally {
      setLoading(false);
    }
  }

  const filteredLog = auditLog.filter((entry) => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (
        !entry.action.toLowerCase().includes(searchLower) &&
        !entry.actor.toLowerCase().includes(searchLower) &&
        !entry.description.toLowerCase().includes(searchLower) &&
        !(entry.entityName && entry.entityName.toLowerCase().includes(searchLower))
      ) {
        return false;
      }
    }
    if (eventTypeFilter !== 'all' && entry.entityType !== eventTypeFilter) return false;
    if (resultFilter !== 'all' && entry.result !== resultFilter) return false;
    return true;
  });

  // Calculate stats
  const totalEntries = auditLog.length;
  const successfulActions = auditLog.filter((e) => e.result === 'success').length;
  const failedActions = auditLog.filter((e) => e.result === 'failed').length;
  const uniqueActors = [...new Set(auditLog.map((e) => e.actor))].length;

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (entry) => (
        <div>
          <p className="text-sm text-gray-900">
            {new Date(entry.timestamp).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(entry.timestamp).toLocaleTimeString()}
          </p>
        </div>
      ),
    },
    {
      key: 'actor',
      label: 'Actor',
      render: (entry) => <span className="font-medium text-gray-900">{entry.actor}</span>,
    },
    {
      key: 'action',
      label: 'Action',
      render: (entry) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
          {entry.action}
        </span>
      ),
    },
    {
      key: 'entityType',
      label: 'Entity',
      render: (entry) => <span className="text-sm text-gray-600">{entry.entityType}</span>,
    },
    {
      key: 'description',
      label: 'Description',
      render: (entry) => (
        <div className="max-w-md">
          <span className="text-sm text-gray-700">{entry.description}</span>
          {entry.entityName && (
            <p className="text-xs text-gray-500 mt-0.5">Target: {entry.entityName}</p>
          )}
        </div>
      ),
    },
    {
      key: 'result',
      label: 'Result',
      render: (entry) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            entry.result === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {entry.result === 'success' ? 'Success' : 'Failed'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (entry) => (
        <button
          onClick={() => {
            setSelectedEntry(entry);
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

  if (loading)
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Log</h2>
          <p className="text-gray-600 mt-1">
            Complete record of administrative actions and system events
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          title="Export audit log"
        >
          <Download className="w-4 h-4" />
          Export Log
          <span className="text-xs text-gray-500 ml-1">(Backend required)</span>
        </button>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        cards={[
          {
            label: 'Total Entries',
            value: totalEntries,
            subtitle: 'Logged actions',
            icon: <Activity className="w-6 h-6" />,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
          },
          {
            label: 'Successful Actions',
            value: successfulActions,
            subtitle: 'Completed successfully',
            icon: <CheckCircle className="w-6 h-6" />,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
          },
          {
            label: 'Failed Actions',
            value: failedActions,
            subtitle: 'Encountered errors',
            icon: <XCircle className="w-6 h-6" />,
            iconBg: failedActions > 0 ? 'bg-red-100' : 'bg-gray-100',
            iconColor: failedActions > 0 ? 'text-red-600' : 'text-gray-600',
          },
          {
            label: 'Unique Actors',
            value: uniqueActors,
            subtitle: 'Active administrators',
            icon: <User className="w-6 h-6" />,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
          },
        ]}
      />

      {/* Filters */}
      <FilterPanel
        search={search}
        onSearchChange={setSearch}
        showAdvanced={showFilters}
        onToggleAdvanced={setShowFilters}
        filters={[
          {
            type: 'select',
            value: eventTypeFilter,
            onChange: setEventTypeFilter,
            options: [
              { value: 'all', label: 'All Types' },
              { value: 'User', label: 'User Actions' },
              { value: 'Institution', label: 'Institution Actions' },
              { value: 'Category', label: 'Category Actions' },
              { value: 'RoutingRule', label: 'Routing Rule Actions' },
              { value: 'Report', label: 'Report Actions' },
              { value: 'Settings', label: 'Settings Changes' },
            ],
          },
          {
            type: 'select',
            value: resultFilter,
            onChange: setResultFilter,
            options: [
              { value: 'all', label: 'All Results' },
              { value: 'success', label: 'Success' },
              { value: 'failed', label: 'Failed' },
            ],
          },
        ]}
      />

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredLog.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{totalEntries}</span> audit entries
          </p>
        </div>
        {filteredLog.length === 0 ? (
          <EmptyState
            icon={<FileSearch className="w-12 h-12" />}
            title="No audit entries found"
            description="Try adjusting your search or filters"
          />
        ) : (
          <DataTable columns={columns} data={filteredLog} />
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedEntry && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedEntry(null);
          }}
          title="Audit Entry Details"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Timestamp</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(selectedEntry.timestamp).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Actor</p>
                <p className="text-sm font-medium text-gray-900">{selectedEntry.actor}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Action</p>
                <p className="text-sm font-medium text-gray-900">{selectedEntry.action}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Entity Type</p>
                <p className="text-sm font-medium text-gray-900">{selectedEntry.entityType}</p>
              </div>
              {selectedEntry.entityName && (
                <div>
                  <p className="text-xs text-gray-500">Entity Name</p>
                  <p className="text-sm font-medium text-gray-900">{selectedEntry.entityName}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">Result</p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedEntry.result === 'success'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedEntry.result === 'success' ? 'Success' : 'Failed'}
                </span>
              </div>
              {selectedEntry.ipAddress && (
                <div>
                  <p className="text-xs text-gray-500">IP Address</p>
                  <p className="text-sm font-mono text-gray-900">{selectedEntry.ipAddress}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Description</p>
              <p className="text-sm text-gray-900">{selectedEntry.description}</p>
            </div>

            {selectedEntry.details && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Additional Details</p>
                <pre className="text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto">
                  {JSON.stringify(selectedEntry.details, null, 2)}
                </pre>
              </div>
            )}

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

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-600">
          Audit records are read-only and maintained for compliance and accountability. All
          administrative actions are automatically logged.
        </p>
      </div>
    </div>
  );
}
