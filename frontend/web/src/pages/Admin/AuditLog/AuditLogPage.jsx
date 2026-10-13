import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import DataTable from '../../../components/admin/tables/DataTable.jsx';
import LoadingSpinner from '../../../components/ui/LoadingSpinner.jsx';
import { getAuditLog } from '../../../services/admin/auditApi.js';

export default function AuditLogPage() {
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const filteredLog = auditLog.filter(
    (entry) =>
      !search ||
      entry.action.toLowerCase().includes(search.toLowerCase()) ||
      entry.actor.toLowerCase().includes(search.toLowerCase())
  );

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
      render: (entry) => <span className="text-sm text-gray-700">{entry.description}</span>,
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
  ];

  if (loading)
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Audit Log</h2>
        <p className="text-gray-600 mt-1">
          Complete record of administrative actions and system events
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search audit log..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredLog}
          emptyMessage="No audit entries found"
        />
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-600">
          Audit records are read-only and maintained for compliance and accountability. All
          administrative actions are automatically logged.
        </p>
      </div>
    </div>
  );
}
