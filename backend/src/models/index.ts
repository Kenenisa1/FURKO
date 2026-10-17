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
  citizen_id?: string | null;
  user_id?: string | null;
  category_id: string;
  location_id: string;
  current_institution_id?: string | null;
  institution_id?: string | null;
  title: string;
  description: string;
  photo_url?: string;
  urgency?: UrgencyLevel;
  priority?: string;
  status: ReportStatus;
  verification_status?: 'pending' | 'verified' | 'rejected';
  resolution_information?: string | null;
  is_fallback?: boolean;
  citizen_confirmed?: boolean;
  citizen_confirmed_at?: Date | null;
  reopen_reason?: string | null;
  submitted_at: Date;
  resolved_at?: Date | null;
  updated_at: Date;
}

export interface StatusHistoryEntry {
  id: string;
  report_id: string;
  changed_by_user_id?: string | null;
  actor_name?: string | null;
  actor_role?: UserRole | 'system';
  previous_status?: ReportStatus | null;
  new_status: ReportStatus;
  comment?: string | null;
  changed_at: Date;
}

export interface FeedbackRecord {
  id: string;
  report_id: string;
  citizen_id: string;
  rating: number;
  comment?: string | null;
  created_at: Date;
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

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface RoutingRule {
  id: string;
  category_id: string;
  target_institution_id: string;
  jurisdiction_name: string;
  location_bounds?: string | null; // PostGIS polygon / GeoJSON / WKT
  priority_weight: number;
  is_active: boolean;
  created_at?: Date;
}

export interface RoutingDecision {
  target_institution: {
    id: string;
    name: string;
    code?: string;
  };
  matched_rule_id: string | null;
  is_fallback: boolean;
  routing_reason: string;
  jurisdiction_name?: string | null;
  confidence: 'direct_boundary_match' | 'category_default_match' | 'fallback_review_queue';
}


