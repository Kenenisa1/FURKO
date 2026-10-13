import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  FilePlus,
  Clock,
  CheckCircle2,
  Building2,
  Users,
  Inbox,
  TrendingUp,
  AlertCircle,
  UserCheck,
  Calendar,
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

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('7days');
  
  const fallbackPending = mockFallbackQueue.filter((q) => q.reviewStatus === 'pending').length;
  const reportsData = mockReportsOverTime[dateRange];

  // Calculate current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Mock Data Banner */}
      <MockDataBanner />

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
              The FURKO platform is operating normally. {mockDashboardStats.totalReports.toLocaleString()} total reports managed across {mockDashboardStats.activeInstitutions} institutions.
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
            value={mockDashboardStats.totalReports.toLocaleString()}
            trend="up"
            trendValue="+12%"
            color="blue"
          />
          <StatCard
            icon={<FilePlus className="w-6 h-6" />}
            label="New Reports"
            value={mockDashboardStats.newReports}
            subtitle="Awaiting institutional review"
            color="orange"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="In Progress"
            value={mockDashboardStats.inProgressReports}
            subtitle="Active work in institutions"
            color="purple"
          />
          <StatCard
            icon={<CheckCircle2 className="w-6 h-6" />}
            label="Resolved"
            value={mockDashboardStats.resolvedReports.toLocaleString()}
            trend="up"
            trendValue="+8%"
            color="green"
          />
        </div>
      </div>

      {/* Platform Statistics - Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Building2 className="w-6 h-6" />}
          label="Active Institutions"
          value={mockDashboardStats.activeInstitutions}
          subtitle={`${mockDashboardStats.inactiveInstitutions} inactive`}
          color="green"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Registered Users"
          value={mockDashboardStats.registeredUsers.toLocaleString()}
          trend="up"
          trendValue="+124"
          color="blue"
        />
        <StatCard
          icon={<UserCheck className="w-6 h-6" />}
          label="Active Staff"
          value={mockDashboardStats.staffUsers}
          subtitle={`${mockDashboardStats.citizenUsers.toLocaleString()} citizens`}
          color="purple"
        />
        <StatCard
          icon={<Inbox className="w-6 h-6" />}
          label="Fallback Queue"
          value={fallbackPending}
          subtitle={`${mockDashboardStats.fallbackQueue} total items`}
          color={fallbackPending > 0 ? 'red' : 'gray'}
        />
      </div>

      {/* Charts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Report Analytics</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Date Range:</label>
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
          {/* Reports Over Time Chart */}
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

          {/* Reports by Status Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-base font-semibold text-gray-900 mb-4">Reports by Status</h4>
            <div className="space-y-3">
              {[
                { label: 'Resolved', value: mockDashboardStats.resolvedReports, total: mockDashboardStats.totalReports, color: 'bg-green-500' },
                { label: 'Under Review', value: mockDashboardStats.underReviewReports, total: mockDashboardStats.totalReports, color: 'bg-blue-500' },
                { label: 'In Progress', value: mockDashboardStats.inProgressReports, total: mockDashboardStats.totalReports, color: 'bg-purple-500' },
                { label: 'New', value: mockDashboardStats.newReports, total: mockDashboardStats.totalReports, color: 'bg-orange-500' },
              ].map((item) => {
                const percentage = ((item.value / item.total) * 100).toFixed(1);
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {item.value.toLocaleString()} ({percentage}%)
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

          {/* Reports by Institution Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-base font-semibold text-gray-900 mb-4">Reports by Institution</h4>
            <div className="space-y-3">
              {mockInstitutionalPerformance.slice(0, 5).map((inst, index) => {
                const maxReports = Math.max(...mockInstitutionalPerformance.map((i) => i.totalReports));
                const percentage = (inst.totalReports / maxReports) * 100;
                const colors = ['bg-blue-500', 'bg-cyan-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
                return (
                  <div key={inst.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700 truncate">{inst.name}</span>
                      <span className="text-sm font-semibold text-gray-900">{inst.totalReports}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`${colors[index % colors.length]} h-2.5 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reports by Category Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-base font-semibold text-gray-900 mb-4">Top Problem Categories</h4>
            <div className="space-y-3">
              {[
                { label: 'Roads & Streets', value: 512, icon: '🛣️', color: 'bg-blue-500' },
                { label: 'Water & Sewerage', value: 324, icon: '💧', color: 'bg-cyan-500' },
                { label: 'Waste Management', value: 321, icon: '🗑️', color: 'bg-green-500' },
                { label: 'Drainage', value: 145, icon: '🌊', color: 'bg-purple-500' },
                { label: 'Street Lighting', value: 85, icon: '💡', color: 'bg-yellow-500' },
              ].map((item) => {
                const maxValue = 512;
                const percentage = (item.value / maxValue) * 100;
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <span>{item.icon}</span>
                        {item.label}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{item.value}</span>
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
        </div>
      </div>

      {/* Institutional Performance Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Institutional Performance</h3>
          <button
            onClick={() => navigate('/admin/institutions')}
            className="text-sm text-[#1a6b3c] hover:underline font-medium"
          >
            View All Institutions →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="pb-3 text-sm font-semibold text-gray-900">Institution</th>
                <th className="pb-3 text-sm font-semibold text-gray-900 text-center">Total</th>
                <th className="pb-3 text-sm font-semibold text-gray-900 text-center">New</th>
                <th className="pb-3 text-sm font-semibold text-gray-900 text-center">In Progress</th>
                <th className="pb-3 text-sm font-semibold text-gray-900 text-center">Resolved</th>
                <th className="pb-3 text-sm font-semibold text-gray-900 text-center">Avg. Time</th>
                <th className="pb-3 text-sm font-semibold text-gray-900 text-center">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockInstitutionalPerformance.map((inst) => (
                <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 text-sm text-gray-900 font-medium">{inst.name}</td>
                  <td className="py-3 text-sm text-gray-900 text-center">{inst.totalReports}</td>
                  <td className="py-3 text-sm text-orange-600 text-center font-semibold">{inst.newReports}</td>
                  <td className="py-3 text-sm text-purple-600 text-center font-semibold">{inst.inProgressReports}</td>
                  <td className="py-3 text-sm text-green-600 text-center font-semibold">{inst.resolvedReports}</td>
                  <td className="py-3 text-sm text-gray-900 text-center">{inst.avgResolutionTime}</td>
                  <td className="py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        inst.performance === 'excellent'
                          ? 'bg-green-100 text-green-800'
                          : inst.performance === 'good'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {inst.performance === 'excellent' && 'Excellent'}
                      {inst.performance === 'good' && 'Good'}
                      {inst.performance === 'needs_improvement' && 'Needs Improvement'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Platform Activity</h3>
            <button
              onClick={() => navigate('/admin/audit-log')}
              className="text-sm text-[#1a6b3c] hover:underline font-medium"
            >
              View All Activity →
            </button>
          </div>
          <ActivityTimeline activities={mockRecentActivity.slice(0, 8)} />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/admin/institutions')}
              className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-[#1a6b3c] hover:bg-[#f5f9f6] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-[#1a6b3c]" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Manage Institutions</p>
                  <p className="text-xs text-gray-500">Add or edit institutions</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/users')}
              className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-[#1a6b3c] hover:bg-[#f5f9f6] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#1a6b3c]" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Manage Users</p>
                  <p className="text-xs text-gray-500">User and role management</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/routing-rules')}
              className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-[#1a6b3c] hover:bg-[#f5f9f6] transition-colors"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-[#1a6b3c]" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Configure Routing</p>
                  <p className="text-xs text-gray-500">Routing rules setup</p>
                </div>
              </div>
            </button>

            {fallbackPending > 0 && (
              <button
                onClick={() => navigate('/admin/fallback-queue')}
                className="w-full text-left px-4 py-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">Review Fallback Queue</p>
                    <p className="text-xs text-red-600">{fallbackPending} pending review</p>
                  </div>
                </div>
              </button>
            )}

            <button
              onClick={() => navigate('/admin/audit-log')}
              className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-[#1a6b3c] hover:bg-[#f5f9f6] transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#1a6b3c]" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">View Audit Log</p>
                  <p className="text-xs text-gray-500">System activity tracking</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Average Resolution Time metric */}
      <div className="bg-gradient-to-r from-[#1a5c35] to-[#1a6b3c] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm mb-1">Average Resolution Time</p>
            <p className="text-4xl font-bold">{mockDashboardStats.avgResolutionTime}</p>
            <p className="text-white/70 text-sm mt-2">
              ↓ 15% faster than last month · Platform efficiency is improving
            </p>
          </div>
          <TrendingUp className="w-20 h-20 text-white/20" />
        </div>
      </div>
    </div>
  );
}
