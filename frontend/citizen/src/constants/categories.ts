import { ProblemCategory } from '../types';
import { Colors } from './colors';

// 4 Core Problem Categories matching SRS FR-002 and Jimma City pilot
export const PROBLEM_CATEGORIES: ProblemCategory[] = [
  {
    id: 'cat-roads-001',
    key: 'roads',
    name: 'Roads & Streets',
    nameLocal: 'Daandii fi Karaa',
    description: 'Potholes, damaged walkways, missing signage, and road blockages',
    icon: 'road',
    color: Colors.roads,
    examples: ['Deep pothole', 'Damaged pedestrian bridge', 'Broken curb', 'Fallen road sign'],
    responsibleInstitution: 'Jimma City Road & Infrastructure Development Bureau',
  },
  {
    id: 'cat-water-002',
    key: 'water',
    name: 'Water & Sewerage',
    nameLocal: 'Bishaan fi Dhangala\'aa',
    description: 'Pipe bursts, contaminated supply, blocked drainage, and sewer leaks',
    icon: 'water',
    color: Colors.water,
    examples: ['Water main burst', 'Sewer overflow', 'Zero water supply', 'Brown/dirty tap water'],
    responsibleInstitution: 'Jimma City Water & Sewerage Authority',
  },
  {
    id: 'cat-waste-003',
    key: 'waste',
    name: 'Waste Management',
    nameLocal: 'Bulchiinsa Kosiifi Xurii',
    description: 'Overflowing dumpsters, illegal dumpsites, and uncollected trash',
    icon: 'trash',
    color: Colors.waste,
    examples: ['Overflowing public bin', 'Illegal dump near school', 'Hazardous medical waste', 'Dead animal removal'],
    responsibleInstitution: 'Jimma City Sanitation & Waste Management Office',
  },
  {
    id: 'cat-lighting-004',
    key: 'lighting',
    name: 'Street Lighting & Power',
    nameLocal: 'Ibsaa Daandii fi Humna',
    description: 'Dark intersections, non-working lamps, dangling cables, and spark hazard',
    icon: 'flash',
    color: Colors.lighting,
    examples: ['Broken streetlight', 'Hanging electric wire', 'Blown street transformer', 'Dark junction at night'],
    responsibleInstitution: 'Ethiopian Electric Utility (EEU) – Jimma Branch',
  },
];

// Status display metadata
export const STATUS_META = {
  submitted: {
    label: 'Submitted',
    color: Colors.statusSubmitted,
    bg: '#F3F4F6',
    step: 1,
    description: 'Ticket received and queued for dispatch',
  },
  under_review: {
    label: 'Under Review',
    color: Colors.statusUnderReview,
    bg: '#EBF5FF',
    step: 2,
    description: 'Directly routed to responsible institution inbox',
  },
  in_progress: {
    label: 'In Progress',
    color: Colors.statusInProgress,
    bg: '#FEF3C7',
    step: 3,
    description: 'Accepted and assigned to maintenance team',
  },
  resolved: {
    label: 'Resolved',
    color: Colors.statusResolved,
    bg: '#DEF7EC',
    step: 4,
    description: 'Work completed with proof attachment',
  },
  rejected: {
    label: 'Rejected',
    color: Colors.statusRejected,
    bg: '#FDE8E8',
    step: 0,
    description: 'Report could not be processed',
  },
};
