import { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal.jsx';
import { assignReport } from '../../../services/reportService.js';
import { getStaff } from '../../../services/staffService.js';
import { Loader2, UserCheck } from 'lucide-react';

export default function AssignModal({ isOpen, onClose, report, onAssigned }) {
  const [assignedTo, setAssignedTo] = useState('');
  const [assignmentNote, setAssignmentNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setStaffLoading(true);
    setAssignedTo('');
    setAssignmentNote('');
    setError('');
    getStaff()
      .then((data) => setStaffList(data.filter((s) => s.status === 'Active')))
      .catch(() => setStaffList([]))
      .finally(() => setStaffLoading(false));
  }, [isOpen]);

  async function handleSubmit() {
    if (!assignedTo) {
      setError('Please select a staff member to assign.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const updated = await assignReport(report.id, {
        department: '',
        assignedTo,       // this is now the UUID
        assignmentNote,
      });
      onAssigned(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!report) return null;

  const activeStaff = staffList;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign to Staff Member" maxWidth="max-w-lg">
      {/* Report summary */}
      <div className="bg-[#f5f9f6] rounded-xl p-4 mb-5 border border-[#1a6b3c]/15">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-gray-500">Report ID</p>
            <p className="font-mono font-semibold text-[#1a6b3c]">{report.tracking_number || report.id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Category</p>
            <p className="font-medium text-gray-800">{report.category_name || report.category || '—'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Staff selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Assign to Staff Member <span className="text-red-500">*</span>
          </label>
          {staffLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
              <Loader2 className="animate-spin w-4 h-4" /> Loading staff…
            </div>
          ) : activeStaff.length === 0 ? (
            <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              No active staff members found. Please add staff members first.
            </p>
          ) : (
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
            >
              <option value="">Select a staff member…</option>
              {activeStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.role}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Assignment Note
          </label>
          <textarea
            value={assignmentNote}
            onChange={(e) => setAssignmentNote(e.target.value)}
            rows={3}
            placeholder="Instructions or context for the assigned staff..."
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
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
          disabled={loading || staffLoading || activeStaff.length === 0}
          className="px-5 py-2 rounded-lg bg-[#1a6b3c] hover:bg-[#145230] text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 className="animate-spin w-4 h-4" />}
          <UserCheck className="w-4 h-4" />
          Assign Report
        </button>
      </div>
    </Modal>
  );
}
