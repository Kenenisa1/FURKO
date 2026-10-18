// Lightweight Category API client (plain JS)
// Uses fetch and a fallback strategy to determine category usage before deletion.

const API_BASE = '/api/v1';

async function handleJsonResponse(res) {
  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const err = new Error((json && json.message) || res.statusText || 'API error');
      err.status = res.status;
      err.payload = json;
      throw err;
    }
    return json;
  } catch (e) {
    if (!res.ok) throw new Error(res.statusText || 'Network error');
    return null;
  }
}

export async function getCategories() {
  const res = await fetch(`${API_BASE}/categories`, { credentials: 'same-origin' });
  const json = await handleJsonResponse(res);
  // Accept either { success: true, data: [...] } or raw array
  if (json && Array.isArray(json.data)) return json.data;
  if (Array.isArray(json)) return json;
  return [];
}

export async function createCategory(payload) {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });
  const json = await handleJsonResponse(res);
  return (json && (json.data || json)) || null;
}

export async function updateCategory(id, payload) {
  const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });
  const json = await handleJsonResponse(res);
  return (json && (json.data || json)) || null;
}

export async function deleteCategory(id) {
  const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  });
  await handleJsonResponse(res);
}

// Returns number of reports referencing this category (0 permitted)
export async function checkCategoryUsage(categoryId) {
  // 1) Preferred: dedicated endpoint
  try {
    const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(categoryId)}/reports/count`, {
      method: 'GET',
      credentials: 'same-origin',
    });
    if (res.ok) {
      const json = await handleJsonResponse(res);
      // Expect { success: true, data: { count: N } } or { count: N }
      if (json && typeof (json.data && json.data.count) === 'number') return json.data.count;
      if (json && typeof json.count === 'number') return json.count;
    }
  } catch (err) {
    // ignore and try fallback
    // console.warn('preferred usage endpoint failed', err);
  }

  // 2) Fallback: query report list filtered by category_id, limit 1, and inspect response metadata
  try {
    const res = await fetch(`${API_BASE}/reports?category_id=${encodeURIComponent(categoryId)}&limit=1`, {
      method: 'GET',
      credentials: 'same-origin',
    });
    if (res.ok) {
      const json = await handleJsonResponse(res);
      // Try common shapes:
      // { success: true, data: { total: N, reports: [...] } }
      if (json && json.data && typeof json.data.total === 'number') return json.data.total;
      if (json && Array.isArray(json.data)) return json.data.length;
      // Or { total, reports } at top level
      if (typeof json.total === 'number') return json.total;
      if (Array.isArray(json.reports)) {
        // if only one returned (limit=1), it's inconclusive; treat >0 as used
        return json.reports.length;
      }
    }
  } catch (err) {
    // fallback failed
    // console.warn('fallback usage check failed', err);
  }

  // Unknown backend shape — return 0 (non-blocking). If you prefer conservative blocking on unknowns,
  // change to return Number.MAX_SAFE_INTEGER.
  return 0;
}