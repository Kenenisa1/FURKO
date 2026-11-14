import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import Modal from '../../../components/ui/Modal.jsx';
import { createInstitution, updateInstitution } from '../../../services/admin/institutionsApi.js';
import { getActiveServiceAreas } from '../../../services/admin/serviceAreasApi.js';

export default function InstitutionFormModal({ institution, onClose, onSuccess }) {
  const [serviceAreas, setServiceAreas] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Government',
    contactEmail: '',
    contactPhone: '',
    address: '',
    serviceAreas: [],
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadServiceAreas();
  }, []);

  async function loadServiceAreas() {
    try {
      const areas = await getActiveServiceAreas();
      setServiceAreas(areas);
    } catch (err) {
      console.error('Failed to load service areas:', err);
      // Fallback to empty array
      setServiceAreas([]);
    }
  }

  useEffect(() => {
    if (institution) {
      setFormData({
        name: institution.name || '',
        type: institution.type || 'Government',
        contactEmail: institution.contactEmail || '',
        contactPhone: institution.contactPhone || '',
        address: institution.address || '',
        serviceAreas: institution.serviceAreas || [],
        status: institution.status || 'active',
      });
    }
  }, [institution]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleServiceArea = (area) => {
    setFormData((prev) => ({
      ...prev,
      serviceAreas: prev.serviceAreas.includes(area)
        ? prev.serviceAreas.filter((a) => a !== area)
        : [...prev.serviceAreas, area],
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (institution) {
        result = await updateInstitution(institution.id, formData);
      } else {
        result = await createInstitution(formData);
      }
      onSuccess(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">
            {institution ? 'Edit Institution' : 'Add New Institution'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
            >
              <option value="Government">Government</option>
              <option value="Public Utility">Public Utility</option>
              <option value="Municipal Service">Municipal Service</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
            <input
              type="email"
              required
              value={formData.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Areas *</label>
            <div className="grid grid-cols-2 gap-2">
              {serviceAreas.length === 0 ? (
                <p className="col-span-2 text-sm text-gray-500 italic">
                  No active service areas available. Please create some in Service Areas management first.
                </p>
              ) : (
                serviceAreas.map((area) => (
                  <label key={area} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.serviceAreas.includes(area)}
                      onChange={() => toggleServiceArea(area)}
                      className="w-4 h-4 rounded border-gray-300 text-[#1a6b3c] focus:ring-[#1a6b3c]"
                    />
                    <span className="text-sm text-gray-700">{area}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {formData.status === 'inactive' && (
              <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-xs text-orange-800">
                  <strong>⚠️ Warning:</strong> Inactive institutions will not be available for selection 
                  when citizens submit new reports. Existing reports assigned to this institution will 
                  remain unchanged. Consider this carefully before deactivating.
                </p>
              </div>
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
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#1a6b3c] text-white rounded-lg hover:bg-[#145230] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : institution ? (
                'Update Institution'
              ) : (
                'Add Institution'
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
