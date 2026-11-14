import adminApi from './adminApiClient.js';
import { mockRoutingRules } from '../../data/mockAdminData.js';

export async function getRoutingRules(filters = {}) {
  try {
    const resp = await adminApi.get('/admin/routing-rules', { params: filters });
    return resp.data?.data || resp.data;
  } catch (err) {
    let rules = [...mockRoutingRules];
    if (filters.search) {
      const search = filters.search.toLowerCase();
      rules = rules.filter(
        (r) =>
          r.name.toLowerCase().includes(search) ||
          r.category.toLowerCase().includes(search) ||
          r.serviceArea.toLowerCase().includes(search)
      );
    }
    if (filters.category) rules = rules.filter((r) => r.categoryId === filters.category);
    if (filters.status) rules = rules.filter((r) => r.status === filters.status);
    return rules;
  }
}

export async function getRoutingRuleById(id) {
  try {
    const resp = await adminApi.get(`/admin/routing-rules/${id}`);
    return resp.data?.data || resp.data;
  } catch (err) {
    const r = mockRoutingRules.find((x) => x.id === id);
    if (!r) throw err;
    return r;
  }
}

export async function createRoutingRule(data) {
  try {
    const resp = await adminApi.post('/admin/routing-rules', data);
    return resp.data?.data || resp.data;
  } catch (err) {
    const newRule = {
      id: `RULE-${String(mockRoutingRules.length + 1).padStart(3, '0')}`,
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    mockRoutingRules.push(newRule);
    return newRule;
  }
}

export async function updateRoutingRule(id, updates) {
  try {
    const resp = await adminApi.put(`/admin/routing-rules/${id}`, updates);
    return resp.data?.data || resp.data;
  } catch (err) {
    const idx = mockRoutingRules.findIndex((r) => r.id === id);
    if (idx === -1) throw err;
    mockRoutingRules[idx] = { ...mockRoutingRules[idx], ...updates, lastUpdated: new Date().toISOString() };
    return mockRoutingRules[idx];
  }
}

export async function deleteRoutingRule(id) {
  try {
    const resp = await adminApi.delete(`/admin/routing-rules/${id}`);
    return resp.data?.data || resp.data;
  } catch (err) {
    const idx = mockRoutingRules.findIndex((r) => r.id === id);
    if (idx === -1) throw err;
    mockRoutingRules.splice(idx, 1);
    return { success: true };
  }
}

export async function toggleRoutingRuleStatus(id) {
  try {
    const resp = await adminApi.post(`/admin/routing-rules/${id}/toggle-status`);
    return resp.data?.data || resp.data;
  } catch (err) {
    const rule = mockRoutingRules.find((r) => r.id === id);
    if (!rule) throw err;
    rule.status = rule.status === 'active' ? 'inactive' : 'active';
    rule.lastUpdated = new Date().toISOString();
    return rule;
  }
}