// ──────────────────────────────────────────────
// FURKO — Routing Rules API Service (mock)
// ──────────────────────────────────────────────

import { mockRoutingRules } from '../../data/mockAdminData.js';

let routingRules = [...mockRoutingRules];

export async function getRoutingRules(filters = {}) {
  await delay(300);
  
  let filtered = [...routingRules];
  
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.name.toLowerCase().includes(search) ||
        r.category.toLowerCase().includes(search) ||
        r.serviceArea.toLowerCase().includes(search)
    );
  }
  
  if (filters.category) {
    filtered = filtered.filter((r) => r.categoryId === filters.category);
  }
  
  if (filters.status) {
    filtered = filtered.filter((r) => r.status === filters.status);
  }
  
  return filtered;
}

export async function getRoutingRuleById(id) {
  await delay(200);
  const rule = routingRules.find((r) => r.id === id);
  if (!rule) throw new Error('Routing rule not found');
  return rule;
}

export async function createRoutingRule(data) {
  await delay(400);
  const newRule = {
    id: `RULE-${String(routingRules.length + 1).padStart(3, '0')}`,
    ...data,
    lastUpdated: new Date().toISOString(),
  };
  routingRules.push(newRule);
  return newRule;
}

export async function updateRoutingRule(id, updates) {
  await delay(400);
  const index = routingRules.findIndex((r) => r.id === id);
  if (index === -1) throw new Error('Routing rule not found');
  
  routingRules[index] = {
    ...routingRules[index],
    ...updates,
    lastUpdated: new Date().toISOString(),
  };
  return routingRules[index];
}

export async function deleteRoutingRule(id) {
  await delay(300);
  const index = routingRules.findIndex((r) => r.id === id);
  if (index === -1) throw new Error('Routing rule not found');
  
  routingRules.splice(index, 1);
  return { success: true };
}

export async function toggleRoutingRuleStatus(id) {
  await delay(300);
  const rule = routingRules.find((r) => r.id === id);
  if (!rule) throw new Error('Routing rule not found');
  
  rule.status = rule.status === 'active' ? 'inactive' : 'active';
  rule.lastUpdated = new Date().toISOString();
  return rule;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
