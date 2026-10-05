// Core TypeScript interfaces for FURKO Citizen App

export type ProblemCategoryId = 'roads' | 'water' | 'waste' | 'lighting';

export interface ProblemCategory {
  id: string;
  key: ProblemCategoryId;
  name: string;
  nameLocal?: string; // Afaan Oromoo translation
  nameAmharic?: string; // Amharic translation
  description: string;
  icon: string;
  color: string;
  examples: string[];
  subIssues?: string[];
  keywords?: string[];
  responsibleInstitution: string;
}

export type ReportStatus =
  | 'submitted'
  | 'under_review'
  | 'in_progress'
  | 'resolved'
  | 'rejected';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  address_text?: string;
  landmark?: string;
}

export interface RoutedInstitution {
  id: string;
  name: string;
  code?: string;
}

export interface AuditHistoryEntry {
  id: string;
  status: ReportStatus;
  changed_at: string;
  actor_role: string;
  comment?: string;
  proof_photo_url?: string;
}

export interface Report {
  id: string;
  tracking_number: string;
  title: string;
  description: string;
  category_id: string;
  category_name: string;
  category_key?: ProblemCategoryId;
  status: ReportStatus;
  latitude: number;
  longitude: number;
  address_text?: string;
  landmark?: string;
  photo_url?: string;
  proof_photo_url?: string;
  resolution_notes?: string;
  institution_name?: string;
  is_fallback?: boolean;
  submitted_at: string;
  resolved_at?: string;
  user_rating?: number;
  user_feedback?: string;
  urgency?: 'low' | 'medium' | 'high' | 'emergency';
  sub_issue?: string;
  audit_history?: AuditHistoryEntry[];
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  role: 'citizen' | 'staff' | 'admin';
  phone_verified?: boolean;
  subcity?: string;
  kebele?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

export interface SubmitReportPayload {
  category_id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address_text?: string;
  landmark?: string;
  photo_url?: string;
  urgency?: 'low' | 'medium' | 'high' | 'emergency';
  sub_issue?: string;
}

export interface SubmitFeedbackPayload {
  rating: number; // 1-5
  comment?: string;
}
