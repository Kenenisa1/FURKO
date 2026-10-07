import { useNavigate } from 'react-router-dom';
import StatusBadge from '../ui/StatusBadge.jsx';
import PriorityBadge from '../ui/PriorityBadge.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { Image } from 'lucide-react';

function timeAgo(isoString) {
  if (!isoString) return '—';
  const diff = Date.now() - new Date(isoString).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(isoString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function ReportTable({ reports }) {
  const navigate = useNavigate();

  if (!reports || reports.length === 0) {
    return (
      <EmptyState
        icon={<Image className="w-12 h-12" />}
        title="No reports found"
        description="No reports match the current filters. Try adjusting your search or filter criteria."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4 whitespace-nowrap">Report ID</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4">Report Details</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4 whitespace-nowrap">Location</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4 whitespace-nowrap">Submitted</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4 whitespace-nowrap">Priority</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4 whitespace-nowrap">Status</th>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4 whitespace-nowrap">Assigned To</th>
            <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4 whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr
              key={report.id}
              className="border-b border-gray-100 hover:bg-[#f5f9f6] transition-colors group"
            >
              {/* ID */}
              <td className="py-4 px-4 whitespace-nowrap">
                <span className="font-mono text-xs font-semibold text-[#1a6b3c]">{report.id}</span>
              </td>

              {/* Details with thumbnail */}
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  {report.photos?.[0] ? (
                    <img
                      src={report.photos[0]}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400">
                      <Image className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate max-w-[180px]">{report.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5 truncate max-w-[180px]">{report.description?.substring(0, 70)}...</p>
                    {report.photos?.length > 0 && (
                      <p className="text-gray-400 text-[10px] mt-0.5">{report.photos.length} photo{report.photos.length !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                </div>
              </td>

              {/* Location */}
              <td className="py-4 px-4">
                <p className="text-gray-700 text-xs font-medium">{report.location?.kebele}</p>
                <p className="text-gray-400 text-xs">{report.location?.city}</p>
              </td>

              {/* Submitted */}
              <td className="py-4 px-4 whitespace-nowrap">
                <p className="text-gray-700 text-xs">{timeAgo(report.submittedAt)}</p>
                <p className="text-gray-400 text-[10px]">
                  {formatDate(report.submittedAt)}
                </p>
              </td>

              {/* Priority */}
              <td className="py-4 px-4">
                <PriorityBadge priority={report.priority} />
              </td>

              {/* Status */}
              <td className="py-4 px-4">
                <StatusBadge status={report.status} />
              </td>

              {/* Assigned To */}
              <td className="py-4 px-4">
                {report.assignedTo ? (
                  <div>
                    <p className="text-gray-800 text-xs font-medium">{report.assignedTo}</p>
                    {report.department && (
                      <p className="text-gray-400 text-[10px]">{report.department}</p>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs">— Unassigned</span>
                )}
              </td>

              {/* Actions */}
              <td className="py-4 px-4 text-right">
                <button
                  onClick={() => navigate(`/reports/${report.id}`)}
                  className="px-4 py-1.5 bg-[#1a6b3c] text-white text-xs font-semibold rounded-lg hover:bg-[#145230] transition-colors"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
