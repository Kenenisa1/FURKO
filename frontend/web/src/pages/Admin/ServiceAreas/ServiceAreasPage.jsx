import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, CheckCircle, Layers, MapPin, Building2 } from 'lucide-react';
import DataTable from '../../../components/admin/tables/DataTable.jsx';
import LoadingSpinner from '../../../components/ui/LoadingSpinner.jsx';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import ConfirmationModal from '../../../components/ui/ConfirmationModal.jsx';
import SummaryCards from '../../../components/admin/ui/SummaryCards.jsx';
import FilterPanel from '../../../components/admin/ui/FilterPanel.jsx';
import ServiceAreaFormModal from './ServiceAreaFormModal.jsx';

// Mock service areas data with usage tracking
const initialServiceAreas = [
  { id: 'SA-001', name: 'Roads & Streets', description: 'Road maintenance, potholes, street damage', icon: '🛣️', institutionsCount: 1, categoriesCount: 1, status: 'active' },
  { id: 'SA-002', name: 'Water Supply', description: 'Water distribution, pipe maintenance', icon: '💧', institutionsCount: 1, categoriesCount: 1, status: 'active' },
  { id: 'SA-003', name: 'Sewerage', description: 'Sewerage system maintenance', icon: '🚰', institutionsCount: 1, categoriesCount: 0, status: 'active' },
  { id: 'SA-004', name: 'Waste & Sanitation', description: 'Garbage collection, waste management', icon: '🗑️', institutionsCount: 1, categoriesCount: 1, status: 'active' },
  { id: 'SA-005', name: 'Drainage', description: 'Storm water drainage, flood prevention', icon: '🌊', institutionsCount: 1, categoriesCount: 1, status: 'active' },
  { id: 'SA-006', name: 'Street Lighting', description: 'Street light maintenance and installation', icon: '💡', institutionsCount: 1, categoriesCount: 1, status: 'active' },
  { id: 'SA-007', name: 'Parks & Green Spaces', description: 'Park maintenance, tree care', icon: '🌳', institutionsCount: 1, categoriesCount: 1, status: 'inactive' },
];

export default function ServiceAreasPage() {
  const [serviceAreas, setServiceAreas] = useState(initialServiceAreas);
  const [filteredAreas, setFilteredAreas] = useState(initialServiceAreas);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Calculate stats
  const totalAreas = serviceAreas.length;
  const activeAreas = serviceAreas.filter((a) => a.status === 'active').length;
  const inactiveAreas = serviceAreas.filter((a) => a.status === 'inactive').length;

  useEffect(() => {
    filterAreas();
  }, [serviceAreas, search, statusFilter]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  function filterAreas() {
    let filtered = [...serviceAreas];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(searchLower) ||
          a.description.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    setFilteredAreas(filtered);
  }

  function handleToggleStatus(area) {
    setActionLoading(true);
    setTimeout(() => {
      const newStatus = area.status === 'active' ? 'inactive' : 'active';
      setServiceAreas((prev) =>
        prev.map((a) => (a.id === area.id ? { ...a, status: newStatus } : a))
      );
      setSuccessMessage(
        `Service area "${area.name}" ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`
      );
      setActionLoading(false);
    }, 300);
  }

  function handleDelete() {
    if (!selectedArea) return;
    setActionLoading(true);
    setTimeout(() => {
      setServiceAreas((prev) => prev.filter((a) => a.id !== selectedArea.id));
      setSuccessMessage(`Service area "${selectedArea.name}" deleted successfully`);
      setShowDeleteModal(false);
      setSelectedArea(null);
      setActionLoading(false);
    }, 300);
  }

  function handleFormSuccess(updatedArea) {
    if (selectedArea) {
      setServiceAreas((prev) => prev.map((a) => (a.id === updatedArea.id ? updatedArea : a)));
      setSuccessMessage(`Service area "${updatedArea.name}" updated successfully`);
    } else {
      setServiceAreas((prev) => [...prev, updatedArea]);
      setSuccessMessage(`Service area "${updatedArea.name}" created successfully`);
    }
    setShowFormModal(false);
    setSelectedArea(null);
  }

  const columns = [
    {
      key: 'icon',
      label: 'Icon',
      render: (area) => <span className="text-2xl">{area.icon}</span>,
    },
    {
      key: 'name',
      label: 'Service Area',
      render: (area) => (
        <div>
          <p className="font-medium text-gray-900">{area.name}</p>
          <p className="text-xs text-gray-500">{area.description}</p>
        </div>
      ),
    },
    {
      key: 'usage',
      label: 'Usage',
      render: (area) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-600">Institutions:</span>
            <span className="font-semibold text-gray-900">{area.institutionsCount}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-600">Categories:</span>
            <span className="font-semibold text-gray-900">{area.categoriesCount}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (area) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            area.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {area.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (area) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedArea(area);
              setShowFormModal(true);
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit service area"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(area)}
            disabled={actionLoading}
            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors disabled:opacity-50"
            title={area.status === 'active' ? 'Deactivate' : 'Activate'}
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedArea(area);
              setShowDeleteModal(true);
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete service area"
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
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Service Areas</h2>
            <p className="text-gray-600 mt-1">
              Define geographic and functional service areas for institutions
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedArea(null);
              setShowFormModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a6b3c] text-white rounded-lg hover:bg-[#145230] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Service Area
          </button>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Service areas define the types of services institutions can handle. 
            Institutions select relevant service areas, and categories can be mapped to service areas for routing.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        cards={[
          {
            label: 'Total Service Areas',
            value: totalAreas,
            subtitle: `${activeAreas} active, ${inactiveAreas} inactive`,
            icon: <MapPin className="w-6 h-6" />,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
          },
          {
            label: 'Active Service Areas',
            value: activeAreas,
            subtitle: 'Available for assignment',
            icon: <CheckCircle className="w-6 h-6" />,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
          },
          {
            label: 'Assigned to Institutions',
            value: serviceAreas.reduce((sum, a) => sum + (a.institutionsCount || 0), 0),
            subtitle: 'Institution assignments',
            icon: <Building2 className="w-6 h-6" />,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
          },
          {
            label: 'With Categories',
            value: serviceAreas.filter((a) => a.categoriesCount > 0).length,
            subtitle: 'Mapped categories',
            icon: <Layers className="w-6 h-6" />,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
          },
        ]}
      />

      {/* Search and Filters */}
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
        ]}
      />

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredAreas.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{totalAreas}</span> service areas
          </p>
        </div>
        {filteredAreas.length === 0 ? (
          <EmptyState
            icon={<Search className="w-12 h-12" />}
            title="No service areas found"
            description="Try adjusting your search"
          />
        ) : (
          <DataTable columns={columns} data={filteredAreas} />
        )}
      </div>

      {/* Modals */}
      {showFormModal && (
        <ServiceAreaFormModal
          serviceArea={selectedArea}
          onClose={() => {
            setShowFormModal(false);
            setSelectedArea(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {showDeleteModal && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          title="Delete Service Area"
          message={
            selectedArea?.institutionsCount > 0 || selectedArea?.categoriesCount > 0
              ? `Delete "${selectedArea?.name}"? This service area is currently used by ${selectedArea?.institutionsCount} institution(s) and ${selectedArea?.categoriesCount} category/categories. Deleting it will remove it from those entities. Consider deactivating instead.`
              : `Are you sure you want to delete "${selectedArea?.name}"? This action cannot be undone.`
          }
          confirmText="Delete"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedArea(null);
          }}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
