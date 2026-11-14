import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function CategoryFormModal({ open, initial = {}, onClose, onSave, saving = false }) {
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    default_priority: 'medium',
    is_active: true,
    ...initial,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    setForm((f) => ({ ...f, ...initial }));
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, open]);

  if (!open) return null;

  const handleSubmit = async () => {
    setError('');
    if (!form.name || !form.slug) {
      setError('Name and slug are required.');
      return;
    }
    try {
      await onSave(form);
    } catch (err) {
      setError((err && err.message) || 'Save failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold">{initial && initial.id ? 'Edit Category' : 'Create Category'}</h3>
          <button onClick={onClose} className="p-1 rounded-md text-gray-500 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              value={form.name || ''}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
              placeholder="Roads & Streets"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              value={form.slug || ''}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
              placeholder="roads"
            />
            <p className="text-xs text-gray-400 mt-1">Machine slug used for routing rules (lowercase, no spaces).</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
              placeholder="Short description for internal use..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default priority</label>
              <select
                value={form.default_priority || 'medium'}
                onChange={(e) => setForm((f) => ({ ...f, default_priority: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!form.is_active}
                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Is active</span>
                </label>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm text-gray-700">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-[#1a6b3c] text-white text-sm hover:bg-[#15502a] disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}