// ──────────────────────────────────────────────
// FURKO — Categories API Service (mock)
// ──────────────────────────────────────────────

import { mockCategories } from '../../data/mockAdminData.js';

let categories = [...mockCategories];

export async function getCategories(filters = {}) {
  await delay(300);
  
  let filtered = [...categories];
  
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.description.toLowerCase().includes(search)
    );
  }
  
  if (filters.status) {
    filtered = filtered.filter((c) => c.status === filters.status);
  }
  
  return filtered;
}

export async function getCategoryById(id) {
  await delay(200);
  const category = categories.find((c) => c.id === id);
  if (!category) throw new Error('Category not found');
  return category;
}

export async function createCategory(data) {
  await delay(400);
  const newCategory = {
    id: `CAT-${String(categories.length + 1).padStart(3, '0')}`,
    ...data,
    routingRules: 0,
    createdAt: new Date().toISOString(),
  };
  categories.push(newCategory);
  return newCategory;
}

export async function updateCategory(id, updates) {
  await delay(400);
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) throw new Error('Category not found');
  
  categories[index] = { ...categories[index], ...updates };
  return categories[index];
}

export async function deleteCategory(id) {
  await delay(300);
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) throw new Error('Category not found');
  
  categories.splice(index, 1);
  return { success: true };
}

export async function toggleCategoryStatus(id) {
  await delay(300);
  const category = categories.find((c) => c.id === id);
  if (!category) throw new Error('Category not found');
  
  category.status = category.status === 'active' ? 'inactive' : 'active';
  return category;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
