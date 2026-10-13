import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Edit2, Trash2, Power, PowerOff } from 'lucide-react';
import DataTable from '../../../components/admin/tables/DataTable.jsx';
import LoadingSpinner from '../../../components/ui/LoadingSpinner.jsx';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import ConfirmationModal from '../../../components/ui/ConfirmationModal.jsx';
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
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadInstitutions();
  }, []);

  useEffect(() => {
    filterInstitutions();
  }, [institutions, search, statusFilter]);

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
          i.type.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((i) => i.status === statusFilter);
    }

    setFilteredInstitutions(filtered);
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
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (inst) => (
        <div>
          <p className="text-sm text-gray-900">{inst.contactEmail}</p>
          <p className="text-xs text-gray-500">{inst.contactPhone}</p>
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
            <span className="text-xs text-gray-500">+{inst.serviceAreas.length - 2} more</span>
          )}
        </div>
      ),
    },
    {
      key: 'assignedReports',
      label: 'Reports',
      render: (inst) => <span className="font-semibold text-gray-900">{inst.assignedReports}</span>,
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
          <p className="text-gray-600 mt-1">{filteredInstitutions.length} institutions total</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a6b3c] text-white rounded-lg hover:bg-[#145230] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Institution
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search institutions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-4 mt-4 pt-4 border-t border-gray-200">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
          message={`Are you sure you want to delete ${selectedInstitution?.name}? This may affect existing reports.`}
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
    </div>
  );
}
