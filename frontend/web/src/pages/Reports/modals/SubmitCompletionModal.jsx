import { useState } from 'react';
import Modal from '../../../components/ui/Modal.jsx';
import { submitCompletion } from '../../../services/reportService.js';
import { Loader2, SendHorizontal, Image as ImageIcon } from 'lucide-react';

export default function SubmitCompletionModal({ isOpen, onClose, report, onSubmitted }) {
  const [notes, setNotes] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!notes.trim()) {
      setError('Please provide completion notes detailing the work performed on-site.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await submitCompletion(report.id, {
        notes: notes.trim(),
        proofUrl: proofUrl.trim() || undefined,
      });
      onSubmitted();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!report) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Work for Completion Review"
      maxWidth="max-w-lg"
    >
      <div className="bg-[#f5f9f6] rounded-xl p-4 mb-4 border border-[#1a6b3c]/15">
        <p className="text-xs text-gray-500">Report</p>
        <p className="font-semibold text-gray-900">{report.title}</p>
        <p className="font-mono text-xs text-[#1a6b3c] mt-0.5">{report.tracking_number || report.id}</p>
      </div>

      <p className="text-xs text-gray-600 mb-4">
        As the assigned staff operative, submit your field resolution notes and photographic evidence.
        An Institution Super Admin will review your submission before authoritative closure.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Work Performed & Resolution Notes <span className="text-red-500">*</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Describe what repairs or civic actions were conducted (e.g. Asphalting completed, 4m trench refilled and paved)..."
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-gray-500" />
            Completion Evidence Photo URL (Optional)
          </label>
          <input
            type="url"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            placeholder="https://... (Cloudinary or public photo link)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
            {error}
          </p>
        )}
      </div>

      <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !notes.trim()}
          className="px-5 py-2 rounded-lg bg-[#1a6b3c] hover:bg-[#145230] text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2 shadow-sm"
        >
          {loading && <Loader2 className="animate-spin w-4 h-4" />}
          <SendHorizontal className="w-4 h-4" />
          Submit for Review
        </button>
      </div>
    </Modal>
  );
}
