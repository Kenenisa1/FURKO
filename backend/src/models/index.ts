// Core TypeScript models and interfaces for FURKO Backend

export type UserRole = 'citizen' | 'staff' | 'admin';

export type ReportStatus =
  | 'submitted'
  | 'under_review'
  | 'in_progress'
  | 'resolved'
  | 'rejected'
  | 'reopened';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';

export interface Institution {
  id: string;
  name: string;
  code: string;
  description?: string;
  contact_email: string;
  contact_phone?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  institution_id?: string | null;
  full_name: string;
  email: string;
  phone_number?: string | null;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  default_priority?: string;
  is_active: boolean;
  created_at: Date;
}

export interface LocationRecord {
  id: string;
  latitude: number;
  longitude: number;
  address_text?: string;
  landmark?: string;
  created_at: Date;
}

export interface Report {
  id: string;
  tracking_number: string;
  user_id?: string | null;
  category_id: string;
  location_id: string;
  institution_id?: string | null;
  title: string;
  description: string;
  photo_url?: string;
  urgency: UrgencyLevel;
  status: ReportStatus;
  created_at: Date;
  updated_at: Date;
}

export type AttachmentType = 'evidence' | 'resolution_proof';

export interface Attachment {
  id: string;
  report_id?: string | null;
  uploaded_by_user_id?: string | null;
  file_name: string;
  original_name: string;
  file_url: string;
  file_type: AttachmentType;
  mime_type: string;
  file_size: number;
  created_at: Date;
}

