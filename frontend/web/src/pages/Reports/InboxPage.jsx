import React, { useState, useEffect } from 'react';
import { Search, Filter, Inbox, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import ReportTable from '../../components/reports/ReportTable';
import FilterBar from '../../components/reports/FilterBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getReports } from '../../services/reportService';
import { REPORT_STATUS } from '../../data/mockReports';

const InboxPage = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all reports on mount
  useEffect(() => {
    setLoading(true);
    getReports()
      .then((data) => setAllReports(data))
      .catch((err) => console.error('Failed to load reports:', err))
      .finally(() => setLoading(false));
  }, []);

  // Group reports by status
  const reports = {
    new: allReports.filter(r => r.status === REPORT_STATUS.NEW),
    inProgress: allReports.filter(r => 
      r.status === REPORT_STATUS.IN_PROGRESS || 
      r.status === REPORT_STATUS.ASSIGNED ||
      r.status === REPORT_STATUS.UNDER_REVIEW ||
      r.status === REPORT_STATUS.ACCEPTED
    ),
    resolved: allReports.filter(r => r.status === REPORT_STATUS.RESOLVED)
  };

  const tabs = [
    { id: 'new', label: 'New Reports', icon: Inbox, count: reports.new.length },
    { id: 'inProgress', label: 'In Progress', icon: Clock, count: reports.inProgress.length },
    { id: 'resolved', label: 'Resolved', icon: CheckCircle, count: reports.resolved.length }
  ];

  const currentReports = reports[activeTab] || [];

  if (loading) {
    return <LoadingSpinner message="Loading inbox..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Report Inbox</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage and process citizen reports
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent w-80"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                  showFilters
                    ? 'bg-[#00A651] text-white border-[#00A651]'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          {showFilters && (
            <div className="mb-4">
              <FilterBar />
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#00A651] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? 'bg-white text-[#00A651]'
                      : 'bg-white text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow">
          {currentReports.length > 0 ? (
            <ReportTable reports={currentReports} showActions={true} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <AlertCircle className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No reports in this category</p>
              <p className="text-sm text-gray-400 mt-1">
                {activeTab === 'new' && 'New reports will appear here'}
                {activeTab === 'inProgress' && 'Reports being worked on will appear here'}
                {activeTab === 'resolved' && 'Completed reports will appear here'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
