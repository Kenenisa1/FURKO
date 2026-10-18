import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  FilePlus,
  Clock,
  CheckCircle2,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import StatCard from '../../../components/admin/dashboard/StatCard.jsx';
import ActivityTimeline from '../../../components/admin/dashboard/ActivityTimeline.jsx';
import MockDataBanner from '../../../components/admin/ui/MockDataBanner.jsx';
import {
  mockDashboardStats,
  mockRecentActivity,
  mockFallbackQueue,
  mockReportsOverTime,
  mockInstitutionalPerformance,
} from '../../../data/mockAdminData.js';
import adminApi from '../../../services/admin/adminApiClient.js';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('7days');

  const [stats, setStats] = useState(mockDashboardStats);
  const [recentActivity, setRecentActivity] = useState(mockRecentActivity);
  const [fallbackQueue, setFallbackQueue] = useState(mockFallbackQueue);
  const [reportsData, setReportsData] = useState(mockReportsOverTime);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate current date string
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    let mounted = true;
    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        // Backend expected to return an object:
        // { stats: {...}, recentActivity: [...], fallbackQueue: [...], reportsOverTime: {...} }
        const resp = await adminApi.get('/admin/dashboard');
        const payload = resp.data?.data || resp.data || {};
        if (!mounted) return;
        if (payload.stats) setStats(payload.stats);
        if (payload.recentActivity) setRecentActivity(payload.recentActivity);
        if (payload.fallbackQueue) setFallbackQueue(payload.fallbackQueue);
        if (payload.reportsOverTime) setReportsData(payload.reportsOverTime);
      } catch (err) {
        // Keep mock data and set an error flag so UI can show deprecation notice
        console.warn('Failed to load admin dashboard from backend, using mock data:', err);
        setError('Unable to load live dashboard — showing mock preview.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const fallbackPending = (fallbackQueue || []).filter((q) => q.reviewStatus === 'pending').length;
  const currentReportsData = reportsData[dateRange] || [];

  return (
    <div className="space-y-6">
      {/* If backend is not available, keep mock banner */}
      <MockDataBanner />

      {/* Possibly show a brief loading state */}
      {loading && (
        <div className="p-4 text-sm text-gray-600">Loading dashboard…</div>
      )}
      {error && (
        <div className="p-3 text-sm text-yellow-800 bg-yellow-50 rounded-md border border-yellow-100">
          {error}
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#1a5c35] to-[#1a6b3c] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Welcome back, Admin</h2>
            <p className="text-white/80 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {currentDate}
            </p>
            <p className="text-white/90 mt-3">
              The FURKO platform is operating normally. {stats.totalReports?.toLocaleString?.() ?? '—'} total reports managed across {stats.activeInstitutions ?? '—'} institutions.
            </p>
          </div>
          <div className="hidden lg:block">
            <TrendingUp className="w-24 h-24 text-white/20" />
          </div>
        </div>
      </div>

      {/* Platform Statistics - First Row */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            label="Total Reports"
            value={(stats.totalReports || 0).toLocaleString()}
            trend="up"
            trendValue={stats.totalTrend ?? '+0%'}
            color="blue"
          />
          <StatCard
            icon={<FilePlus className="w-6 h-6" />}
            label="New Reports"
            value={stats.newReports ?? 0}
            subtitle="Awaiting institutional review"
            color="orange"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="In Progress"
            value={stats.inProgressReports ?? 0}
            subtitle="Active work in institutions"
            color="purple"
          />
          <StatCard
            icon={<CheckCircle2 className="w-6 h-6" />}
            label="Resolved"
            value={(stats.resolvedReports || 0).toLocaleString()}
            trend="up"
            trendValue={stats.resolvedTrend ?? '+0%'}
            color="green"
          />
        </div>
      </div>

      {/* Second row and other UI remain unchanged, using state variables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <ActivityTimeline items={recentActivity} />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fallback Queue</h3>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-700">Pending items: <strong>{fallbackPending}</strong></p>
            {/* You can add a small preview or list here */}
          </div>
        </div>
      </div>
    </div>
  );
}