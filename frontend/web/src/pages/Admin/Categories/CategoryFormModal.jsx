import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import Modal from '../../../components/ui/Modal.jsx';
import { createCategory, updateCategory, getCategories } from '../../../services/admin/categoriesApi.js';

export default function CategoryFormModal({ category, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📁',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        icon: category.icon || '📁',
        status: category.status || 'active',
      });
    }
  }, [category]);

  async function validateName(name) {
    if (!name.trim()) {
      setNameError('Category name is required');
      return false;
    }
    
    // Check for duplicate names (excluding current category if editing)
    try {
      const existingCategories = await getCategories();
      const duplicate = existingCategories.find(
        (c) => c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== category?.id
      );
      
      if (duplicate) {
        setNameError('A category with this name already exists');
        return false;
      }
      
      setNameError('');
      return true;
    } catch (err) {
      // If validation fails, allow submission and let backend handle it
      console.error('Name validation error:', err);
      setNameError('');
      return true;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    
    // Validate name
    const isNameValid = await validateName(formData.name);
    if (!isNameValid) return;
    
    setLoading(true);
    try {
      const result = category
        ? await updateCategory(category.id, formData)
        : await createCategory(formData);
      onSuccess(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleNameChange(value) {
    setFormData((p) => ({ ...p, name: value }));
    setNameError(''); // Clear error as user types
  }

  return (
    <Modal isOpen onClose={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {category ? 'Edit Category' : 'Add New Category'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={() => validateName(formData.name)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 ${
                nameError ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Water Supply"
            />
            {nameError && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                <AlertCircle className="w-3 h-3" />
                <span>{nameError}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
              placeholder="Brief description of this category..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData((p) => ({ ...p, icon: e.target.value }))}
              maxLength={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
              placeholder="📁"
            />
            <p className="text-xs text-gray-500 mt-1">Use an emoji to represent this category</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {formData.status === 'inactive' && (
              <p className="text-xs text-orange-600 mt-1">
                ⚠️ Inactive categories won't be available for new reports
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!nameError}
              className="flex-1 px-4 py-2 bg-[#1a6b3c] text-white rounded-lg hover:bg-[#145230] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : category ? (
                'Update Category'
              ) : (
                'Add Category'
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
