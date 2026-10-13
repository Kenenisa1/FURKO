import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import Modal from '../../../components/ui/Modal.jsx';
import { createRoutingRule, updateRoutingRule } from '../../../services/admin/routingApi.js';
import { mockCategories, mockInstitutions } from '../../../data/mockAdminData.js';

export default function RuleFormModal({ rule, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    category: '',
    serviceArea: '',
    institutionId: '',
    institution: '',
    priority: 1,
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name || '',
        categoryId: rule.categoryId || '',
        category: rule.category || '',
        serviceArea: rule.serviceArea || '',
        institutionId: rule.institutionId || '',
        institution: rule.institution || '',
        priority: rule.priority || 1,
        status: rule.status || 'active',
      });
    }
  }, [rule]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'categoryId') {
      const cat = mockCategories.find((c) => c.id === value);
      setFormData((p) => ({ ...p, category: cat?.name || '' }));
    }
    if (field === 'institutionId') {
      const inst = mockInstitutions.find((i) => i.id === value);
      setFormData((p) => ({ ...p, institution: inst?.name || '' }));
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = rule
        ? await updateRoutingRule(rule.id, formData)
        : await createRoutingRule(formData);
      onSuccess(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {rule ? 'Edit Routing Rule' : 'Add Routing Rule'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
            >
              <option value="">Select Category</option>
              {mockCategories
                .filter((c) => c.status === 'active')
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Area *</label>
            <input
              type="text"
              required
              value={formData.serviceArea}
              onChange={(e) => handleChange('serviceArea', e.target.value)}
              placeholder="e.g., Central Business District"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Institution *</label>
            <select
              required
              value={formData.institutionId}
              onChange={(e) => handleChange('institutionId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
            >
              <option value="">Select Institution</option>
              {mockInstitutions
                .filter((i) => i.status === 'active')
                .map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Only active institutions are available for routing rules
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <input
              type="number"
              min="1"
              value={formData.priority}
              onChange={(e) => handleChange('priority', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
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
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#1a6b3c] text-white rounded-lg hover:bg-[#145230] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : rule ? (
                'Update'
              ) : (
                'Add'
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
