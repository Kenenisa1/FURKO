import { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal.jsx';
import { assignReport, getBranches } from '../../../services/reportService.js';
import { getStaff } from '../../../services/staffService.js';
import { Loader2, UserCheck } from 'lucide-react';

export default function AssignModal({ isOpen, onClose, report, onAssigned }) {
  const [assignedTo, setAssignedTo] = useState('');
  const [branchId, setBranchId] = useState('');
  const [priority, setPriority] = useState('');
  const [assignmentNote, setAssignmentNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [branches, setBranches] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setStaffLoading(true);
    setAssignedTo(report?.assigned_staff_id || '');
    setBranchId(report?.current_branch_id || '');
    setPriority(report?.priority || 'medium');
    setAssignmentNote('');
    setError('');

    Promise.all([
      getStaff().catch(() => []),
      getBranches().catch(() => []),
    ])
      .then(([staffData, branchData]) => {
        setStaffList(staffData.filter((s) => s.status === 'Active'));
        setBranches(branchData);
      })
      .finally(() => setStaffLoading(false));
  }, [isOpen, report]);

  async function handleSubmit() {
    if (!assignedTo) {
      setError('Please select a staff member to assign.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const updated = await assignReport(report.id, {
        assignedTo,
        branchId: branchId || undefined,
        priority: priority || undefined,
        assignmentNote: assignmentNote.trim() || undefined,
      });
      onAssigned(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!report) return null;

  // Filter staff by branch if a branch is chosen
  const filteredStaff = branchId
    ? staffList.filter((s) => !s.branch_id || s.branch_id === branchId)
    : staffList;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign / Reassign Report" maxWidth="max-w-lg">
      <div className="bg-[#f5f9f6] rounded-xl p-4 mb-4 border border-[#1a6b3c]/15">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-gray-500">Report Tracking Number</p>
            <p className="font-mono font-semibold text-[#1a6b3c]">{report.tracking_number || report.id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Category</p>
            <p className="font-medium text-gray-800">{report.category_name || report.category || '—'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Branch Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Branch
          </label>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] bg-white"
          >
            <option value="">Central / All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>

        {/* Staff selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign to Staff Operative <span className="text-red-500">*</span>
          </label>
          {staffLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
              <Loader2 className="animate-spin w-4 h-4" /> Loading staff…
            </div>
          ) : filteredStaff.length === 0 ? (
            <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200">
              No active staff found for this branch. Please add staff or choose another branch.
            </p>
          ) : (
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] bg-white"
            >
              <option value="">Select a staff member…</option>
              {filteredStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.branch_name || 'Central'}) — {s.role}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority Level
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] bg-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assignment Note / Dispatch Instructions
          </label>
          <textarea
            value={assignmentNote}
            onChange={(e) => setAssignmentNote(e.target.value)}
            rows={3}
            placeholder="Instructions or context for the assigned staff operative..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">{error}</p>
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
          disabled={loading || staffLoading || filteredStaff.length === 0}
          className="px-5 py-2 rounded-lg bg-[#1a6b3c] hover:bg-[#145230] text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2 shadow-sm"
        >
          {loading && <Loader2 className="animate-spin w-4 h-4" />}
          <UserCheck className="w-4 h-4" />
          Confirm Assignment
        </button>
      </div>
    </Modal>
  );
}
