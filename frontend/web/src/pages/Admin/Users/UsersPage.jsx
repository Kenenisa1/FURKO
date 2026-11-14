import { useState, useEffect } from 'react';
import { Search, Plus, Filter, UserCheck, UserX, Edit2, Trash2, Eye, Users as UsersIcon, UserCog, Shield } from 'lucide-react';
import DataTable from '../../../components/admin/tables/DataTable.jsx';
import LoadingSpinner from '../../../components/ui/LoadingSpinner.jsx';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import ConfirmationModal from '../../../components/ui/ConfirmationModal.jsx';
import SummaryCards from '../../../components/admin/ui/SummaryCards.jsx';
import FilterPanel from '../../../components/admin/ui/FilterPanel.jsx';
import UserFormModal from './UserFormModal.jsx';
import { getUsers, toggleUserStatus, deleteUser } from '../../../services/admin/usersApi.js';
import { mockDashboardStats } from '../../../data/mockAdminData.js';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [institutionFilter, setInstitutionFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, search, roleFilter, statusFilter, institutionFilter]);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  function filterUsers() {
    let filtered = [...users];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower) ||
          (u.phone && u.phone.toLowerCase().includes(searchLower))
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((u) => u.status === statusFilter);
    }

    if (institutionFilter !== 'all') {
      filtered = filtered.filter((u) => u.institutionId === institutionFilter);
    }

    setFilteredUsers(filtered);
  }
  
  // Calculate summary stats
  const totalUsers = users.length;
  const citizenCount = users.filter((u) => u.role === 'citizen').length;
  const staffCount = users.filter((u) => u.role === 'staff').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const activeCount = users.filter((u) => u.status === 'active').length;
  const inactiveCount = users.filter((u) => u.status === 'inactive').length;

  // Get unique institutions for filter
  const institutions = [...new Set(users.filter((u) => u.institutionId).map((u) => ({ id: u.institutionId, name: u.institution })))];
  const uniqueInstitutions = institutions.filter((inst, index, self) => 
    index === self.findIndex((t) => t.id === inst.id)
  );

  async function handleToggleStatus(user) {
    setActionLoading(true);
    try {
      const updated = await toggleUserStatus(user.id);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      setSuccessMessage(`User ${updated.status === 'active' ? 'activated' : 'deactivated'} successfully`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await deleteUser(selectedUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
      setSuccessMessage('User deleted successfully');
      setTimeout(() => setSuccessMessage(''), 4000);
    } finally {
      setActionLoading(false);
    }
  }

  function handleEdit(user) {
    setSelectedUser(user);
    setShowFormModal(true);
  }

  function handleAdd() {
    setSelectedUser(null);
    setShowFormModal(true);
  }

  function handleFormSuccess(updatedUser) {
    if (selectedUser) {
      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      setSuccessMessage('User updated successfully');
    } else {
      setUsers((prev) => [...prev, updatedUser]);
      setSuccessMessage('User created successfully');
    }
    setTimeout(() => setSuccessMessage(''), 4000);
    setShowFormModal(false);
    setSelectedUser(null);
  }

  const columns = [
    {
      key: 'name',
      label: 'User',
      render: (user) => (
        <div>
          <p className="font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
          {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (user) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
          user.role === 'staff' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {user.role === 'admin' ? 'Admin' :
           user.role === 'staff' ? 'Staff' :
           'Citizen'}
        </span>
      ),
    },
    {
      key: 'institution',
      label: 'Institution',
      render: (user) => user.institution ? (
        <span className="text-sm text-gray-900">{user.institution}</span>
      ) : (
        <span className="text-gray-400 text-sm">—</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (user) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {user.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'registeredAt',
      label: 'Registered',
      render: (user) => {
        const date = new Date(user.registeredAt);
        return (
          <div className="text-sm text-gray-600">
            <div>{date.toLocaleDateString()}</div>
            {user.lastActiveAt && (
              <div className="text-xs text-gray-400">
                Last: {new Date(user.lastActiveAt).toLocaleDateString()}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'activity',
      label: 'Activity',
      render: (user) => {
        if (user.reportsSubmitted) {
          return <span className="text-sm text-gray-600">{user.reportsSubmitted} reports</span>;
        } else if (user.reportsHandled) {
          return <span className="text-sm text-gray-600">{user.reportsHandled} handled</span>;
        }
        return <span className="text-gray-400 text-sm">—</span>;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(user);
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit user"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(user);
            }}
            disabled={actionLoading}
            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors disabled:opacity-50"
            title={user.status === 'active' ? 'Deactivate' : 'Activate'}
          >
            {user.status === 'active' ? (
              <UserX className="w-4 h-4" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(user);
              setShowDeleteModal(true);
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete user"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users & Roles</h2>
          <p className="text-gray-600 mt-1">Manage citizen and staff accounts across the platform</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a6b3c] text-white rounded-lg hover:bg-[#145230] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        cards={[
          {
            label: 'Total Users',
            value: totalUsers.toLocaleString(),
            subtitle: `${activeCount} active, ${inactiveCount} inactive`,
            icon: <UsersIcon className="w-6 h-6" />,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
          },
          {
            label: 'Citizens',
            value: citizenCount.toLocaleString(),
            subtitle: 'Report submitters',
            icon: <UsersIcon className="w-6 h-6" />,
            iconBg: 'bg-gray-100',
            iconColor: 'text-gray-600',
          },
          {
            label: 'Staff Members',
            value: staffCount,
            subtitle: 'Institution employees',
            icon: <UserCog className="w-6 h-6" />,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
          },
          {
            label: 'Administrators',
            value: adminCount,
            subtitle: 'System admins',
            icon: <Shield className="w-6 h-6" />,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
          },
        ]}
      />

      {/* Filters */}
      <FilterPanel
        search={search}
        onSearchChange={setSearch}
        showAdvanced={showFilters}
        onToggleAdvanced={setShowFilters}
        filters={[
          {
            type: 'select',
            value: roleFilter,
            onChange: setRoleFilter,
            options: [
              { value: 'all', label: 'All Roles' },
              { value: 'citizen', label: 'Citizen' },
              { value: 'staff', label: 'Staff' },
              { value: 'admin', label: 'Admin' },
            ],
          },
          {
            type: 'select',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ],
          },
          {
            type: 'select',
            value: institutionFilter,
            onChange: setInstitutionFilter,
            options: [
              { value: 'all', label: 'All Institutions' },
              ...uniqueInstitutions.map((inst) => ({ value: inst.id, label: inst.name })),
            ],
          },
        ]}
      />

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Results summary */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredUsers.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{totalUsers}</span> users
          </p>
        </div>
        
        {filteredUsers.length === 0 ? (
          <EmptyState
            icon={<Search className="w-12 h-12" />}
            title="No users found"
            description="Try adjusting your search or filters"
          />
        ) : (
          <DataTable columns={columns} data={filteredUsers} />
        )}
      </div>

      {/* Modals */}
      {showFormModal && (
        <UserFormModal
          user={selectedUser}
          onClose={() => {
            setShowFormModal(false);
            setSelectedUser(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {showDeleteModal && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          title="Delete User"
          message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
          confirmText="Delete"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
