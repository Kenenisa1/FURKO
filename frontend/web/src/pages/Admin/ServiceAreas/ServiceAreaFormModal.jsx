import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import Modal from '../../../components/ui/Modal.jsx';

export default function ServiceAreaFormModal({ serviceArea, onClose, onSuccess }) {
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
    if (serviceArea) {
      setFormData({
        name: serviceArea.name || '',
        description: serviceArea.description || '',
        icon: serviceArea.icon || '📁',
        status: serviceArea.status || 'active',
      });
    }
  }, [serviceArea]);

  function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setNameError('Service area name is required');
      return;
    }

    setError('');
    setLoading(true);

    setTimeout(() => {
      const result = serviceArea
        ? { ...serviceArea, ...formData }
        : {
            id: `SA-${String(Date.now()).slice(-3)}`,
            ...formData,
            institutionsCount: 0,
            categoriesCount: 0,
          };
      
      onSuccess(result);
      setLoading(false);
    }, 400);
  }

  function handleNameChange(value) {
    setFormData((p) => ({ ...p, name: value }));
    setNameError('');
  }

  return (
    <Modal isOpen onClose={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {serviceArea ? 'Edit Service Area' : 'Add New Service Area'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Area Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
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
              placeholder="Brief description of this service area..."
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
            <p className="text-xs text-gray-500 mt-1">Use an emoji to represent this service area</p>
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
                ⚠️ Inactive service areas won't be available for institution selection
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
              ) : serviceArea ? (
                'Update Service Area'
              ) : (
                'Add Service Area'
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
