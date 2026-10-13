import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Power, PowerOff, TestTube, AlertTriangle, TrendingUp, CheckCircle, Eye, Target } from 'lucide-react';
import DataTable from '../../../components/admin/tables/DataTable.jsx';
import LoadingSpinner from '../../../components/ui/LoadingSpinner.jsx';
import SummaryCards from '../../../components/admin/ui/SummaryCards.jsx';
import FilterPanel from '../../../components/admin/ui/FilterPanel.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import ConfirmationModal from '../../../components/ui/ConfirmationModal.jsx';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import { getRoutingRules, toggleRoutingRuleStatus, deleteRoutingRule } from '../../../services/admin/routingApi.js';
import { mockCategories, mockInstitutions, mockServiceAreas } from '../../../data/mockAdminData.js';
import RuleFormModal from './RuleFormModal.jsx';

export default function RoutingRulesPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Rule testing state
  const [testCategory, setTestCategory] = useState('');
  const [testServiceArea, setTestServiceArea] = useState('');
  const [testResult, setTestResult] = useState(null);

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
    setActionLoading(true);
    try {
      const updated = await toggleRoutingRuleStatus(rule.id);
      setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)));
      setSuccessMessage(`Rule ${updated.status === 'active' ? 'activated' : 'deactivated'} successfully`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedRule) return;
    setActionLoading(true);
    try {
      await deleteRoutingRule(selectedRule.id);
      setRules((prev) => prev.filter((r) => r.id !== selectedRule.id));
      setShowDeleteModal(false);
      setSelectedRule(null);
      setSuccessMessage('Routing rule deleted successfully');
      setTimeout(() => setSuccessMessage(''), 4000);
    } finally {
      setActionLoading(false);
    }
  }

  function handleTestRule() {
    if (!testCategory || !testServiceArea) {
      setTestResult({ error: 'Please select both category and service area' });
      return;
    }

    // Find matching rules
    const matchingRules = rules
      .filter((r) => r.status === 'active')
      .filter((r) => r.categoryId === testCategory)
      .filter((r) => r.serviceAreaId === testServiceArea)
      .sort((a, b) => a.priority - b.priority);

    if (matchingRules.length === 0) {
      setTestResult({
        error: 'No matching routing rule found',
        fallback: true,
        message: 'This report would be sent to the fallback queue for manual review',
      });
    } else {
      const selectedRule = matchingRules[0];
      setTestResult({
        success: true,
        rule: selectedRule,
        conflicts: matchingRules.length > 1 ? matchingRules.slice(1) : [],
      });
    }
  }

  // Detect conflicts
  const conflicts = rules
    .filter((r) => r.status === 'active')
    .reduce((acc, rule) => {
      const duplicates = rules.filter(
        (other) =>
          other.id !== rule.id &&
          other.status === 'active' &&
          other.categoryId === rule.categoryId &&
          other.serviceAreaId === rule.serviceAreaId &&
          other.priority === rule.priority
      );
      if (duplicates.length > 0) {
        const key = `${rule.categoryId}-${rule.serviceAreaId}-${rule.priority}`;
        if (!acc.some((c) => c.key === key)) {
          acc.push({ key, rules: [rule, ...duplicates] });
        }
      }
      return acc;
    }, []);

  const filteredRules = rules.filter((r) => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (
        !r.name.toLowerCase().includes(searchLower) &&
        !r.category.toLowerCase().includes(searchLower) &&
        !r.institution.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && r.categoryId !== categoryFilter) return false;
    return true;
  });

  // Calculate summary stats
  const totalRules = rules.length;
  const activeRules = rules.filter((r) => r.status === 'active').length;
  const inactiveRules = rules.filter((r) => r.status === 'inactive').length;
  const avgEffectiveness =
    rules.length > 0 ? Math.round(rules.reduce((sum, r) => sum + (r.effectiveness || 0), 0) / rules.length) : 0;

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
    {
      key: 'serviceArea',
      label: 'Service Area',
      render: (rule) => <span className="text-sm text-gray-900">{rule.serviceArea}</span>,
    },
    {
      key: 'institution',
      label: 'Target Institution',
      render: (rule) => <span className="text-sm text-gray-900">{rule.institution}</span>,
    },
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
      key: 'effectiveness',
      label: 'Effectiveness',
      render: (rule) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2 w-16">
            <div
              className={`h-2 rounded-full ${
                rule.effectiveness >= 95
                  ? 'bg-green-500'
                  : rule.effectiveness >= 85
                  ? 'bg-blue-500'
                  : 'bg-orange-500'
              }`}
              style={{ width: `${rule.effectiveness}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-700">{rule.effectiveness}%</span>
        </div>
      ),
    },
    {
      key: 'matched',
      label: 'Matched',
      render: (rule) => <span className="text-sm font-medium text-gray-900">{rule.matchedReports || 0}</span>,
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
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRule(rule);
              setShowDetailModal(true);
            }}
            className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-colors"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRule(rule);
              setShowFormModal(true);
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit rule"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(rule);
            }}
            disabled={actionLoading}
            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors disabled:opacity-50"
            title={rule.status === 'active' ? 'Deactivate' : 'Activate'}
          >
            {rule.status === 'active' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRule(rule);
              setShowDeleteModal(true);
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete rule"
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
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Routing Rules</h2>
          <p className="text-gray-600 mt-1">Configure how reports are automatically routed to institutions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTestModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TestTube className="w-4 h-4" />
            Test Rule
          </button>
          <button
            onClick={() => {
              setSelectedRule(null);
              setShowFormModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a6b3c] text-white rounded-lg hover:bg-[#145230] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        cards={[
          {
            label: 'Total Rules',
            value: totalRules,
            subtitle: `${activeRules} active, ${inactiveRules} inactive`,
            icon: <Target className="w-6 h-6" />,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
          },
          {
            label: 'Active Rules',
            value: activeRules,
            subtitle: 'Currently routing reports',
            icon: <CheckCircle className="w-6 h-6" />,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
          },
          {
            label: 'Avg. Effectiveness',
            value: `${avgEffectiveness}%`,
            subtitle: 'Successful routing rate',
            icon: <TrendingUp className="w-6 h-6" />,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
          },
          {
            label: 'Conflicts Detected',
            value: conflicts.length,
            subtitle: conflicts.length > 0 ? 'Requires attention' : 'No conflicts',
            icon: <AlertTriangle className="w-6 h-6" />,
            iconBg: conflicts.length > 0 ? 'bg-red-100' : 'bg-gray-100',
            iconColor: conflicts.length > 0 ? 'text-red-600' : 'text-gray-600',
          },
        ]}
      />

      {/* Conflict Warning */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900 mb-1">Routing Conflicts Detected</h4>
              <p className="text-sm text-red-700 mb-3">
                {conflicts.length} rule conflict{conflicts.length > 1 ? 's' : ''} detected. Multiple rules with the same
                category, service area, and priority can cause unpredictable routing behavior.
              </p>
              <div className="space-y-2">
                {conflicts.map((conflict, index) => (
                  <div key={index} className="bg-white rounded p-3 text-sm">
                    <p className="font-medium text-gray-900 mb-1">
                      {conflict.rules[0].category} → {conflict.rules[0].serviceArea} (Priority {conflict.rules[0].priority})
                    </p>
                    <p className="text-gray-600 text-xs">
                      Conflicting rules: {conflict.rules.map((r) => r.name).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <FilterPanel
        search={search}
        onSearchChange={setSearch}
        showAdvanced={showFilters}
        onToggleAdvanced={setShowFilters}
        filters={[
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
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { value: 'all', label: 'All Categories' },
              ...mockCategories.map((cat) => ({ value: cat.id, label: cat.name })),
            ],
          },
        ]}
      />

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredRules.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{totalRules}</span> routing rules
          </p>
        </div>
        {filteredRules.length === 0 ? (
          <EmptyState
            icon={<Search className="w-12 h-12" />}
            title="No routing rules found"
            description="Try adjusting your search or filters"
          />
        ) : (
          <DataTable columns={columns} data={filteredRules} />
        )}
      </div>

      {/* Modals */}
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
              setSuccessMessage('Routing rule updated successfully');
            } else {
              setRules((prev) => [...prev, updated]);
              setSuccessMessage('Routing rule created successfully');
            }
            setTimeout(() => setSuccessMessage(''), 4000);
            setShowFormModal(false);
            setSelectedRule(null);
          }}
        />
      )}

      {showDeleteModal && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          title="Delete Routing Rule"
          message={`Are you sure you want to delete "${selectedRule?.name}"? Reports matching this rule will be sent to the fallback queue.`}
          confirmText="Delete"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedRule(null);
          }}
          loading={actionLoading}
        />
      )}

      {/* Test Rule Modal */}
      {showTestModal && (
        <Modal
          isOpen={showTestModal}
          onClose={() => {
            setShowTestModal(false);
            setTestResult(null);
            setTestCategory('');
            setTestServiceArea('');
          }}
          title="Test Routing Rule"
        >
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Simulate how a report would be routed based on its category and service area. This helps verify your routing
                configuration before reports are submitted.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Problem Category</label>
                <select
                  value={testCategory}
                  onChange={(e) => setTestCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
                >
                  <option value="">Select a category...</option>
                  {mockCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Area</label>
                <select
                  value={testServiceArea}
                  onChange={(e) => setTestServiceArea(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
                >
                  <option value="">Select a service area...</option>
                  {mockServiceAreas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleTestRule}
                className="w-full px-4 py-2 bg-[#1a6b3c] text-white rounded-lg hover:bg-[#145230] font-medium"
              >
                Run Test
              </button>
            </div>

            {/* Test Results */}
            {testResult && (
              <div className="pt-4 border-t border-gray-200">
                {testResult.error ? (
                  <div className={`p-4 rounded-lg ${testResult.fallback ? 'bg-orange-50 border border-orange-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${testResult.fallback ? 'text-orange-600' : 'text-red-600'}`} />
                      <div>
                        <p className={`text-sm font-semibold ${testResult.fallback ? 'text-orange-900' : 'text-red-900'}`}>
                          {testResult.error}
                        </p>
                        {testResult.message && (
                          <p className={`text-sm mt-1 ${testResult.fallback ? 'text-orange-700' : 'text-red-700'}`}>
                            {testResult.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-green-900 mb-2">Routing Rule Matched</p>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-green-700 mb-0.5">Rule Name</p>
                              <p className="text-sm font-medium text-green-900">{testResult.rule.name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-green-700 mb-0.5">Target Institution</p>
                              <p className="text-sm font-medium text-green-900">{testResult.rule.institution}</p>
                            </div>
                            <div>
                              <p className="text-xs text-green-700 mb-0.5">Priority</p>
                              <p className="text-sm font-medium text-green-900">{testResult.rule.priority}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {testResult.conflicts.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-yellow-900 mb-1">
                              Additional Matching Rules (Lower Priority)
                            </p>
                            <p className="text-xs text-yellow-700 mb-2">
                              These rules also match but won't be used because they have lower priority:
                            </p>
                            <ul className="space-y-1">
                              {testResult.conflicts.map((conflict, index) => (
                                <li key={index} className="text-xs text-yellow-800">
                                  • {conflict.name} (Priority {conflict.priority})
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowTestModal(false);
                  setTestResult(null);
                  setTestCategory('');
                  setTestServiceArea('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRule && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRule(null);
          }}
          title={selectedRule.name}
        >
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Rule Configuration</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="text-sm font-medium text-gray-900">{selectedRule.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Service Area</p>
                  <p className="text-sm font-medium text-gray-900">{selectedRule.serviceArea}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Target Institution</p>
                  <p className="text-sm font-medium text-gray-900">{selectedRule.institution}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Priority</p>
                  <p className="text-sm font-medium text-gray-900">{selectedRule.priority}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedRule.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {selectedRule.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(selectedRule.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Performance Metrics</h4>
              <div className="space-y-3">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-blue-600 mb-1">Total Reports Matched</p>
                  <p className="text-3xl font-bold text-blue-900">{selectedRule.matchedReports || 0}</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Effectiveness</span>
                    <span className="font-semibold text-gray-900">{selectedRule.effectiveness}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        selectedRule.effectiveness >= 95
                          ? 'bg-green-500'
                          : selectedRule.effectiveness >= 85
                          ? 'bg-blue-500'
                          : 'bg-orange-500'
                      }`}
                      style={{ width: `${selectedRule.effectiveness}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {selectedRule.effectiveness >= 95
                      ? 'Excellent - This rule is routing reports effectively'
                      : selectedRule.effectiveness >= 85
                      ? 'Good - This rule is performing well'
                      : 'Needs attention - Consider reviewing this rule configuration'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleToggleStatus(selectedRule);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {selectedRule.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedRule(selectedRule);
                    setShowFormModal(true);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Edit Rule
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#1a6b3c] rounded-lg hover:bg-[#145230]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
