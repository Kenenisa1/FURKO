/**
 * Standard Pilot Institutions for Jimma City
 */
export const DEFAULT_PILOT_INSTITUTIONS = [
  {
    id: 'a90184b2-297c-482f-b054-c9f131a403d1',
    name: 'Jimma City Road & Infrastructure Development Bureau',
    code: 'JCRIDB',
    contact_email: 'roads@jimma.gov.et',
    contact_phone: '+251 47 111 2020',
  },
  {
    id: 'b11894b3-397c-482f-b054-c9f131a403d2',
    name: 'Jimma City Water & Sewerage Authority',
    code: 'JC-WSA',
    contact_email: 'water@jimma.gov.et',
    contact_phone: '+251 47 111 3030',
  },
  {
    id: 'c22905c4-498d-483f-c165-d0f242b504e3',
    name: 'Jimma City Sanitation & Waste Management Office',
    code: 'JCSWMO',
    contact_email: 'sanitation@jimma.gov.et',
    contact_phone: '+251 47 111 4040',
  },
  {
    id: 'd33016d5-509e-494f-d276-e1f353c615f4',
    name: 'Ethiopian Electric Utility (EEU) – Jimma Branch',
    code: 'EEU-JB',
    contact_email: 'eeu.jimma@eeu.gov.et',
    contact_phone: '+251 47 111 5050',
  },
  {
    id: 'f9999999-9999-4999-9999-999999999999',
    name: 'Jimma City Central Municipal Fallback & Triage Desk',
    code: 'JCCM-FALLBACK',
    contact_email: 'triage@jimma.gov.et',
    contact_phone: '+251 47 111 1000',
  },
];

/**
 * Standard Categories for Jimma City Civic Issues
 */
export const DEFAULT_PILOT_CATEGORIES = [
  {
    id: 'cat-roads-001',
    uuid: '7b3b9b42-1456-4c28-bb88-3488f7236d22',
    name: 'Roads & Streets',
    slug: 'roads-streets',
    default_institution_id: 'a90184b2-297c-482f-b054-c9f131a403d1',
  },
  {
    id: 'cat-water-002',
    uuid: '8c4c0c53-2567-4d39-cc99-459908347e33',
    name: 'Water & Sewerage',
    slug: 'water-sewerage',
    default_institution_id: 'b11894b3-397c-482f-b054-c9f131a403d2',
  },
  {
    id: 'cat-waste-003',
    uuid: '9d5d1d64-3678-4e4a-ddaa-56aa19458f44',
    name: 'Waste Management',
    slug: 'waste-management',
    default_institution_id: 'c22905c4-498d-483f-c165-d0f242b504e3',
  },
  {
    id: 'cat-lighting-004',
    uuid: '0e6e2e75-4789-4f5b-eebb-67bb20569055',
    name: 'Street Lighting & Power',
    slug: 'lighting-power',
    default_institution_id: 'd33016d5-509e-494f-d276-e1f353c615f4',
  },
];

export interface PolygonBoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/**
 * Bounding boxes approximating Jimma City Administrative zones
 * Jimma center is approx: Lat 7.67, Lng 36.83
 */
export const JIMMA_SERVICE_BOUNDS = {
  // Jimma Greater Metropolitan bounds
  METROPOLITAN: {
    minLat: 7.6300,
    maxLat: 7.7200,
    minLng: 36.7800,
    maxLng: 36.8900,
  },
  // Central District (Bole / Aba Jifar / Mendera / Hermata)
  CENTRAL_DISTRICT: {
    minLat: 7.6550,
    maxLat: 7.6950,
    minLng: 36.8150,
    maxLng: 36.8550,
  },
  // North / Agaro Road Corridor
  NORTH_CORRIDOR: {
    minLat: 7.6951,
    maxLat: 7.7200,
    minLng: 36.8200,
    maxLng: 36.8700,
  },
};
