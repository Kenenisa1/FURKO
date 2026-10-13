import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Power, PowerOff } from 'lucide-react';
import DataTable from '../../../components/admin/tables/DataTable.jsx';
import LoadingSpinner from '../../../components/ui/LoadingSpinner.jsx';
import { getRoutingRules, toggleRoutingRuleStatus } from '../../../services/admin/routingApi.js';
import RuleFormModal from './RuleFormModal.jsx';

export default function RoutingRulesPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRule, setSelectedRule] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    setLoading(true);
    try {
      const data = await getRoutingRules();
      setRules(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(rule) {
    try {
      const updated = await toggleRoutingRuleStatus(rule.id);
      setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)));
    } catch (err) {
      console.error(err);
    }
  }

  const filteredRules = rules.filter(
    (r) =>
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'name',
      label: 'Rule Name',
      render: (rule) => (
        <div>
          <p className="font-medium text-gray-900">{rule.name}</p>
          <p className="text-xs text-gray-500">{rule.category}</p>
        </div>
      ),
    },
    { key: 'serviceArea', label: 'Service Area' },
    { key: 'institution', label: 'Target Institution' },
    {
      key: 'priority',
      label: 'Priority',
      render: (rule) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
          {rule.priority}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (rule) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            rule.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {rule.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (rule) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedRule(rule);
              setShowFormModal(true);
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(rule)}
            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded"
          >
            {rule.status === 'active' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
          </button>
        </div>
      ),
    },
  ];

  if (loading)
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Routing Rules</h2>
          <p className="text-gray-600 mt-1">{filteredRules.length} rules configured</p>
        </div>
        <button
          onClick={() => {
            setSelectedRule(null);
            setShowFormModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a6b3c] text-white rounded-lg hover:bg-[#145230]"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search routing rules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <DataTable columns={columns} data={filteredRules} />
      </div>

      {showFormModal && (
        <RuleFormModal
          rule={selectedRule}
          onClose={() => {
            setShowFormModal(false);
            setSelectedRule(null);
          }}
          onSuccess={(updated) => {
            if (selectedRule) {
              setRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            } else {
              setRules((prev) => [...prev, updated]);
            }
            setShowFormModal(false);
            setSelectedRule(null);
          }}
        />
      )}
    </div>
  );
}
