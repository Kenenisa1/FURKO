import { useState } from 'react';
import Modal from '../../../components/ui/Modal.jsx';
import { resolveReport } from '../../../services/reportService.js';
import { Camera, X, Loader2 } from 'lucide-react';

export default function ResolveModal({ isOpen, onClose, report, currentUser, onResolved }) {
  const [form, setForm] = useState({
    description: '',
    resolvedBy: currentUser?.name || '',
    resolvedDate: new Date().toISOString().split('T')[0],
  });
  const [previewPhotos, setPreviewPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handlePhotoChange(e) {
    const files = Array.from(e.target.files);
    const previews = files.map((f) => URL.createObjectURL(f));
    setPreviewPhotos((prev) => [...prev, ...previews]);
  }

  async function handleSubmit() {
    if (!form.description.trim()) {
      setError('Please provide a resolution description.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const updated = await resolveReport(report.id, {
        description: form.description,
        resolvedBy: form.resolvedBy || currentUser?.name || 'Institution Staff',
        photos: previewPhotos,
      });
      onResolved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!report) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mark as Resolved" maxWidth="max-w-lg">
      <p className="text-sm text-gray-600 mb-5">
        Provide details about how the issue was resolved.
      </p>

      <div className="space-y-4">
        {/* Resolution description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Resolution Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={4}
            placeholder="Describe what was done to resolve this report..."
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
          />
        </div>

        {/* Evidence photos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Resolution Evidence (photos)
          </label>
          <label className="flex flex-col items-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#1a6b3c]/40 hover:bg-[#f5f9f6] transition-colors">
            <Camera className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-500">Click to upload photos</span>
            <span className="text-xs text-gray-400">PNG, JPG up to 10MB each</span>
            <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
          </label>
          {previewPhotos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {previewPhotos.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPreviewPhotos((p) => p.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resolution date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Resolution Date
          </label>
          <input
            type="date"
            value={form.resolvedDate}
            onChange={(e) => setForm((f) => ({ ...f, resolvedDate: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">{error}</p>
        )}
      </div>

      <div className="flex gap-3 justify-end mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 className="animate-spin w-4 h-4" />}
          Mark as Resolved
        </button>
      </div>
    </Modal>
  );
}
