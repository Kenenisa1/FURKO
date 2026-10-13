import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import DataTable from '../../../components/admin/tables/DataTable.jsx';
import { mockFallbackQueue } from '../../../data/mockAdminData.js';

export default function FallbackQueuePage() {
  const [queue] = useState(mockFallbackQueue);

  const columns = [
    {
      key: 'id',
      label: 'Report ID',
      render: (item) => <span className="font-mono text-sm">{item.id}</span>,
    },
    {
      key: 'title',
      label: 'Title',
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900">{item.title}</p>
          <p className="text-xs text-gray-500">{item.category}</p>
        </div>
      ),
    },
    { key: 'location', label: 'Location' },
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
      key: 'submittedAt',
      label: 'Submitted',
      render: (item) => new Date(item.submittedAt).toLocaleDateString(),
    },
    {
      key: 'reviewStatus',
      label: 'Status',
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.reviewStatus === 'pending'
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {item.reviewStatus === 'pending' ? 'Pending Review' : 'Under Review'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Fallback Review Queue</h2>
        <p className="text-gray-600 mt-1">
          Reports that require manual routing or administrative review
        </p>
      </div>

      {queue.filter((q) => q.reviewStatus === 'pending').length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-900">
              {queue.filter((q) => q.reviewStatus === 'pending').length} reports pending review
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              These reports could not be automatically routed and require administrative action.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <DataTable columns={columns} data={queue} emptyMessage="No reports in fallback queue" />
      </div>
    </div>
  );
}
