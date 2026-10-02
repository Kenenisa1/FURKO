import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import {
  AuthResponse,
  Report,
  SubmitFeedbackPayload,
  SubmitReportPayload,
} from '../types';

// Android emulator uses 10.0.2.2, iOS simulator uses localhost, physical devices use LAN IP
const DEFAULT_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5000/api/v1',
  ios: 'http://localhost:5000/api/v1',
  default: 'http://localhost:5000/api/v1',
});

const apiClient = axios.create({
  baseURL: DEFAULT_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Bearer token to every request
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('furko_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Ignore SecureStore read errors
  }
  return config;
});

// --- In-Memory Mock Store for Offline / Preview Mode ---
// Ensures the citizen app runs beautifully even when backend is not started
const mockReports: Report[] = [
  {
    id: 'rep-001',
    tracking_number: 'FRK-2026-0814',
    title: 'Severe road pothole near Aba Jifar Palace entrance',
    description: 'Deep road cavity causing severe traffic backup and risk of vehicle damage.',
    category_id: 'cat-roads-001',
    category_name: 'Roads & Streets',
    category_key: 'roads',
    status: 'in_progress',
    latitude: 7.67341,
    longitude: 36.83441,
    address_text: 'Jimma Aba Jifar Road, Kebele 04',
    landmark: 'Opposite Aba Jifar Palace gate',
    institution_name: 'Jimma City Road & Infrastructure Development Bureau',
    submitted_at: '2026-09-24T08:15:30Z',
    audit_history: [
      {
        id: 'aud-1',
        status: 'submitted',
        changed_at: '2026-09-24T08:15:30Z',
        actor_role: 'citizen',
        comment: 'Report created with GPS coordinates.',
      },
      {
        id: 'aud-2',
        status: 'under_review',
        changed_at: '2026-09-24T08:20:00Z',
        actor_role: 'system',
        comment: 'Automatically dispatched via Direct Routing Rule Engine to Road Bureau.',
      },
      {
        id: 'aud-3',
        status: 'in_progress',
        changed_at: '2026-09-24T09:30:00Z',
        actor_role: 'staff',
        comment: 'Assigned to Road Maintenance Crew 2. Work scheduled.',
      },
    ],
  },
  {
    id: 'rep-002',
    tracking_number: 'FRK-2026-0815',
    title: 'Clean water pipe burst causing road flooding',
    description: 'High-pressure water gushing from underground pipe, wasting clean water.',
    category_id: 'cat-water-002',
    category_name: 'Water & Sewerage',
    category_key: 'water',
    status: 'resolved',
    latitude: 7.67891,
    longitude: 36.8312,
    address_text: 'Mendera Kebele 02, near Stadium',
    landmark: 'Behind Jimma Stadium',
    institution_name: 'Jimma City Water & Sewerage Authority',
    submitted_at: '2026-09-20T10:00:00Z',
    resolved_at: '2026-09-21T14:30:00Z',
    resolution_notes: 'Replaced 2-inch PVC main connection and sealed surrounding roadbed.',
    user_rating: 5,
    user_feedback: 'Repaired within 24 hours. Excellent response!',
    audit_history: [
      {
        id: 'aud-21',
        status: 'submitted',
        changed_at: '2026-09-20T10:00:00Z',
        actor_role: 'citizen',
      },
      {
        id: 'aud-22',
        status: 'under_review',
        changed_at: '2026-09-20T10:05:00Z',
        actor_role: 'system',
      },
      {
        id: 'aud-23',
        status: 'in_progress',
        changed_at: '2026-09-20T11:00:00Z',
        actor_role: 'staff',
      },
      {
        id: 'aud-24',
        status: 'resolved',
        changed_at: '2026-09-21T14:30:00Z',
        actor_role: 'staff',
        comment: 'Pipe replaced and water pressure restored.',
      },
    ],
  },
  {
    id: 'rep-003',
    tracking_number: 'FRK-2026-0816',
    title: 'Overflowing public dumpster blocking pedestrian walkway',
    description: 'Solid waste uncollected for over 2 weeks, generating bad odor and health hazard.',
    category_id: 'cat-waste-003',
    category_name: 'Waste Management',
    category_key: 'waste',
    status: 'under_review',
    latitude: 7.6698,
    longitude: 36.8399,
    address_text: 'Hermata Market area, Kebele 06',
    landmark: 'Next to Hermata Primary School',
    institution_name: 'Jimma City Sanitation & Waste Management Office',
    submitted_at: '2026-09-28T07:45:00Z',
    audit_history: [
      {
        id: 'aud-31',
        status: 'submitted',
        changed_at: '2026-09-28T07:45:00Z',
        actor_role: 'citizen',
      },
      {
        id: 'aud-32',
        status: 'under_review',
        changed_at: '2026-09-28T07:46:00Z',
        actor_role: 'system',
        comment: 'Routed to Sanitation Office inbox.',
      },
    ],
  },
];

// Helper to generate human-readable tracking number
export const generateTrackingNumber = (): string => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `FRK-2026-${random}`;
};

// API Services
export const ReportsApi = {
  getMyReports: async (): Promise<Report[]> => {
    try {
      const response = await apiClient.get('/reports/my');
      return response.data.data;
    } catch {
      // Return mock data for seamless testing/preview
      return mockReports;
    }
  },

  getReportById: async (id: string): Promise<Report | undefined> => {
    try {
      const response = await apiClient.get(`/reports/${id}`);
      return response.data.data;
    } catch {
      return mockReports.find((r) => r.id === id);
    }
  },

  submitReport: async (payload: SubmitReportPayload): Promise<Report> => {
    try {
      const response = await apiClient.post('/reports', payload);
      return response.data.data;
    } catch {
      // Mock creation
      const categoryMap: Record<string, string> = {
        'cat-roads-001': 'Jimma City Road & Infrastructure Development Bureau',
        'cat-water-002': 'Jimma City Water & Sewerage Authority',
        'cat-waste-003': 'Jimma City Sanitation & Waste Management Office',
        'cat-lighting-004': 'Ethiopian Electric Utility (EEU) – Jimma Branch',
      };

      const newReport: Report = {
        id: `rep-${Date.now()}`,
        tracking_number: generateTrackingNumber(),
        title: payload.title,
        description: payload.description,
        category_id: payload.category_id,
        category_name: 'Civic Issue',
        status: 'submitted',
        latitude: payload.latitude,
        longitude: payload.longitude,
        address_text: payload.address_text || 'Jimma City, Ethiopia',
        landmark: payload.landmark,
        photo_url: payload.photo_url,
        institution_name: categoryMap[payload.category_id] || 'Admin Fallback Queue',
        is_fallback: false,
        submitted_at: new Date().toISOString(),
        audit_history: [
          {
            id: `aud-${Date.now()}`,
            status: 'submitted',
            changed_at: new Date().toISOString(),
            actor_role: 'citizen',
            comment: 'Report submitted successfully.',
          },
        ],
      };
      mockReports.unshift(newReport);
      return newReport;
    }
  },

  submitFeedback: async (
    reportId: string,
    payload: SubmitFeedbackPayload
  ): Promise<boolean> => {
    try {
      await apiClient.post(`/reports/${reportId}/feedback`, payload);
      return true;
    } catch {
      const report = mockReports.find((r) => r.id === reportId);
      if (report) {
        report.user_rating = payload.rating;
        report.user_feedback = payload.comment;
      }
      return true;
    }
  },
};

export default apiClient;
