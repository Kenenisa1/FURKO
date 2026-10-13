import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Power, PowerOff, CheckCircle, FolderTree, Eye, AlertTriangle } from 'lucide-react';
import DataTable from '../../../components/admin/tables/DataTable.jsx';
import LoadingSpinner from '../../../components/ui/LoadingSpinner.jsx';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import ConfirmationModal from '../../../components/ui/ConfirmationModal.jsx';
import SummaryCards from '../../../components/admin/ui/SummaryCards.jsx';
import FilterPanel from '../../../components/admin/ui/FilterPanel.jsx';
import CategoryFormModal from './CategoryFormModal.jsx';
import {
  getCategories,
  toggleCategoryStatus,
  deleteCategory,
} from '../../../services/admin/categoriesApi.js';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Calculate summary stats
  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.status === 'active').length;
  const inactiveCategories = categories.filter((c) => c.status === 'inactive').length;
  const categoriesWithoutRules = categories.filter((c) => c.routingRules === 0).length;

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, search, statusFilter]);

  // Auto-dismiss success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  async function loadCategories() {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } finally {
      setLoading(false);
    }
  }

  function filterCategories() {
    let filtered = [...categories];
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((c) => c.name.toLowerCase().includes(searchLower));
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }
    setFilteredCategories(filtered);
  }

  async function handleToggleStatus(category) {
    setActionLoading(true);
    try {
      const updated = await toggleCategoryStatus(category.id);
      setCategories((prev) => prev.map((c) => (c.id === category.id ? updated : c)));
      setSuccessMessage(
        `Category "${category.name}" ${updated.status === 'active' ? 'activated' : 'deactivated'} successfully`
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedCategory) return;
    setActionLoading(true);
    try {
      await deleteCategory(selectedCategory.id);
      setCategories((prev) => prev.filter((c) => c.id !== selectedCategory.id));
      setSuccessMessage(`Category "${selectedCategory.name}" deleted successfully`);
      setShowDeleteModal(false);
      setSelectedCategory(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  const columns = [
    {
      key: 'icon',
      label: 'Icon',
      render: (cat) => <span className="text-2xl">{cat.icon}</span>,
    },
    {
      key: 'name',
      label: 'Category',
      render: (cat) => (
        <div>
          <p className="font-medium text-gray-900">{cat.name}</p>
          <p className="text-xs text-gray-500 line-clamp-1">{cat.description}</p>
        </div>
      ),
    },
    {
      key: 'usage',
      label: 'Usage',
      render: (cat) => (
        <div className="text-sm">
          <div className="text-gray-900">
            {cat.totalReports || 0} <span className="text-gray-500 text-xs">reports</span>
          </div>
          {cat.activeReports > 0 && (
            <div className="text-xs text-orange-600">{cat.activeReports} active</div>
          )}
        </div>
      ),
    },
    {
      key: 'routingRules',
      label: 'Routing Rules',
      render: (cat) => (
        <span className={`font-semibold ${cat.routingRules === 0 ? 'text-red-600' : 'text-gray-900'}`}>
          {cat.routingRules}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (cat) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            cat.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {cat.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (cat) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedCategory(cat);
              setShowFormModal(true);
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit category"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(cat)}
            disabled={actionLoading}
            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors disabled:opacity-50"
            title={cat.status === 'active' ? 'Deactivate' : 'Activate'}
          >
            {cat.status === 'active' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              setSelectedCategory(cat);
              setShowDeleteModal(true);
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Problem Categories</h2>
          <p className="text-gray-600 mt-1">Manage problem categories for report classification</p>
        </div>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setShowFormModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a6b3c] text-white rounded-lg hover:bg-[#145230] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        cards={[
          {
            label: 'Total Categories',
            value: totalCategories,
            subtitle: `${activeCategories} active, ${inactiveCategories} inactive`,
            icon: <FolderTree className="w-6 h-6" />,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
          },
          {
            label: 'Active Categories',
            value: activeCategories,
            subtitle: 'Available for reports',
            icon: <CheckCircle className="w-6 h-6" />,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
          },
          {
            label: 'Without Routing',
            value: categoriesWithoutRules,
            subtitle: 'Need routing rules',
            icon: <AlertTriangle className="w-6 h-6" />,
            iconBg: categoriesWithoutRules > 0 ? 'bg-red-100' : 'bg-gray-100',
            iconColor: categoriesWithoutRules > 0 ? 'text-red-600' : 'text-gray-600',
          },
          {
            label: 'Total Reports',
            value: categories.reduce((sum, c) => sum + (c.totalReports || 0), 0),
            subtitle: 'Across all categories',
            icon: <Eye className="w-6 h-6" />,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
          },
        ]}
      />

      {/* Alert if categories without routing rules */}
      {categoriesWithoutRules > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-900">
              {categoriesWithoutRules} categor{categoriesWithoutRules === 1 ? 'y' : 'ies'} without routing rules
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Reports in these categories will be sent to the fallback queue. Add routing rules to enable automatic routing.
            </p>
          </div>
        </div>
      )}

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
        ]}
      />

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredCategories.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{totalCategories}</span> categories
          </p>
        </div>
        {filteredCategories.length === 0 ? (
          <EmptyState
            icon={<Search className="w-12 h-12" />}
            title="No categories found"
            description="Try adjusting your search"
          />
        ) : (
          <DataTable columns={columns} data={filteredCategories} />
        )}
      </div>

      {showFormModal && (
        <CategoryFormModal
          category={selectedCategory}
          onClose={() => {
            setShowFormModal(false);
            setSelectedCategory(null);
          }}
          onSuccess={(updated) => {
            if (selectedCategory) {
              setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
              setSuccessMessage(`Category "${updated.name}" updated successfully`);
            } else {
              setCategories((prev) => [...prev, updated]);
              setSuccessMessage(`Category "${updated.name}" created successfully`);
            }
            setShowFormModal(false);
            setSelectedCategory(null);
          }}
        />
      )}

      {showDeleteModal && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          title="Delete Category"
          message={
            selectedCategory?.routingRules > 0
              ? `Delete "${selectedCategory?.name}"? This category is currently used by ${selectedCategory?.routingRules} routing rule${selectedCategory?.routingRules === 1 ? '' : 's'}. Deleting it may affect report routing and existing reports. Consider deactivating instead.`
              : `Are you sure you want to delete "${selectedCategory?.name}"? This action cannot be undone.`
          }
          confirmText="Delete"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedCategory(null);
          }}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
