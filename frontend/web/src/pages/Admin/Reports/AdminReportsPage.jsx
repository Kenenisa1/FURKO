import { useState } from 'react';
import { Search } from 'lucide-react';
import DataTable from '../../../components/admin/tables/DataTable.jsx';
import StatusBadge from '../../../components/ui/StatusBadge.jsx';
import { mockAdminReports } from '../../../data/mockAdminData.js';

export default function AdminReportsPage() {
  const [reports] = useState(mockAdminReports);
  const [search, setSearch] = useState('');

  const filteredReports = reports.filter(
    (r) =>
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'id',
      label: 'Report ID',
      render: (r) => <span className="font-mono text-sm">{r.id}</span>,
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
    { key: 'location', label: 'Location' },
    { key: 'institution', label: 'Institution' },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'submittedAt',
      label: 'Submitted',
      render: (r) => new Date(r.submittedAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports & Monitoring</h2>
        <p className="text-gray-600 mt-1">Platform-wide report oversight and monitoring</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports by ID or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <DataTable columns={columns} data={filteredReports} emptyMessage="No reports found" />
      </div>
    </div>
  );
}
