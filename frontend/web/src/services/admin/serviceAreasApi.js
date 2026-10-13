/**
 * Service Areas API
 * Mock implementation for managing service areas
 */

// In-memory storage
let serviceAreas = [
  {
    id: '1',
    name: 'Roads & Streets',
    description: 'Road maintenance, potholes, traffic signals, street signage',
    status: 'active',
    institutionCount: 2,
    reportCount: 156,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '2',
    name: 'Water Supply',
    description: 'Water quality, supply disruptions, pipe leaks, meter issues',
    status: 'active',
    institutionCount: 1,
    reportCount: 89,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '3',
    name: 'Sewerage',
    description: 'Sewer blockages, overflows, manholes, drainage systems',
    status: 'active',
    institutionCount: 1,
    reportCount: 45,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '4',
    name: 'Waste & Sanitation',
    description: 'Garbage collection, illegal dumping, sanitation services',
    status: 'active',
    institutionCount: 1,
    reportCount: 123,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '5',
    name: 'Drainage',
    description: 'Storm drains, flooding prevention, water runoff management',
    status: 'active',
    institutionCount: 2,
    reportCount: 67,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '6',
    name: 'Street Lighting',
    description: 'Street lights, public lighting, electrical issues',
    status: 'active',
    institutionCount: 1,
    reportCount: 34,
    createdAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '7',
    name: 'Parks & Green Spaces',
    description: 'Park maintenance, landscaping, recreational facilities',
    status: 'active',
    institutionCount: 1,
    reportCount: 28,
    createdAt: '2024-01-20T10:00:00Z',
  },
];

let nextId = 8;

/**
 * Get all service areas
 */
export async function getServiceAreas() {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [...serviceAreas].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get a single service area by ID
 */
export async function getServiceAreaById(id) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const area = serviceAreas.find((a) => a.id === id);
  if (!area) throw new Error('Service area not found');
  return { ...area };
}

/**
 * Create a new service area
 */
export async function createServiceArea(data) {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const newArea = {
    id: String(nextId++),
    name: data.name,
    description: data.description,
    status: data.status || 'active',
    institutionCount: 0,
    reportCount: 0,
    createdAt: new Date().toISOString(),
  };

  serviceAreas.push(newArea);
  return { ...newArea };
}

/**
 * Update an existing service area
 */
export async function updateServiceArea(id, data) {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const index = serviceAreas.findIndex((a) => a.id === id);
  if (index === -1) throw new Error('Service area not found');

  serviceAreas[index] = {
    ...serviceAreas[index],
    name: data.name,
    description: data.description,
    status: data.status,
  };

  return { ...serviceAreas[index] };
}

/**
 * Toggle service area active/inactive status
 */
export async function toggleServiceAreaStatus(id) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = serviceAreas.findIndex((a) => a.id === id);
  if (index === -1) throw new Error('Service area not found');

  serviceAreas[index].status =
    serviceAreas[index].status === 'active' ? 'inactive' : 'active';

  return { ...serviceAreas[index] };
}

/**
 * Delete a service area
 */
export async function deleteServiceArea(id) {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const index = serviceAreas.findIndex((a) => a.id === id);
  if (index === -1) throw new Error('Service area not found');

  serviceAreas.splice(index, 1);
  return { success: true };
}

/**
 * Get active service areas (for dropdowns)
 */
export async function getActiveServiceAreas() {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return serviceAreas
    .filter((a) => a.status === 'active')
    .map((a) => a.name)
    .sort();
}
