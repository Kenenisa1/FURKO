import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { REPORT_STATUS, PRIORITY } from '../../data/mockReports.js';
import SummaryCard from '../../components/ui/SummaryCard.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import PriorityBadge from '../../components/ui/PriorityBadge.jsx';
import { useMemo } from 'react';
import { 
  FileText, 
  FilePlus, 
  Clock3, 
  ClipboardCheck, 
  CircleCheck, 
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export default function DashboardPage() {
  const { reports, reportsLoading, currentUser } = useApp();
  const navigate = useNavigate();

  const counts = useMemo(() => ({
    total:       reports.length,
    new:         reports.filter((r) => r.status === REPORT_STATUS.NEW).length,
    inProgress:  reports.filter((r) => r.status === REPORT_STATUS.IN_PROGRESS).length,
    underReview: reports.filter((r) => r.status === REPORT_STATUS.UNDER_REVIEW).length,
    resolved:    reports.filter((r) => r.status === REPORT_STATUS.RESOLVED).length,
    highPriority: reports.filter((r) => r.priority === PRIORITY.HIGH || r.priority === PRIORITY.CRITICAL).length,
  }), [reports]);

  const recentReports = useMemo(() => 
    [...reports]
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 5),
    [reports]
  );

  const urgentReports = useMemo(() =>
    reports.filter((r) => 
      (r.priority === PRIORITY.HIGH || r.priority === PRIORITY.CRITICAL) &&
      r.status !== REPORT_STATUS.RESOLVED
    ).slice(0, 3),
    [reports]
  );

  function timeAgo(isoString) {
    if (!isoString) return '—';
    const diff = Date.now() - new Date(isoString).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  if (reportsLoading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {currentUser?.name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here's what's happening with your institution's reports today.
        </p>
      </div>

      {/* Summary cards */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Report Overview</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <SummaryCard
            icon={<FileText className="w-6 h-6" />}
            label="Total Reports"
            count={counts.total}
            color="blue"
            onClick={() => navigate('/reports')}
          />
          <SummaryCard
            icon={<FilePlus className="w-6 h-6" />}
            label="New"
            count={counts.new}
            color="red"
            onClick={() => navigate('/reports/inbox')}
          />
          <SummaryCard
            icon={<Clock3 className="w-6 h-6" />}
            label="In Progress"
            count={counts.inProgress}
            color="orange"
            onClick={() => navigate('/reports?status=in-progress')}
          />
          <SummaryCard
            icon={<ClipboardCheck className="w-6 h-6" />}
            label="Under Review"
            count={counts.underReview}
            color="yellow"
            onClick={() => navigate('/reports?status=under-review')}
          />
          <SummaryCard
            icon={<CircleCheck className="w-6 h-6" />}
            label="Resolved"
            count={counts.resolved}
            color="green"
            onClick={() => navigate('/reports?status=resolved')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Recent and Urgent */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Urgent/High Priority Reports */}
          {urgentReports.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h2 className="text-base font-semibold text-gray-900">Priority Reports</h2>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                    {counts.highPriority}
                  </span>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {urgentReports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => navigate(`/reports/${report.id}`)}
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-semibold text-[#1a6b3c]">{report.id}</span>
                          <PriorityBadge priority={report.priority} />
                          <StatusBadge status={report.status} />
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate">{report.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {report.location?.kebele}, {report.location?.city} · {timeAgo(report.submittedAt)}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Reports */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Recent Reports</h2>
              <button
                onClick={() => navigate('/reports')}
                className="text-sm text-[#1a6b3c] hover:underline font-medium"
              >
                View all
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => navigate(`/reports/${report.id}`)}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-semibold text-[#1a6b3c]">{report.id}</span>
                        <StatusBadge status={report.status} />
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">{report.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {report.category} · {report.location?.kebele} · {timeAgo(report.submittedAt)}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Quick Actions & Stats */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/reports/inbox')}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#1a6b3c] hover:bg-[#145230] text-white rounded-lg transition-colors"
              >
                <span className="text-sm font-semibold">Go to Inbox</span>
                {counts.new > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full">
                    {counts.new}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/reports')}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
              >
                <span className="text-sm font-semibold">All Reports</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/staff')}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
              >
                <span className="text-sm font-semibold">Manage Staff</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Report Status Summary */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#1a6b3c]" />
              <h2 className="text-base font-semibold text-gray-900">Status Breakdown</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${counts.total > 0 ? (counts.new / counts.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8 text-right">{counts.new}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Under Review</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${counts.total > 0 ? (counts.underReview / counts.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8 text-right">{counts.underReview}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">In Progress</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${counts.total > 0 ? (counts.inProgress / counts.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8 text-right">{counts.inProgress}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Resolved</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${counts.total > 0 ? (counts.resolved / counts.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8 text-right">{counts.resolved}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Institution Info */}
          <div className="bg-[#e8f5ee] rounded-2xl border border-[#1a6b3c]/20 p-6">
            <h3 className="text-sm font-semibold text-[#1a6b3c] mb-2">Your Institution</h3>
            <p className="text-sm font-medium text-gray-800">{currentUser?.institution}</p>
            <p className="text-xs text-gray-600 mt-1">{currentUser?.role}</p>
            <button
              onClick={() => navigate('/profile')}
              className="mt-3 text-xs text-[#1a6b3c] hover:underline font-medium"
            >
              View Profile →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
