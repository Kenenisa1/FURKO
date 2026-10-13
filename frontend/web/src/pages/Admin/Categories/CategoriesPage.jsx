import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Power, PowerOff, CheckCircle } from 'lucide-react';
import DataTable from '../../../components/admin/tables/DataTable.jsx';
import LoadingSpinner from '../../../components/ui/LoadingSpinner.jsx';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import ConfirmationModal from '../../../components/ui/ConfirmationModal.jsx';
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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
          <p className="text-xs text-gray-500">{cat.description}</p>
        </div>
      ),
    },
    {
      key: 'routingRules',
      label: 'Routing Rules',
      render: (cat) => <span className="font-semibold text-gray-900">{cat.routingRules}</span>,
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
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(cat)}
            disabled={actionLoading}
            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors disabled:opacity-50"
          >
            {cat.status === 'active' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              setSelectedCategory(cat);
              setShowDeleteModal(true);
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
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
          <p className="text-gray-600 mt-1">{filteredCategories.length} categories total</p>
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

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
            />
          </div>
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
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
