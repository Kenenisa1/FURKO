import { useState, useEffect } from 'react';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';
import Modal from '../../components/ui/Modal.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { getStaff, addStaff, updateStaff, deleteStaff, INSTITUTION_ROLES } from '../../services/staffService.js';
import { getBranches } from '../../services/reportService.js';
import { useApp } from '../../context/AppContext.jsx';
import { Plus, Search, User, Loader2, Shield, MapPin, Briefcase } from 'lucide-react';

const BLANK_FORM = {
  name: '',
  role: 'institution_staff',
  branch_id: '',
  email: '',
  phone: '',
  status: 'Active',
  password: '',
};

function StaffRoleBadge({ role }) {
  if (role === 'institution_super_admin') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
        <Shield className="w-3 h-3 text-amber-600" />
        Super Admin
      </span>
    );
  }
  if (role === 'branch_manager') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        <Briefcase className="w-3 h-3 text-blue-500" />
        Branch Manager
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
      Staff Operative
    </span>
  );
}

function StaffStatusBadge({ status }) {
  const isActive = status === 'Active' || status === true;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-gray-100 text-gray-500 border border-gray-200'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

export default function StaffPage() {
  const { showToast } = useApp();
  const [staff, setStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [staffData, branchData] = await Promise.all([getStaff(), getBranches()]);
      setStaff(staffData);
      setBranches(branchData);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openAdd() {
    setEditTarget(null);
    setForm({
      ...BLANK_FORM,
      branch_id: branches[0]?.id || '',
    });
    setShowModal(true);
  }

  function openEdit(member) {
    setEditTarget(member);
    setForm({
      name: member.name || '',
      role: member.role || 'institution_staff',
      branch_id: member.branch_id || '',
      email: member.email || '',
      phone: member.phone || '',
      status: member.status || 'Active',
      password: '',
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) {
      showToast('Please fill in required fields (Name and Email).', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editTarget) {
        const payload = {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          role: form.role,
          branch_id: form.branch_id || null,
          status: form.status,
        };
        const updated = await updateStaff(editTarget.id, payload);
        setStaff((s) => s.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
        showToast('Staff member updated successfully.', 'success');
      } else {
        const payload = {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          role: form.role,
          branch_id: form.branch_id || null,
          password: form.password || undefined,
        };
        const newMember = await addStaff(payload);
        setStaff((s) => [newMember, ...s]);
        showToast('Staff member account created successfully.', 'success');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(member) {
    const isCurrentlyActive = member.status === 'Active';
    const action = isCurrentlyActive ? 'deactivate' : 'reactivate';
    if (!confirm(`Are you sure you want to ${action} ${member.name}?`)) return;

    try {
      if (isCurrentlyActive) {
        await deleteStaff(member.id);
        showToast(`${member.name} deactivated.`, 'success');
      } else {
        await updateStaff(member.id, { status: 'Active' });
        showToast(`${member.name} reactivated.`, 'success');
      }
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  const filtered = staff.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.branch_name?.toLowerCase().includes(q) ||
      s.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <Breadcrumb items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Staff Management' }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Institution Staff & RBAC</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage institutional personnel, branch allocations, roles, and report assignment privileges.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a6b3c] hover:bg-[#145230] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Search & Filters */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, role, email, or branch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
            />
          </div>
          <div className="text-xs text-gray-500">
            Total Staff: <span className="font-semibold text-gray-800">{staff.length}</span>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<User className="w-12 h-12" />}
            title="No staff members found"
            description="No staff match your current search criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/60">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-6">
                    Staff Member
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4">
                    Role & Permissions
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4">
                    Branch
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4">
                    Active Tasks
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4">
                    Status
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1a6b3c] text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                          {(member.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                          {member.phone && <p className="text-[11px] text-gray-400">{member.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <StaffRoleBadge role={member.role} />
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      <div className="flex items-center gap-1.5 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium">{member.branch_name || 'Central Headquarter'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-semibold text-gray-700">
                          {member.activeReportsCount || 0} active
                        </span>
                        <span className="text-[11px] text-gray-400">
                          ({member.reportsHandled || 0} total)
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <StaffStatusBadge status={member.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(member)}
                          className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(member)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                            member.status === 'Active'
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-green-200 text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {member.status === 'Active' ? 'Deactivate' : 'Reactivate'}
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editTarget ? 'Edit Staff Member' : 'Add Staff Member'}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Abebe Bikila"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institutional Role <span className="text-red-500">*</span>
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] bg-white"
              >
                {INSTITUTION_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Branch</label>
              <select
                value={form.branch_id}
                onChange={(e) => setForm((f) => ({ ...f, branch_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] bg-white"
              >
                <option value="">Central / Unassigned</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="staff@jimma.gov.et"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+251 91 123 4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
            />
          </div>

          {!editTarget && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Password (Optional)</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Leave blank for secure default (FurkoStaffJimma2026!)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
              />
            </div>
          )}

          {editTarget && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-[#1a6b3c] hover:bg-[#145230] text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="animate-spin w-4 h-4" />}
            {editTarget ? 'Save Changes' : 'Create Staff Account'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
