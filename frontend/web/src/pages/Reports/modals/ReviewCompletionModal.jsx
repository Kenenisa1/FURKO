import { useState } from 'react';
import Modal from '../../../components/ui/Modal.jsx';
import { reviewCompletion } from '../../../services/reportService.js';
import { Loader2, CheckCircle2, RotateCcw } from 'lucide-react';

export default function ReviewCompletionModal({ isOpen, onClose, report, onReviewed }) {
  const [decision, setDecision] = useState('approve');
  const [comment, setComment] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (decision === 'return' && !comment.trim()) {
      setError('Please provide feedback explaining why the work is being returned for correction.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await reviewCompletion(report.id, {
        decision,
        comment: comment.trim() || undefined,
        resolutionNotes: resolutionNotes.trim() || undefined,
      });
      onReviewed();
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
      title="Completion Review & Verification"
      maxWidth="max-w-lg"
    >
      <div className="bg-[#f5f9f6] rounded-xl p-4 mb-4 border border-[#1a6b3c]/15">
        <p className="text-xs text-gray-500">Report</p>
        <p className="font-semibold text-gray-900">{report.title}</p>
        <p className="font-mono text-xs text-[#1a6b3c]">{report.tracking_number || report.id}</p>
        {report.resolution_notes && (
          <div className="mt-2 text-xs text-gray-700 bg-white p-2.5 rounded border border-gray-200">
            <span className="font-semibold text-gray-900">Staff Submission Note: </span>
            {report.resolution_notes}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Decision Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Review Decision</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDecision('approve')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                decision === 'approve'
                  ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/30'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${decision === 'approve' ? 'text-emerald-600' : 'text-gray-400'}`} />
              <div>
                <p className="text-xs font-bold">Approve & Resolve</p>
                <p className="text-[11px] text-gray-500">Mark report as authoritatively resolved.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDecision('return')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                decision === 'return'
                  ? 'border-amber-500 bg-amber-50/70 text-amber-900 ring-2 ring-amber-500/30'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <RotateCcw className={`w-5 h-5 flex-shrink-0 ${decision === 'return' ? 'text-amber-600' : 'text-gray-400'}`} />
              <div>
                <p className="text-xs font-bold">Return for Correction</p>
                <p className="text-[11px] text-gray-500">Send back to staff operative for rework.</p>
              </div>
            </button>
          </div>
        </div>

        {decision === 'approve' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Official Resolution Summary (Citizen Visible)
            </label>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={3}
              placeholder="Summary of repair visible to citizen in their tracking view..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correction Instructions <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="State clearly what is missing or requires further maintenance..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>
        )}

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
          disabled={loading || (decision === 'return' && !comment.trim())}
          className={`px-5 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2 shadow-sm ${
            decision === 'approve' ? 'bg-[#1a6b3c] hover:bg-[#145230]' : 'bg-amber-600 hover:bg-amber-700'
          }`}
        >
          {loading && <Loader2 className="animate-spin w-4 h-4" />}
          {decision === 'approve' ? 'Confirm Resolution' : 'Return to Operative'}
        </button>
      </div>
    </Modal>
  );
}
