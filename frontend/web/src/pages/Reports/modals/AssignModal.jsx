import { useState } from 'react';
import Modal from '../../../components/ui/Modal.jsx';
import { assignReport } from '../../../services/reportService.js';
import { mockStaff, departments } from '../../../data/mockStaff.js';

export default function AssignModal({ isOpen, onClose, report, onAssigned }) {
  const [form, setForm] = useState({
    department: report?.department || '',
    assignedTo: report?.assignedTo || '',
    assignmentNote: report?.assignmentNote || '',
    dueDate: report?.dueDate || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const staffInDept = form.department
    ? mockStaff.filter((s) => s.department === form.department && s.status === 'Active')
    : mockStaff.filter((s) => s.status === 'Active');

  async function handleSubmit() {
    if (!form.department || !form.assignedTo) {
      setError('Please select a department and staff member.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const updated = await assignReport(report.id, form);
      onAssigned(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!report) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Report" maxWidth="max-w-lg">
      {/* Report summary */}
      <div className="bg-[#f5f9f6] rounded-xl p-4 mb-5 border border-[#1a6b3c]/15">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-gray-500">Report ID</p>
            <p className="font-mono font-semibold text-[#1a6b3c]">{report.id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Category</p>
            <p className="font-medium text-gray-800">{report.category}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Location</p>
            <p className="text-gray-700">{report.location?.kebele}, {report.location?.city}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Priority</p>
            <p className="font-semibold text-gray-800">{report.priority}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            value={form.department}
            onChange={(e) => setForm((f) => ({ ...f, department: e.target.value, assignedTo: '' }))}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
          >
            <option value="">Select department</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Assigned staff */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Assigned Staff <span className="text-red-500">*</span>
          </label>
          <select
            value={form.assignedTo}
            onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
          >
            <option value="">Select staff member</option>
            {staffInDept.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name} — {s.role}
              </option>
            ))}
          </select>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Assignment Note
          </label>
          <textarea
            value={form.assignmentNote}
            onChange={(e) => setForm((f) => ({ ...f, assignmentNote: e.target.value }))}
            rows={3}
            placeholder="Instructions or context for the assigned staff..."
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
          />
        </div>

        {/* Due date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Due Date (optional)
          </label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            min={new Date().toISOString().split('T')[0]}
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
          className="px-5 py-2 rounded-lg bg-[#1a6b3c] hover:bg-[#145230] text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
        >
          {loading && (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          )}
          Assign Report
        </button>
      </div>
    </Modal>
  );
}
