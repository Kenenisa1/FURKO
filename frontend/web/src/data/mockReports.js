// ──────────────────────────────────────────────
// FURKO — Mock Report Data
// Replace these with real API calls in production
// ──────────────────────────────────────────────

export const REPORT_STATUS = {
  NEW: 'New',
  UNDER_REVIEW: 'Under Review',
  ACCEPTED: 'Accepted',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
  REDIRECTED: 'Redirected',
};

export const PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const mockReports = [
  {
    id: 'FR-2026-001',
    title: 'Water Pipe Leakage',
    category: 'Water & Sanitation',
    description:
      'Water is leaking from a broken pipe near the school on the main road. The leak has been ongoing for three days and is causing road damage and water waste. Residents in the area are concerned about structural damage to the road.',
    location: {
      kebele: 'Kebele 01',
      city: 'Jimma City',
      woreda: 'Woreda 3',
      address: 'Near Jimma Primary School, Main Road',
      coordinates: { lat: 7.6731, lng: 36.8344 },
    },
    priority: PRIORITY.HIGH,
    status: REPORT_STATUS.NEW,
    submittedAt: '2026-09-28T07:20:00Z',
    submittedBy: { name: 'Abebe Tadesse', phone: '+251911223344' },
    photos: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1581093458791-9d09c8a3e8ab?w=400&h=300&fit=crop',
    ],
    assignedTo: null,
    department: null,
    assignmentNote: null,
    dueDate: null,
    timeline: [
      { stage: 'Submitted', completedAt: '2026-09-28T07:20:00Z', note: 'Report submitted by citizen' },
    ],
    activity: [
      { time: '2026-09-28T07:20:00Z', action: 'Report submitted by citizen Abebe Tadesse' },
      { time: '2026-09-28T07:35:00Z', action: 'Report received in institution inbox' },
    ],
    resolution: null,
  },
  {
    id: 'FR-2026-002',
    title: 'Water Pipe Leakage',
    category: 'Water & Sanitation',
    description:
      'A water pipe has burst near the marketplace causing flooding on the footpath. The situation is creating a health hazard as stagnant water accumulates.',
    location: {
      kebele: 'Kebele 03',
      city: 'Jimma City',
      woreda: 'Woreda 1',
      address: 'Jimma Central Market Area',
      coordinates: { lat: 7.6698, lng: 36.8312 },
    },
    priority: PRIORITY.MEDIUM,
    status: REPORT_STATUS.UNDER_REVIEW,
    submittedAt: '2026-09-27T14:45:00Z',
    submittedBy: { name: 'Fatima Ahmed', phone: '+251922334455' },
    photos: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
    ],
    assignedTo: null,
    department: null,
    assignmentNote: null,
    dueDate: null,
    timeline: [
      { stage: 'Submitted', completedAt: '2026-09-27T14:45:00Z', note: 'Report submitted by citizen' },
      { stage: 'Under Review', completedAt: '2026-09-27T15:10:00Z', note: 'Under review by institution' },
    ],
    activity: [
      { time: '2026-09-27T14:45:00Z', action: 'Report submitted by citizen Fatima Ahmed' },
      { time: '2026-09-27T15:10:00Z', action: 'Report moved to Under Review' },
    ],
    resolution: null,
  },
  {
    id: 'FR-2026-003',
    title: 'Pothole on Main Road',
    category: 'Road & Infrastructure',
    description:
      'A large pothole has developed on the main road near the hospital entrance. It poses a danger to vehicles and pedestrians and has already caused minor vehicle damage.',
    location: {
      kebele: 'Kebele 05',
      city: 'Jimma City',
      woreda: 'Woreda 2',
      address: 'Jimma Specialised Hospital Road',
      coordinates: { lat: 7.6752, lng: 36.8390 },
    },
    priority: PRIORITY.MEDIUM,
    status: REPORT_STATUS.NEW,
    submittedAt: '2026-09-28T09:15:00Z',
    submittedBy: { name: 'Dawit Bekele', phone: '+251933445566' },
    photos: [
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop',
    ],
    assignedTo: null,
    department: null,
    assignmentNote: null,
    dueDate: null,
    timeline: [
      { stage: 'Submitted', completedAt: '2026-09-28T09:15:00Z', note: 'Report submitted by citizen' },
    ],
    activity: [
      { time: '2026-09-28T09:15:00Z', action: 'Report submitted by citizen Dawit Bekele' },
      { time: '2026-09-28T09:30:00Z', action: 'Report received in institution inbox' },
    ],
    resolution: null,
  },
  {
    id: 'FR-2026-004',
    title: 'Illegal Waste Dumping',
    category: 'Waste Management',
    description:
      'Large amounts of construction and household waste have been illegally dumped at the community park area. This is causing environmental and aesthetic damage to the neighbourhood.',
    location: {
      kebele: 'Kebele 07',
      city: 'Jimma City',
      woreda: 'Woreda 4',
      address: 'Community Park, Near Jimma University',
      coordinates: { lat: 7.6780, lng: 36.8420 },
    },
    priority: PRIORITY.HIGH,
    status: REPORT_STATUS.IN_PROGRESS,
    submittedAt: '2026-09-25T11:00:00Z',
    submittedBy: { name: 'Mekdes Solomon', phone: '+251944556677' },
    photos: [
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571919153286-7d1a02d99de6?w=400&h=300&fit=crop',
    ],
    assignedTo: 'Yohannes Girma',
    department: 'Waste Management',
    assignmentNote: 'Please coordinate with the sanitation team for immediate cleanup.',
    dueDate: '2026-10-02',
    timeline: [
      { stage: 'Submitted', completedAt: '2026-09-25T11:00:00Z', note: 'Report submitted' },
      { stage: 'Under Review', completedAt: '2026-09-25T11:30:00Z', note: 'Under review' },
      { stage: 'Accepted', completedAt: '2026-09-25T12:00:00Z', note: 'Accepted by institution' },
      { stage: 'Assigned', completedAt: '2026-09-25T13:00:00Z', note: 'Assigned to Yohannes Girma' },
      { stage: 'In Progress', completedAt: '2026-09-26T08:00:00Z', note: 'Cleanup work started' },
    ],
    activity: [
      { time: '2026-09-25T11:00:00Z', action: 'Report submitted by citizen Mekdes Solomon' },
      { time: '2026-09-25T11:30:00Z', action: 'Report moved to Under Review' },
      { time: '2026-09-25T12:00:00Z', action: 'Report accepted by institution' },
      { time: '2026-09-25T13:00:00Z', action: 'Assigned to Yohannes Girma — Waste Management' },
      { time: '2026-09-26T08:00:00Z', action: 'Work started — cleanup team deployed' },
    ],
    resolution: null,
  },
  {
    id: 'FR-2026-005',
    title: 'Street Light Failure',
    category: 'Electricity & Lighting',
    description:
      'Multiple street lights on the main boulevard have been non-functional for over a week. The area is very dark at night and poses a safety risk for residents and road users.',
    location: {
      kebele: 'Kebele 02',
      city: 'Jimma City',
      woreda: 'Woreda 1',
      address: 'Main Boulevard, Jimma City Centre',
      coordinates: { lat: 7.6710, lng: 36.8325 },
    },
    priority: PRIORITY.LOW,
    status: REPORT_STATUS.RESOLVED,
    submittedAt: '2026-09-20T16:30:00Z',
    submittedBy: { name: 'Biruk Haile', phone: '+251955667788' },
    photos: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop',
    ],
    assignedTo: 'Tigist Worku',
    department: 'Electricity Service',
    assignmentNote: 'Check all 12 street light poles on the boulevard.',
    dueDate: '2026-09-27',
    timeline: [
      { stage: 'Submitted', completedAt: '2026-09-20T16:30:00Z', note: 'Report submitted' },
      { stage: 'Under Review', completedAt: '2026-09-20T17:00:00Z', note: 'Under review' },
      { stage: 'Accepted', completedAt: '2026-09-21T09:00:00Z', note: 'Accepted' },
      { stage: 'Assigned', completedAt: '2026-09-21T10:00:00Z', note: 'Assigned to Tigist Worku' },
      { stage: 'In Progress', completedAt: '2026-09-22T08:00:00Z', note: 'Maintenance team on site' },
      { stage: 'Resolved', completedAt: '2026-09-24T15:00:00Z', note: 'All lights repaired' },
    ],
    activity: [
      { time: '2026-09-20T16:30:00Z', action: 'Report submitted by citizen Biruk Haile' },
      { time: '2026-09-20T17:00:00Z', action: 'Report moved to Under Review' },
      { time: '2026-09-21T09:00:00Z', action: 'Report accepted by institution' },
      { time: '2026-09-21T10:00:00Z', action: 'Assigned to Tigist Worku — Electricity Service' },
      { time: '2026-09-22T08:00:00Z', action: 'Work started — maintenance team dispatched' },
      { time: '2026-09-24T15:00:00Z', action: 'All 12 street lights repaired and tested' },
      { time: '2026-09-24T15:30:00Z', action: 'Report marked as Resolved' },
    ],
    resolution: {
      description: 'All 12 non-functional street lights on the main boulevard have been repaired. Faulty bulbs and wiring were replaced. Lights tested and verified working.',
      resolvedAt: '2026-09-24T15:00:00Z',
      resolvedBy: 'Tigist Worku',
      photos: [
        'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop',
      ],
    },
  },
  {
    id: 'FR-2026-006',
    title: 'Blocked Drainage Canal',
    category: 'Water & Sanitation',
    description:
      'The drainage canal near the residential area is completely blocked with debris and garbage. During rain, water overflows into homes and causes property damage.',
    location: {
      kebele: 'Kebele 09',
      city: 'Jimma City',
      woreda: 'Woreda 5',
      address: 'Residential Area near Kebele 09 Office',
      coordinates: { lat: 7.6802, lng: 36.8460 },
    },
    priority: PRIORITY.HIGH,
    status: REPORT_STATUS.NEW,
    submittedAt: '2026-09-29T06:00:00Z',
    submittedBy: { name: 'Hana Tesfaye', phone: '+251966778899' },
    photos: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    ],
    assignedTo: null,
    department: null,
    assignmentNote: null,
    dueDate: null,
    timeline: [
      { stage: 'Submitted', completedAt: '2026-09-29T06:00:00Z', note: 'Report submitted' },
    ],
    activity: [
      { time: '2026-09-29T06:00:00Z', action: 'Report submitted by citizen Hana Tesfaye' },
    ],
    resolution: null,
  },
  {
    id: 'FR-2026-007',
    title: 'Broken Bridge Railing',
    category: 'Road & Infrastructure',
    description:
      'The railing on the pedestrian bridge over the small river has completely broken. It is a serious safety hazard, especially for children and elderly pedestrians.',
    location: {
      kebele: 'Kebele 04',
      city: 'Jimma City',
      woreda: 'Woreda 2',
      address: 'Pedestrian Bridge, Kebele 04',
      coordinates: { lat: 7.6742, lng: 36.8355 },
    },
    priority: PRIORITY.CRITICAL,
    status: REPORT_STATUS.UNDER_REVIEW,
    submittedAt: '2026-09-28T13:00:00Z',
    submittedBy: { name: 'Solomon Assefa', phone: '+251977889900' },
    photos: [
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
    ],
    assignedTo: null,
    department: null,
    assignmentNote: null,
    dueDate: null,
    timeline: [
      { stage: 'Submitted', completedAt: '2026-09-28T13:00:00Z', note: 'Report submitted' },
      { stage: 'Under Review', completedAt: '2026-09-28T13:30:00Z', note: 'Under review' },
    ],
    activity: [
      { time: '2026-09-28T13:00:00Z', action: 'Report submitted by citizen Solomon Assefa' },
      { time: '2026-09-28T13:30:00Z', action: 'Report escalated to Under Review due to critical priority' },
    ],
    resolution: null,
  },
  {
    id: 'FR-2026-008',
    title: 'Contaminated Water Supply',
    category: 'Water & Sanitation',
    description:
      'Residents in Kebele 06 are reporting that tap water has an unusual smell and brown discolouration. Multiple households are affected and people are afraid to use it for drinking.',
    location: {
      kebele: 'Kebele 06',
      city: 'Jimma City',
      woreda: 'Woreda 3',
      address: 'Kebele 06 Residential Zone',
      coordinates: { lat: 7.6765, lng: 36.8400 },
    },
    priority: PRIORITY.CRITICAL,
    status: REPORT_STATUS.IN_PROGRESS,
    submittedAt: '2026-09-26T08:30:00Z',
    submittedBy: { name: 'Almaz Girma', phone: '+251988990011' },
    photos: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    ],
    assignedTo: 'Abdullah Ziyad',
    department: 'Water Services',
    assignmentNote: 'Urgent water quality testing required. Contact health office if needed.',
    dueDate: '2026-09-30',
    timeline: [
      { stage: 'Submitted', completedAt: '2026-09-26T08:30:00Z', note: 'Report submitted' },
      { stage: 'Under Review', completedAt: '2026-09-26T09:00:00Z', note: 'Escalated immediately' },
      { stage: 'Accepted', completedAt: '2026-09-26T09:30:00Z', note: 'Accepted — critical case' },
      { stage: 'Assigned', completedAt: '2026-09-26T10:00:00Z', note: 'Assigned to Abdullah Ziyad' },
      { stage: 'In Progress', completedAt: '2026-09-26T11:00:00Z', note: 'Water testing underway' },
    ],
    activity: [
      { time: '2026-09-26T08:30:00Z', action: 'Report submitted by citizen Almaz Girma' },
      { time: '2026-09-26T09:00:00Z', action: 'Report escalated to Under Review — critical case' },
      { time: '2026-09-26T09:30:00Z', action: 'Report accepted by institution' },
      { time: '2026-09-26T10:00:00Z', action: 'Assigned to Abdullah Ziyad — Water Services' },
      { time: '2026-09-26T11:00:00Z', action: 'Field team deployed for water quality testing' },
    ],
    resolution: null,
  },
];

export const mockInstitutions = [
  { id: 1, name: 'Jimma Water Service', type: 'Water & Sanitation' },
  { id: 2, name: 'Road Maintenance Office', type: 'Infrastructure' },
  { id: 3, name: 'Waste Management Authority', type: 'Environment' },
  { id: 4, name: 'Jimma Electricity Service', type: 'Utilities' },
  { id: 5, name: 'Jimma City Administration', type: 'General Administration' },
  { id: 6, name: 'Health & Environment Office', type: 'Public Health' },
];

export const departments = [
  'Water Services',
  'Road Maintenance',
  'Waste Management',
  'Electricity Service',
  'Administration',
  'Public Health',
  'Engineering',
];
