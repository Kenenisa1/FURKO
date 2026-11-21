import { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal.jsx';
import { getBranches, transferBranchReport } from '../../../services/reportService.js';
import { Loader2, ArrowRightLeft } from 'lucide-react';

export default function TransferBranchModal({ isOpen, onClose, report, onTransferred }) {
  const [branches, setBranches] = useState([]);
  const [toBranchId, setToBranchId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setToBranchId('');
    setReason('');
    setError('');
    getBranches()
      .then((data) => {
        // filter out the current branch if already assigned
        const filtered = (data || []).filter((b) => b.id !== report?.current_branch_id);
        setBranches(filtered);
        if (filtered.length > 0) setToBranchId(filtered[0].id);
      })
      .catch((err) => setError(err.message));
  }, [isOpen, report]);

  async function handleSubmit() {
    if (!toBranchId) {
      setError('Please select a destination branch.');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a justification for this branch transfer.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await transferBranchReport(report.id, {
        toBranchId,
        reason: reason.trim(),
      });
      onTransferred();
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
      title="Transfer Report to Branch"
      maxWidth="max-w-lg"
    >
      <div className="bg-[#f5f9f6] rounded-xl p-4 mb-4 border border-[#1a6b3c]/15">
        <p className="text-xs text-gray-500">Report</p>
        <p className="font-semibold text-gray-900">{report.title}</p>
        <p className="font-mono text-xs text-[#1a6b3c]">{report.tracking_number || report.id}</p>
        <p className="text-xs text-gray-600 mt-1">
          Current Branch: <span className="font-medium text-gray-800">{report.branchName || 'Central / Unassigned'}</span>
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Destination Branch <span className="text-red-500">*</span>
          </label>
          {branches.length === 0 ? (
            <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded border border-amber-200">
              No other branches available in this institution.
            </p>
          ) : (
            <select
              value={toBranchId}
              onChange={(e) => setToBranchId(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] bg-white"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Transfer Justification Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Explain why this issue is being reassigned to the destination branch (e.g. Geographically situated in Bacho Bore zone)..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
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
          disabled={loading || branches.length === 0 || !reason.trim()}
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2 shadow-sm"
        >
          {loading && <Loader2 className="animate-spin w-4 h-4" />}
          <ArrowRightLeft className="w-4 h-4" />
          Initiate Transfer
        </button>
      </div>
    </Modal>
  );
}
