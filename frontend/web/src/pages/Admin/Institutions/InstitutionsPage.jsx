import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Power, PowerOff, Eye, Building2, CheckCircle, Clock, Users, TrendingUp, MapPin, X } from 'lucide-react';
import DataTable from '../../../components/admin/tables/DataTable.jsx';
import LoadingSpinner from '../../../components/ui/LoadingSpinner.jsx';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import ConfirmationModal from '../../../components/ui/ConfirmationModal.jsx';
import SummaryCards from '../../../components/admin/ui/SummaryCards.jsx';
import FilterPanel from '../../../components/admin/ui/FilterPanel.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import InstitutionFormModal from './InstitutionFormModal.jsx';
import {
  getInstitutions,
  toggleInstitutionStatus,
  deleteInstitution,
} from '../../../services/admin/institutionsApi.js';

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadInstitutions();
  }, []);

  useEffect(() => {
    filterInstitutions();
  }, [institutions, search, statusFilter, typeFilter]);

  async function loadInstitutions() {
    setLoading(true);
    try {
      const data = await getInstitutions();
      setInstitutions(data);
    } finally {
      setLoading(false);
    }
  }

  function filterInstitutions() {
    let filtered = [...institutions];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(searchLower) ||
          i.type.toLowerCase().includes(searchLower) ||
          (i.contactPerson && i.contactPerson.toLowerCase().includes(searchLower))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((i) => i.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((i) => i.type === typeFilter);
    }

    setFilteredInstitutions(filtered);
  }

  // Calculate summary stats
  const totalInstitutions = institutions.length;
  const activeInstitutions = institutions.filter((i) => i.status === 'active').length;
  const inactiveInstitutions = institutions.filter((i) => i.status === 'inactive').length;
  const institutionsWithPending = institutions.filter((i) => i.newReports && i.newReports > 0).length;
  const totalStaff = institutions.reduce((sum, i) => sum + (i.staffCount || 0), 0);
  const totalAssignedReports = institutions.reduce((sum, i) => sum + (i.assignedReports || 0), 0);

  function handleViewDetails(institution) {
    setSelectedInstitution(institution);
    setActiveTab('overview');
    setShowDetailModal(true);
  }

  async function handleToggleStatus(institution) {
    setActionLoading(true);
    try {
      const updated = await toggleInstitutionStatus(institution.id);
      setInstitutions((prev) => prev.map((i) => (i.id === institution.id ? updated : i)));
      setSuccessMessage(`Institution ${updated.status === 'active' ? 'activated' : 'deactivated'} successfully`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedInstitution) return;
    setActionLoading(true);
    try {
      await deleteInstitution(selectedInstitution.id);
      setInstitutions((prev) => prev.filter((i) => i.id !== selectedInstitution.id));
      setShowDeleteModal(false);
      setSelectedInstitution(null);
      setSuccessMessage('Institution deleted successfully');
      setTimeout(() => setSuccessMessage(''), 4000);
    } finally {
      setActionLoading(false);
    }
  }

  function handleEdit(institution) {
    setSelectedInstitution(institution);
    setShowFormModal(true);
  }

  function handleAdd() {
    setSelectedInstitution(null);
    setShowFormModal(true);
  }

  function handleFormSuccess(updatedInstitution) {
    if (selectedInstitution) {
      setInstitutions((prev) =>
        prev.map((i) => (i.id === updatedInstitution.id ? updatedInstitution : i))
      );
      setSuccessMessage('Institution updated successfully');
    } else {
      setInstitutions((prev) => [...prev, updatedInstitution]);
      setSuccessMessage('Institution created successfully');
    }
    setTimeout(() => setSuccessMessage(''), 4000);
    setShowFormModal(false);
    setSelectedInstitution(null);
  }

  const columns = [
    {
      key: 'name',
      label: 'Institution',
      render: (inst) => (
        <div>
          <p className="font-medium text-gray-900">{inst.name}</p>
          <p className="text-xs text-gray-500">{inst.type}</p>
          {inst.contactPerson && (
            <p className="text-xs text-gray-400 mt-0.5">Contact: {inst.contactPerson}</p>
          )}
        </div>
      ),
    },
    {
      key: 'serviceAreas',
      label: 'Service Areas',
      render: (inst) => (
        <div className="flex flex-wrap gap-1">
          {inst.serviceAreas.slice(0, 2).map((area) => (
            <span
              key={area}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
            >
              {area}
            </span>
          ))}
          {inst.serviceAreas.length > 2 && (
            <span className="text-xs text-gray-500">+{inst.serviceAreas.length - 2}</span>
          )}
        </div>
      ),
    },
    {
      key: 'staff',
      label: 'Staff',
      render: (inst) => (
        <span className="text-sm text-gray-900 font-medium">{inst.staffCount || 0}</span>
      ),
    },
    {
      key: 'reports',
      label: 'Reports',
      render: (inst) => (
        <div className="text-sm">
          <div className="font-semibold text-gray-900">{inst.assignedReports || 0}</div>
          {inst.newReports > 0 && (
            <div className="text-xs text-orange-600">+{inst.newReports} new</div>
          )}
        </div>
      ),
    },
    {
      key: 'performance',
      label: 'Avg. Time',
      render: (inst) => (
        <span className="text-sm text-gray-700">{inst.avgResolutionTime || '—'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (inst) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            inst.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {inst.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (inst) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(inst);
            }}
            className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-colors"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(inst);
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit institution"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(inst);
            }}
            disabled={actionLoading}
            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors disabled:opacity-50"
            title={inst.status === 'active' ? 'Deactivate' : 'Activate'}
          >
            {inst.status === 'active' ? (
              <PowerOff className="w-4 h-4" />
            ) : (
              <Power className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedInstitution(inst);
              setShowDeleteModal(true);
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete institution"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Institutions Management</h2>
          <p className="text-gray-600 mt-1">Manage civic service institutions and their assignments</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a6b3c] text-white rounded-lg hover:bg-[#145230] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Institution
        </button>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        cards={[
          {
            label: 'Total Institutions',
            value: totalInstitutions,
            subtitle: `${activeInstitutions} active, ${inactiveInstitutions} inactive`,
            icon: <Building2 className="w-6 h-6" />,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
          },
          {
            label: 'Active Institutions',
            value: activeInstitutions,
            subtitle: 'Currently operational',
            icon: <CheckCircle className="w-6 h-6" />,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
          },
          {
            label: 'With Pending Reports',
            value: institutionsWithPending,
            subtitle: 'Have new unreviewed reports',
            icon: <Clock className="w-6 h-6" />,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
          },
          {
            label: 'Total Staff',
            value: totalStaff,
            subtitle: `Across ${activeInstitutions} institutions`,
            icon: <Users className="w-6 h-6" />,
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
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ],
          },
          {
            type: 'select',
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { value: 'all', label: 'All Types' },
              { value: 'Government', label: 'Government' },
              { value: 'Public Utility', label: 'Public Utility' },
            ],
          },
        ]}
      />

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredInstitutions.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{totalInstitutions}</span> institutions
          </p>
        </div>
        {filteredInstitutions.length === 0 ? (
          <EmptyState
            icon={<Search className="w-12 h-12" />}
            title="No institutions found"
            description="Try adjusting your search or filters"
          />
        ) : (
          <DataTable columns={columns} data={filteredInstitutions} />
        )}
      </div>

      {/* Modals */}
      {showFormModal && (
        <InstitutionFormModal
          institution={selectedInstitution}
          onClose={() => {
            setShowFormModal(false);
            setSelectedInstitution(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {showDeleteModal && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          title="Delete Institution"
          message={`Are you sure you want to delete ${selectedInstitution?.name}? This may affect existing reports and routing rules.`}
          confirmText="Delete"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedInstitution(null);
          }}
          loading={actionLoading}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedInstitution && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedInstitution(null);
          }}
          title={selectedInstitution.name}
        >
          <div className="space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex gap-6">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'staff', label: 'Staff' },
                  { id: 'service-areas', label: 'Service Areas' },
                  { id: 'reports', label: 'Reports' },
                  { id: 'activity', label: 'Activity' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? 'border-[#1a6b3c] text-[#1a6b3c]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Institution Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Type</p>
                      <p className="text-sm font-medium text-gray-900">{selectedInstitution.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedInstitution.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {selectedInstitution.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Staff Count</p>
                      <p className="text-sm font-medium text-gray-900">{selectedInstitution.staffCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Avg. Resolution Time</p>
                      <p className="text-sm font-medium text-gray-900">{selectedInstitution.avgResolutionTime || '—'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    {selectedInstitution.contactPerson && (
                      <div>
                        <p className="text-xs text-gray-500">Contact Person</p>
                        <p className="text-sm text-gray-900">{selectedInstitution.contactPerson}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{selectedInstitution.contactEmail}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm text-gray-900">{selectedInstitution.contactPhone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm text-gray-900">{selectedInstitution.address}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Report Statistics</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-600 mb-1">Total Reports</p>
                      <p className="text-2xl font-bold text-blue-900">{selectedInstitution.assignedReports || 0}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-xs text-orange-600 mb-1">New Reports</p>
                      <p className="text-2xl font-bold text-orange-900">{selectedInstitution.newReports || 0}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-purple-600 mb-1">In Progress</p>
                      <p className="text-2xl font-bold text-purple-900">{selectedInstitution.inProgressReports || 0}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-green-600 mb-1">Resolved</p>
                      <p className="text-2xl font-bold text-green-900">{selectedInstitution.resolvedReports || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'staff' && (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  This institution has <span className="font-semibold">{selectedInstitution.staffCount || 0}</span> registered staff members.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Staff management is handled through the Users & Roles page. You can view and manage staff members assigned to this institution there.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'service-areas' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  This institution handles reports in the following service areas:
                </p>
                {selectedInstitution.serviceAreas && selectedInstitution.serviceAreas.length > 0 ? (
                  <div className="space-y-2">
                    {selectedInstitution.serviceAreas.map((area, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-[#1a6b3c] flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900">{area}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No service areas assigned</p>
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{selectedInstitution.assignedReports || 0}</p>
                    <p className="text-xs text-gray-600 mt-1">Total</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-900">{selectedInstitution.newReports || 0}</p>
                    <p className="text-xs text-orange-600 mt-1">New</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-900">{selectedInstitution.inProgressReports || 0}</p>
                    <p className="text-xs text-purple-600 mt-1">In Progress</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-900">{selectedInstitution.resolvedReports || 0}</p>
                    <p className="text-xs text-green-600 mt-1">Resolved</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900">Performance Metrics</p>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Resolution Rate</span>
                        <span className="font-semibold text-gray-900">
                          {selectedInstitution.assignedReports > 0
                            ? Math.round((selectedInstitution.resolvedReports / selectedInstitution.assignedReports) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${
                              selectedInstitution.assignedReports > 0
                                ? (selectedInstitution.resolvedReports / selectedInstitution.assignedReports) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-gray-500">Average Resolution Time</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedInstitution.avgResolutionTime || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                <p className="text-sm text-gray-600 mb-4">Recent administrative activity for this institution:</p>
                <div className="space-y-3">
                  {[
                    { action: 'Institution created', date: selectedInstitution.createdAt, actor: 'Admin User' },
                    { action: 'Contact information updated', date: '2026-10-08T13:45:00Z', actor: 'Admin User' },
                    { action: 'Service areas modified', date: '2026-09-20T10:30:00Z', actor: 'Admin User' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-[#1a6b3c] rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          By {activity.actor} · {new Date(activity.date).toLocaleDateString()} at{' '}
                          {new Date(activity.date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleEdit(selectedInstitution);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Edit Institution
              </button>
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
    </div>
  );
}
