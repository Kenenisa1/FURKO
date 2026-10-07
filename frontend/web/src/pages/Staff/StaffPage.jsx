import { useState, useEffect } from 'react';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';
import Modal from '../../components/ui/Modal.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { getStaff, addStaff, updateStaff } from '../../services/staffService.js';
import { departments } from '../../data/mockStaff.js';
import { useApp } from '../../context/AppContext.jsx';
import { Plus, Search, User, Loader2 } from 'lucide-react';

const ROLES = ['Institution Staff', 'Senior Staff', 'Field Inspector', 'Department Head', 'Administrator'];

const BLANK_FORM = { name: '', role: 'Institution Staff', department: '', email: '', phone: '', status: 'Active' };

function StaffStatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
      status === 'Active'
        ? 'bg-green-50 text-green-700 border border-green-200'
        : 'bg-gray-100 text-gray-500 border border-gray-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`} />
      {status}
    </span>
  );
}

export default function StaffPage() {
  const { showToast } = useApp();
  const [staff, setStaff]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]   = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getStaff().then(setStaff).finally(() => setLoading(false));
  }, []);

  function openAdd() {
    setEditTarget(null);
    setForm(BLANK_FORM);
    setShowModal(true);
  }

  function openEdit(member) {
    setEditTarget(member);
    setForm({ name: member.name, role: member.role, department: member.department, email: member.email, phone: member.phone, status: member.status });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.department || !form.email.trim()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        const updated = await updateStaff(editTarget.id, form);
        setStaff((s) => s.map((m) => (m.id === updated.id ? updated : m)));
        showToast('Staff member updated.', 'success');
      } else {
        const newMember = await addStaff(form);
        setStaff((s) => [...s, newMember]);
        showToast('Staff member added.', 'success');
      }
      setShowModal(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  const filtered = staff.filter((s) =>
    !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <Breadcrumb items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Staff' }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-1">{staff.length} staff member{staff.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a6b3c] hover:bg-[#145230] text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Staff
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, department, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState icon={<User className="w-12 h-12" />} title="No staff found" description="No staff members match your search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-6">Staff Member</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4">Role</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4">Department</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4">Email</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4">Status</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((member) => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1a6b3c] text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{member.role}</td>
                    <td className="py-4 px-4 text-gray-700">{member.department}</td>
                    <td className="py-4 px-4 text-gray-600 text-xs">{member.email}</td>
                    <td className="py-4 px-4"><StaffStatusBadge status={member.status} /></td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(member)}
                          className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editTarget ? 'Edit Staff Member' : 'Add Staff Member'}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Full name" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] bg-white">
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department <span className="text-red-500">*</span></label>
              <select value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] bg-white">
                <option value="">Select department</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="email@institution.gov.et" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+251..." className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] bg-white">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 rounded-lg bg-[#1a6b3c] hover:bg-[#145230] text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="animate-spin w-4 h-4" />}
            {editTarget ? 'Save Changes' : 'Add Staff'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
